<script lang='ts'>
  import type { AdminPanel } from '$lib/stores/app-shell'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import AdminColumn from '$lib/components/workspace/AdminColumn.svelte'
  import ChatColumn from '$lib/components/workspace/ChatColumn.svelte'
  import ColumnResizeHandle from '$lib/components/workspace/ColumnResizeHandle.svelte'
  import TaskRail from '$lib/components/workspace/TaskRail.svelte'
  import { translate as t } from '$lib/i18n'
  import { appShell, resolveAdminPanelFromPathname } from '$lib/stores/app-shell'

  const { children } = $props()
  let containerElement = $state<HTMLElement | null>(null)
  let containerWidth = $state(0)

  const minDesktopLeftWidth = 180
  const minDesktopRightWidth = 280
  const desktopMinMiddleWidth = 420
  const desktopHandleWidth = 12

  const taskId = $derived(page.url.searchParams.get('taskId'))
  const panel = $derived(
    resolveAdminPanelFromPathname(page.url.pathname)
      ? resolveAdminPanelFromPathname(page.url.pathname)
      : $appShell.activePanel,
  )

  $effect(() => {
    if (browser && !$appShell.isLoggedIn) {
      void goto('/login', { replaceState: true })
    }
  })

  $effect(() => {
    const nextTaskId = page.url.searchParams.get('taskId')
    const nextPanel = resolveAdminPanelFromPathname(page.url.pathname)

    if (nextTaskId && nextPanel) {
      appShell.activateRoute(nextTaskId, nextPanel)
      return
    }

    if (nextPanel) {
      appShell.openPanel(nextPanel)
    }
  })

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
  }

  const workspaceMeasured = $derived(containerWidth > 0)
  const visibleHandleCount = $derived(Number(!$appShell.leftCollapsed) + Number(!$appShell.rightCollapsed))
  const usableWidth = $derived(Math.max(containerWidth - desktopHandleWidth * visibleHandleCount, 0))
  const leftPaneWidth = $derived.by(() => {
    if ($appShell.leftCollapsed) {
      return 0
    }

    const maxLeft = Math.min(420, usableWidth - ($appShell.rightCollapsed ? 0 : $appShell.columnWidths.right) - desktopMinMiddleWidth)
    return clamp($appShell.columnWidths.left, 180, Math.max(180, maxLeft))
  })
  const rightPaneWidth = $derived.by(() => {
    if ($appShell.rightCollapsed) {
      return 0
    }

    const leftWidth = $appShell.leftCollapsed ? 0 : leftPaneWidth
    const maxRight = Math.min(usableWidth * 0.8, usableWidth - leftWidth - desktopMinMiddleWidth)
    return clamp($appShell.columnWidths.right, 280, Math.max(280, maxRight))
  })

  function beginResize(side: 'left' | 'right', event: PointerEvent) {
    if (!browser || !containerElement || window.innerWidth < 960) {
      return
    }

    event.preventDefault()

    const startX = event.clientX
    const snapshot = appShell.getSnapshot()
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
          appShell.setLeftCollapsed(true)
          return
        }

        const maxLeft = Math.min(420, totalWidth - startRight - desktopMinMiddleWidth)
        appShell.setLeftCollapsed(false)
        appShell.setColumnWidth('left', clamp(attemptedLeftWidth, minDesktopLeftWidth, maxLeft))
        return
      }

      const currentLeftWidth = appShell.getSnapshot().leftCollapsed ? 0 : startLeft
      const maxRight = Math.min(totalWidth * 0.8, totalWidth - currentLeftWidth - desktopMinMiddleWidth)
      const attemptedRightWidth = startRight - delta

      if (attemptedRightWidth < minDesktopRightWidth) {
        appShell.setRightCollapsed(true)
        return
      }

      appShell.setRightCollapsed(false)
      const nextRightWidth = clamp(attemptedRightWidth, minDesktopRightWidth, maxRight)

      appShell.setColumnWidth('right', nextRightWidth)

      const isExpandingRightPane = delta < 0

      if (isExpandingRightPane && !appShell.getSnapshot().leftCollapsed && nextRightWidth / totalWidth > 0.5) {
        appShell.setLeftCollapsed(true)
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

<section
  bind:this={containerElement}
  bind:clientWidth={containerWidth}
  class='workspace-shell relative h-dvh w-full overflow-hidden'
  aria-busy={!workspaceMeasured}
>
  <div class={`flex h-full w-full overflow-hidden ${workspaceMeasured ? '' : 'invisible'}`}>
    {#if !$appShell.leftCollapsed}
      <div
        class='h-full min-h-0 shrink-0 overflow-hidden'
        style={`width:${leftPaneWidth}px;`}
      >
        <TaskRail taskId={taskId} panel={panel as AdminPanel} />
      </div>

      <ColumnResizeHandle
        title='Resize task rail'
        onpointerdown={event => beginResize('left', event)}
      />
    {/if}

    <div class='h-full min-h-0 min-w-0 flex-1 overflow-hidden'>
      <ChatColumn taskId={taskId} panel={panel as AdminPanel} />
    </div>

    {#if !$appShell.rightCollapsed}
      <ColumnResizeHandle
        title='Resize admin panel'
        onpointerdown={event => beginResize('right', event)}
      />

      <div
        class='h-full min-h-0 shrink-0 overflow-hidden'
        style={`width:${rightPaneWidth}px;`}
      >
        <AdminColumn taskId={taskId} panel={panel as AdminPanel}>
          {@render children()}
        </AdminColumn>
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
