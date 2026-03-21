<script lang='ts'>
  import { goto } from '$app/navigation'
  import * as ContextMenu from '$lib/components/ui/context-menu'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import {
    buildWorkspacePath,
    closeAdminPath,
    closeAdminPathsByDirection,
    closeAdminSplit,
    closeOtherAdminPaths,
    getAdminTabsSnapshot,
    maximizeAdminPath,
    openAdminPath,
    pinAdminPath,
    reorderAdminPaths,
    restoreAdminPath,
    splitAdminPath,
    unpinAdminPath,
  } from '$lib/stores/admin-tabs'
  import { translate as t } from '$lib/stores/i18n'
  import { Pin, X } from '@lucide/svelte'

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

  function isPinned(path: string) {
    return pinnedPaths.includes(path)
  }

  async function syncRoute(replaceState = false) {
    await goto(buildWorkspacePath(taskId, getAdminTabsSnapshot().activeAdminPath), { replaceState })
  }

  async function openTabPath(path: string) {
    openAdminPath(path)
    await syncRoute()
  }

  async function closeTabPath(path: string) {
    closeAdminPath(path)
    await syncRoute(true)
  }

  async function handleMenuAction(action: string, path: string) {
    if (action === 'close') {
      await closeTabPath(path)
      return
    }

    if (action === 'close-left') {
      closeAdminPathsByDirection(path, 'left')
      await syncRoute(true)
      return
    }

    if (action === 'close-right') {
      closeAdminPathsByDirection(path, 'right')
      await syncRoute(true)
      return
    }

    if (action === 'close-others') {
      closeOtherAdminPaths(path)
      await syncRoute(true)
      return
    }

    if (action === 'pin') {
      pinAdminPath(path)
      return
    }

    if (action === 'unpin') {
      unpinAdminPath(path)
      return
    }

    if (action === 'maximize') {
      maximizeAdminPath(path)
      await syncRoute()
      return
    }

    if (action === 'restore') {
      restoreAdminPath()
      return
    }

    if (action === 'split') {
      splitAdminPath(path)
      return
    }

    if (action === 'unsplit') {
      closeAdminSplit()
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

    reorderAdminPaths(draggingTabPath, path)
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

<ScrollArea class='w-full whitespace-nowrap' viewportClass='pb-1' scrollbars='horizontal'>
  <div class='flex items-center gap-1.5'>
    {#each paths as path}
      {@const active = path === activePath}
      {@const pinned = isPinned(path)}
      <ContextMenu.Root>
        <ContextMenu.Trigger
          draggable='true'
          class={`group inline-flex shrink-0 items-center gap-1 rounded-[7px] border px-2 py-1 text-[11px] font-medium transition ${active ? 'border-brand/25 bg-brand/10 text-brand' : 'border-shell-border/80 bg-shell-muted-panel/88 text-muted-foreground hover:border-brand/18 hover:bg-brand/5 hover:text-foreground'} ${splitPath === path ? 'ring-1 ring-brand/14' : ''} ${draggingTabPath === path ? 'opacity-60' : ''}`}
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
              class='inline-flex size-4 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition hover:bg-shell-surface hover:text-foreground group-hover:opacity-100'
              aria-label={t('admin_tab_close')}
              onclick={(event) => {
                event.stopPropagation()
                void closeTabPath(path)
              }}
            >
              <X class='size-3' />
            </button>
          {/if}
        </ContextMenu.Trigger>

        <ContextMenu.Content class='w-55'>
          <ContextMenu.Item disabled={pinned} onclick={() => void handleMenuAction('close', path)}>{t('admin_tab_close')}</ContextMenu.Item>
          <ContextMenu.Item disabled={closableCount(path, 'left') === 0} onclick={() => void handleMenuAction('close-left', path)}>{t('admin_tab_close_left')}</ContextMenu.Item>
          <ContextMenu.Item disabled={closableCount(path, 'right') === 0} onclick={() => void handleMenuAction('close-right', path)}>{t('admin_tab_close_right')}</ContextMenu.Item>
          <ContextMenu.Item onclick={() => void handleMenuAction('close-others', path)}>{t('admin_tab_close_others')}</ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item onclick={() => void handleMenuAction(pinned ? 'unpin' : 'pin', path)}>{pinned ? t('admin_tab_unpin') : t('admin_tab_pin')}</ContextMenu.Item>
          <ContextMenu.Item onclick={() => void handleMenuAction(maximizedPath === path ? 'restore' : 'maximize', path)}>{maximizedPath === path ? t('admin_tab_restore') : t('admin_tab_maximize')}</ContextMenu.Item>
          <ContextMenu.Item onclick={() => void handleMenuAction(splitPath === path ? 'unsplit' : 'split', path)}>{splitPath === path ? t('admin_tab_unsplit') : t('admin_tab_split')}</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    {/each}
  </div>
</ScrollArea>
