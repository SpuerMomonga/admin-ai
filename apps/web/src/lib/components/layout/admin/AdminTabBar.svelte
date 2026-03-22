<script lang='ts'>
  import { goto } from '$app/navigation'
  import * as ContextMenu from '$lib/components/ui/context-menu'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import { m } from '$lib/paraglide/messages.js'
  import {
    buildWorkspacePath,
    closeOtherTabs,
    closeSplitTab,
    closeTab,
    closeTabsByDirection,
    getTabsSnapshot,
    maximizeTab,
    openTab,
    pinTab,
    reorderTabs,
    restoreTab,
    splitTab,
    unpinTab,
  } from '$lib/stores/tabs'
  import {
    ChevronsLeft,
    ChevronsLeftRight,
    ChevronsRight,
    Maximize2,
    Minimize2,
    Pin,
    PinOff,
    SquareSplitHorizontal,
    X,
  } from '@lucide/svelte'

  const {
    taskId,
    paths,
    activePath,
    splitPath,
    maximizedPath,
    pinnedPaths,
    getTitle,
  }: {
    taskId: string | null
    paths: string[]
    activePath: string
    splitPath: string | null
    maximizedPath: string | null
    pinnedPaths: string[]
    getTitle: (path: string) => string
  } = $props()

  let draggingTabPath = $state<string | null>(null)
  const tabMenuItemClass = 'px-2 py-1.5 text-[13px]'

  function isPinned(path: string) {
    return pinnedPaths.includes(path)
  }

  async function syncRoute(replaceState = false) {
    await goto(buildWorkspacePath(taskId, getTabsSnapshot().activeAdminPath), { replaceState })
  }

  async function openTabPath(path: string) {
    openTab(path)
    await syncRoute()
  }

  async function closeTabPath(path: string) {
    closeTab(path)
    await syncRoute(true)
  }

  async function handleMenuAction(action: string, path: string) {
    if (action === 'close') {
      await closeTabPath(path)
      return
    }

    if (action === 'close-left') {
      closeTabsByDirection(path, 'left')
      await syncRoute(true)
      return
    }

    if (action === 'close-right') {
      closeTabsByDirection(path, 'right')
      await syncRoute(true)
      return
    }

    if (action === 'close-others') {
      closeOtherTabs(path)
      await syncRoute(true)
      return
    }

    if (action === 'pin') {
      pinTab(path)
      return
    }

    if (action === 'unpin') {
      unpinTab(path)
      return
    }

    if (action === 'maximize') {
      maximizeTab(path)
      await syncRoute()
      return
    }

    if (action === 'restore') {
      restoreTab()
      return
    }

    if (action === 'split') {
      splitTab(path)
      return
    }

    if (action === 'unsplit') {
      closeSplitTab()
    }
  }

  function beginDrag(path: string) {
    draggingTabPath = path
  }

  function endDrag() {
    draggingTabPath = null
  }

  function dropOn(path: string) {
    if (!draggingTabPath || draggingTabPath === path) {
      draggingTabPath = null
      return
    }

    reorderTabs(draggingTabPath, path)
    draggingTabPath = null
  }

  function closableCount(path: string, direction: 'left' | 'right') {
    const index = paths.indexOf(path)

    if (index === -1) {
      return 0
    }

    const candidates = direction === 'left'
      ? paths.slice(0, index)
      : paths.slice(index + 1)

    return candidates.filter(candidate => !isPinned(candidate)).length
  }
</script>

<ScrollArea class='w-full whitespace-nowrap' viewportClass='py-0.5' scrollbars='horizontal'>
  <div class='flex items-center gap-1.5'>
    {#each paths as path}
      {@const active = path === activePath}
      {@const pinned = isPinned(path)}
      {@const closeLeftDisabled = closableCount(path, 'left') === 0}
      {@const closeRightDisabled = closableCount(path, 'right') === 0}
      {@const maximized = maximizedPath === path}
      {@const split = splitPath === path}
      <ContextMenu.Root>
        <ContextMenu.Trigger
          draggable='true'
          class={`group inline-flex shrink-0 items-center gap-1 rounded-[7px] border px-2 py-1 text-[11px] font-medium transition ${active ? 'border-brand/25 bg-brand/10 text-brand' : 'border-shell-border/80 bg-shell-muted-panel/88 text-muted-foreground hover:border-brand/18 hover:bg-brand/5 hover:text-foreground'} ${split ? 'ring-1 ring-brand/14' : ''} ${draggingTabPath === path ? 'opacity-60' : ''}`}
          ondragstart={() => beginDrag(path)}
          ondragend={endDrag}
          ondragover={event => event.preventDefault()}
          ondrop={() => dropOn(path)}
        >
          <button type='button' class='inline-flex min-w-0 items-center gap-1.5' onclick={() => openTabPath(path)}>
            {#if pinned}
              <Pin class='size-3 text-brand/80' />
            {/if}
            <span class='truncate'>{getTitle(path)}</span>
          </button>

          {#if !pinned}
            <button
              type='button'
              class='inline-flex size-4 items-center justify-center rounded-lg text-muted-foreground/75 transition hover:bg-shell-surface hover:text-foreground'
              aria-label={m.admin_tab_close()}
              onclick={(event) => {
                event.stopPropagation()
                void closeTabPath(path)
              }}
            >
              <X class='size-3' />
            </button>
          {/if}
        </ContextMenu.Trigger>

        <ContextMenu.Content class='min-w-max whitespace-nowrap p-1'>
          <ContextMenu.Item class={tabMenuItemClass} disabled={pinned} onclick={() => void handleMenuAction('close', path)}>
            <X class='size-4' />
            <span>{m.admin_tab_close()}</span>
          </ContextMenu.Item>
          <ContextMenu.Item class={tabMenuItemClass} disabled={closeLeftDisabled} onclick={() => void handleMenuAction('close-left', path)}>
            <ChevronsLeft class='size-4' />
            <span>{m.admin_tab_close_left()}</span>
          </ContextMenu.Item>
          <ContextMenu.Item class={tabMenuItemClass} disabled={closeRightDisabled} onclick={() => void handleMenuAction('close-right', path)}>
            <ChevronsRight class='size-4' />
            <span>{m.admin_tab_close_right()}</span>
          </ContextMenu.Item>
          <ContextMenu.Item class={tabMenuItemClass} onclick={() => void handleMenuAction('close-others', path)}>
            <ChevronsLeftRight class='size-4' />
            <span>{m.admin_tab_close_others()}</span>
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item class={tabMenuItemClass} onclick={() => void handleMenuAction(pinned ? 'unpin' : 'pin', path)}>
            {#if pinned}
              <PinOff class='size-4' />
              <span>{m.admin_tab_unpin()}</span>
            {:else}
              <Pin class='size-4' />
              <span>{m.admin_tab_pin()}</span>
            {/if}
          </ContextMenu.Item>
          <ContextMenu.Item class={tabMenuItemClass} onclick={() => void handleMenuAction(maximized ? 'restore' : 'maximize', path)}>
            {#if maximized}
              <Minimize2 class='size-4' />
              <span>{m.admin_tab_restore()}</span>
            {:else}
              <Maximize2 class='size-4' />
              <span>{m.admin_tab_maximize()}</span>
            {/if}
          </ContextMenu.Item>
          <ContextMenu.Item class={tabMenuItemClass} onclick={() => void handleMenuAction(split ? 'unsplit' : 'split', path)}>
            <SquareSplitHorizontal class='size-4' />
            <span>{split ? m.admin_tab_unsplit() : m.admin_tab_split()}</span>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    {/each}
  </div>
</ScrollArea>
