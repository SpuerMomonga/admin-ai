<script lang='ts'>
  import type { Snippet } from 'svelte'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import AdminColumn from '$lib/components/layout/AdminColumn.svelte'
  import ChatColumn from '$lib/components/layout/ChatColumn.svelte'
  import ColumnResizeHandle from '$lib/components/layout/ColumnResizeHandle.svelte'
  import TaskRail from '$lib/components/layout/TaskRail.svelte'
  import { activateRoute, adminTabsStore, openAdminPath, resolveAdminPathFromPathname } from '$lib/stores/admin-tabs'
  import { translate as t } from '$lib/stores/i18n'
  import { getNavigationSnapshot, navigationStore, setColumnWidth, setLeftCollapsed, setRightCollapsed } from '$lib/stores/navigation'
  import { sessionStore } from '$lib/stores/session'

  const { children } = $props<{ children: Snippet }>()

  let containerElement = $state<HTMLElement | null>(null)
  let containerWidth = $state(0)

  const minDesktopLeftWidth = 180
  const minDesktopRightWidth = 280
  const desktopMinMiddleWidth = 420
  const desktopHandleWidth = 12

  const taskId = $derived(page.url.searchParams.get('taskId'))
  const adminPath = $derived(
    resolveAdminPathFromPathname(page.url.pathname) ?? $adminTabsStore.activeAdminPath,
  )

  $effect(() => {
    if (browser && !$sessionStore.isLoggedIn) {
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
      openAdminPath(nextAdminPath)
    }
  })

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
  }

  const workspaceMeasured = $derived(containerWidth > 0)
  const visibleHandleCount = $derived(Number(!$navigationStore.leftCollapsed) + Number(!$navigationStore.rightCollapsed))
  const usableWidth = $derived(Math.max(containerWidth - desktopHandleWidth * visibleHandleCount, 0))
  const leftPaneWidth = $derived.by(() => {
    if ($navigationStore.leftCollapsed) {
      return 0
    }

    const maxLeft = Math.min(420, usableWidth - ($navigationStore.rightCollapsed ? 0 : $navigationStore.columnWidths.right) - desktopMinMiddleWidth)
    return clamp($navigationStore.columnWidths.left, 180, Math.max(180, maxLeft))
  })
  const rightPaneWidth = $derived.by(() => {
    if ($navigationStore.rightCollapsed) {
      return 0
    }

    const leftWidth = $navigationStore.leftCollapsed ? 0 : leftPaneWidth
    const maxRight = Math.min(usableWidth * 0.8, usableWidth - leftWidth - desktopMinMiddleWidth)
    return clamp($navigationStore.columnWidths.right, 280, Math.max(280, maxRight))
  })

  function beginResize(side: 'left' | 'right', event: PointerEvent) {
    if (!browser || !containerElement || window.innerWidth < 960) {
      return
    }

    event.preventDefault()

    const startX = event.clientX
    const snapshot = getNavigationSnapshot()
    const { columnWidths } = snapshot
    const startLeft = columnWidths.left
    const startRight = columnWidths.right
    const activeHandleCount = Number(!snapshot.leftCollapsed) + Number(!snapshot.rightCollapsed)
    const totalWidth = containerElement.getBoundingClientRect().width - desktopHandleWidth * activeHandleCount

    const onMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX

      if (side === 'left') {
        const attemptedLeftWidth = startLeft + delta

        if (attemptedLeftWidth < minDesktopLeftWidth) {
          setLeftCollapsed(true)
          return
        }

        const maxLeft = Math.min(420, totalWidth - startRight - desktopMinMiddleWidth)
        setLeftCollapsed(false)
        setColumnWidth('left', clamp(attemptedLeftWidth, minDesktopLeftWidth, maxLeft))
        return
      }

      const currentLeftWidth = getNavigationSnapshot().leftCollapsed ? 0 : startLeft
      const maxRight = Math.min(totalWidth * 0.8, totalWidth - currentLeftWidth - desktopMinMiddleWidth)
      const attemptedRightWidth = startRight - delta

      if (attemptedRightWidth < minDesktopRightWidth) {
        setRightCollapsed(true)
        return
      }

      setRightCollapsed(false)
      const nextRightWidth = clamp(attemptedRightWidth, minDesktopRightWidth, maxRight)

      setColumnWidth('right', nextRightWidth)

      const isExpandingRightPane = delta < 0

      if (isExpandingRightPane && !getNavigationSnapshot().leftCollapsed && nextRightWidth / totalWidth > 0.5) {
        setLeftCollapsed(true)
      }
    }

    const onUp = () => {
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
    {#if !$navigationStore.leftCollapsed}
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

    {#if !$navigationStore.rightCollapsed}
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
        <span class='text-sm text-muted-foreground'>{t('workspace_loading')}</span>
      </div>
    </div>
  {/if}
</section>
