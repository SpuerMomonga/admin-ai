<script lang='ts'>
  import type { Snippet } from 'svelte'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import AdminColumn from '$lib/components/layout/AdminColumn.svelte'
  import ChatColumn from '$lib/components/layout/ChatColumn.svelte'
  import ColumnResizeHandle from '$lib/components/layout/ColumnResizeHandle.svelte'
  import TaskRail from '$lib/components/layout/TaskRail.svelte'
  import { m } from '$lib/paraglide/messages.js'
  import {
    appStateStore,
    endColumnResize,
    getAppStateSnapshot,
    setColumnWidth,
    setLeftCollapsed,
    setRightCollapsed,
    startColumnResize,
    updateResizePointer,
  } from '$lib/stores/app-state'
  import { authStore } from '$lib/stores/auth'
  import { activateRoute, openTab, resolveAdminPathFromPathname, tabsStore } from '$lib/stores/tabs'

  const { children } = $props<{ children: Snippet }>()

  let containerElement = $state<HTMLElement | null>(null)
  let containerWidth = $state(0)

  const minDesktopLeftWidth = 180
  const minDesktopRightWidth = 360
  const rightCollapseThreshold = 400
  const desktopMinMiddleWidth = 420
  const desktopHandleWidth = 12

  const taskId = $derived(page.url.searchParams.get('taskId'))
  const adminPath = $derived(
    resolveAdminPathFromPathname(page.url.pathname) ?? $tabsStore.activeAdminPath,
  )

  $effect(() => {
    if (browser && !$authStore.isLoggedIn) {
      void goto('/login', { replaceState: true })
    }
  })

  $effect(() => {
    const nextTaskId = page.url.searchParams.get('taskId')
    const nextAdminPath = resolveAdminPathFromPathname(page.url.pathname)

    if (nextTaskId && nextAdminPath) {
      activateRoute(nextTaskId, nextAdminPath)
      return
    }

    if (nextAdminPath) {
      openTab(nextAdminPath)
    }
  })

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
  }

  function clampCollapsiblePaneWidth(value: number, preferredMinWidth: number, maxAvailableWidth: number) {
    if (maxAvailableWidth <= 0) {
      return 0
    }

    const minWidth = Math.min(preferredMinWidth, maxAvailableWidth)
    return clamp(value, minWidth, maxAvailableWidth)
  }

  const workspaceMeasured = $derived(containerWidth > 0)
  const visibleHandleCount = $derived(Number(!$appStateStore.leftCollapsed) + Number(!$appStateStore.rightCollapsed))
  const usableWidth = $derived(Math.max(containerWidth - desktopHandleWidth * visibleHandleCount, 0))
  const leftPaneWidth = $derived.by(() => {
    if ($appStateStore.leftCollapsed) {
      return 0
    }

    const maxLeft = Math.min(420, usableWidth - ($appStateStore.rightCollapsed ? 0 : $appStateStore.columnWidths.right) - desktopMinMiddleWidth)
    return clamp($appStateStore.columnWidths.left, minDesktopLeftWidth, Math.max(minDesktopLeftWidth, maxLeft))
  })
  const rightPaneWidth = $derived.by(() => {
    if ($appStateStore.rightCollapsed) {
      return 0
    }

    const leftWidth = $appStateStore.leftCollapsed ? 0 : leftPaneWidth
    const maxRight = Math.min(usableWidth * 0.8, usableWidth - leftWidth - desktopMinMiddleWidth)
    return clampCollapsiblePaneWidth($appStateStore.columnWidths.right, minDesktopRightWidth, maxRight)
  })

  function beginResize(side: 'left' | 'right', event: PointerEvent) {
    if (!browser || !containerElement || window.innerWidth < 960) {
      return
    }

    event.preventDefault()

    const startX = event.clientX
    const snapshot = getAppStateSnapshot()
    const startLeft = snapshot.leftCollapsed ? 0 : leftPaneWidth
    const startRight = snapshot.rightCollapsed ? 0 : rightPaneWidth
    const activeHandleCount = Number(!snapshot.leftCollapsed) + Number(!snapshot.rightCollapsed)
    const totalWidth = containerElement.getBoundingClientRect().width - desktopHandleWidth * activeHandleCount
    startColumnResize(side, startX)

    const onMove = (moveEvent: PointerEvent) => {
      updateResizePointer(moveEvent.clientX)
      const delta = moveEvent.clientX - startX

      if (side === 'left') {
        const attemptedLeftWidth = startLeft + delta

        if (attemptedLeftWidth < minDesktopLeftWidth) {
          setLeftCollapsed(true)
          return
        }

        const maxLeft = Math.min(420, totalWidth - startRight - desktopMinMiddleWidth)

        setLeftCollapsed(false)
        setColumnWidth('left', clamp(attemptedLeftWidth, minDesktopLeftWidth, Math.max(minDesktopLeftWidth, maxLeft)))
        return
      }

      const currentLeftWidth = getAppStateSnapshot().leftCollapsed ? 0 : leftPaneWidth
      const maxRight = Math.min(totalWidth * 0.8, totalWidth - currentLeftWidth - desktopMinMiddleWidth)
      const attemptedRightWidth = startRight - delta

      if (attemptedRightWidth < rightCollapseThreshold) {
        setRightCollapsed(true)
        return
      }

      if (maxRight <= 0) {
        setRightCollapsed(true)
        return
      }

      setRightCollapsed(false)
      const nextRightWidth = clampCollapsiblePaneWidth(attemptedRightWidth, minDesktopRightWidth, maxRight)

      setColumnWidth('right', nextRightWidth)

      const isExpandingRightPane = delta < 0

      if (isExpandingRightPane && !getAppStateSnapshot().leftCollapsed && nextRightWidth / totalWidth > 0.5) {
        setLeftCollapsed(true)
      }
    }

    const onUp = () => {
      endColumnResize()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }
</script>

{#snippet routeChildren()}
  {@render children()}
{/snippet}

<section
  bind:this={containerElement}
  bind:clientWidth={containerWidth}
  class='workspace-shell relative h-dvh w-full overflow-hidden'
  aria-busy={!workspaceMeasured}
>
  <div class={`flex h-full w-full overflow-hidden ${workspaceMeasured ? '' : 'invisible'}`}>
    {#if !$appStateStore.leftCollapsed}
      <div
        class='h-full min-h-0 shrink-0 overflow-hidden'
        style={`width:${leftPaneWidth}px;`}
      >
        <TaskRail taskId={taskId} adminPath={adminPath} />
      </div>

      <ColumnResizeHandle
        title='Resize task rail'
        onpointerdown={event => beginResize('left', event)}
      />
    {/if}

    <div class='h-full min-h-0 min-w-0 flex-1 overflow-hidden'>
      <ChatColumn taskId={taskId} adminPath={adminPath} />
    </div>

    {#if !$appStateStore.rightCollapsed}
      <ColumnResizeHandle
        title='Resize admin panel'
        onpointerdown={event => beginResize('right', event)}
      />

      <div
        class='h-full min-h-0 shrink-0 overflow-hidden'
        style={`width:${rightPaneWidth}px;`}
      >
        <AdminColumn taskId={taskId} adminPath={adminPath} routeChildren={routeChildren} />
      </div>
    {/if}
  </div>

  {#if !workspaceMeasured}
    <div class='absolute inset-0 flex items-center justify-center'>
      <div class='flex items-center gap-3 rounded-[10px] border border-shell-border bg-shell-surface px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]'>
        <span class='relative flex size-2.5'>
          <span class='absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/35'></span>
          <span class='relative inline-flex size-2.5 rounded-full bg-brand'></span>
        </span>
        <span class='text-sm text-muted-foreground'>{m.workspace_loading()}</span>
      </div>
    </div>
  {/if}
</section>
