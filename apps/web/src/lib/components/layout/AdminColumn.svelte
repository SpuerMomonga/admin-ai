<script lang='ts'>
  import type { AdminMenuNode } from '$lib/admin/routes'
  import type { Snippet } from 'svelte'
  import { goto } from '$app/navigation'
  import { adminMenuTree, formatAdminRouteFallbackTitle, getAdminRouteTitleKey } from '$lib/admin/routes'
  import AdminBreadcrumb from '$lib/components/layout/admin/AdminBreadcrumb.svelte'
  import AdminPageRenderer from '$lib/components/layout/admin/AdminPageRenderer.svelte'
  import AdminSidebarNav from '$lib/components/layout/admin/AdminSidebarNav.svelte'
  import AdminTabBar from '$lib/components/layout/admin/AdminTabBar.svelte'
  import AdminTopNav from '$lib/components/layout/admin/AdminTopNav.svelte'
  import { Button } from '$lib/components/ui/button'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import { Separator } from '$lib/components/ui/separator'
  import TooltipButton from '$lib/components/ui/tooltip-button.svelte'
  import {
    openAdminPath as activateAdminPath,
    adminTabsStore,
    buildWorkspacePath,
    closeAdminSplit,
    maximizeAdminPath,
    orderAdminPaths,
    restoreAdminPath,
    swapAdminSplit,
  } from '$lib/stores/admin-tabs'
  import { translate as t } from '$lib/stores/i18n'
  import { navigationStore, toggleRightCollapsed } from '$lib/stores/navigation'
  import { systemPreferencesStore } from '$lib/stores/preferences'
  import {
    BookOpenText,
    Columns2,
    LoaderCircle,
    Maximize2,
    Minimize2,
    PanelRightClose,
    PanelRightOpen,
    RotateCcw,
    Settings2,
    SquareSplitHorizontal,
  } from '@lucide/svelte'

  const {
    taskId,
    adminPath,
    routeChildren,
  } = $props<{
    taskId: string | null
    adminPath: string
    routeChildren?: Snippet
  }>()

  const currentAdminPath = $derived($adminTabsStore.activeAdminPath)
  const orderedAdminTabs = $derived(orderAdminPaths($adminTabsStore.visitedAdminPaths, $adminTabsStore.pinnedAdminPaths))
  const splitAdminPath = $derived($adminTabsStore.adminSplitPath)
  const maximizedAdminPath = $derived($adminTabsStore.adminMaximizedPath)
  const adminNavMode = $derived($systemPreferencesStore.adminNavigationMode)
  let refreshVersionByPath = $state<Record<string, number>>({})
  let refreshingByPath = $state<Record<string, boolean>>({})

  function getAdminTitle(path: string) {
    const titleKey = getAdminRouteTitleKey(path)
    return titleKey ? t(titleKey) : formatAdminRouteFallbackTitle(path)
  }

  function getNodeDefaultPath(node: AdminMenuNode): string | null {
    if (node.path) {
      return node.path
    }

    if (!node.children) {
      return null
    }

    for (const child of node.children) {
      const nextPath = getNodeDefaultPath(child)

      if (nextPath) {
        return nextPath
      }
    }

    return null
  }

  async function syncAdminRoute(replaceState = false) {
    const nextAdminPath = $adminTabsStore.activeAdminPath

    if (nextAdminPath === adminPath) {
      return
    }

    await goto(buildWorkspacePath(taskId, nextAdminPath), { replaceState })
  }

  async function openAdminPath(path: string) {
    activateAdminPath(path)
    await syncAdminRoute()
  }

  function refreshPage(path: string) {
    refreshingByPath = {
      ...refreshingByPath,
      [path]: true,
    }
    refreshVersionByPath = {
      ...refreshVersionByPath,
      [path]: (refreshVersionByPath[path] ?? 0) + 1,
    }

    window.setTimeout(() => {
      refreshingByPath = {
        ...refreshingByPath,
        [path]: false,
      }
    }, 650)
  }
</script>

{#snippet renderPrimaryRouteContent(path: string)}
  {#if routeChildren && path === adminPath}
    {#key `${path}:${refreshVersionByPath[path] ?? 0}`}
      <div class='relative min-h-full'>
        {@render routeChildren()}
      </div>
    {/key}
  {:else}
    <AdminPageRenderer path={path} refreshKey={refreshVersionByPath[path] ?? 0} />
  {/if}
{/snippet}

{#snippet headerControls()}
  <div class='flex items-center gap-1.5'>
    {#if splitAdminPath}
      <TooltipButton
        content={t('admin_tab_unsplit')}
        class='shell-panel-toggle-button'
        aria-label={t('admin_tab_unsplit')}
        onclick={closeAdminSplit}
      >
        <SquareSplitHorizontal class='size-4' />
      </TooltipButton>
    {/if}

    {#if maximizedAdminPath}
      <TooltipButton
        content={t('admin_tab_restore')}
        class='shell-panel-toggle-button'
        aria-label={t('admin_tab_restore')}
        onclick={restoreAdminPath}
      >
        <Minimize2 class='size-4' />
      </TooltipButton>
    {/if}

    <TooltipButton
      content={t('collapse_right')}
      class='shell-panel-toggle-button'
      aria-label={t('collapse_right')}
      onclick={toggleRightCollapsed}
    >
      <PanelRightClose class='size-4' />
    </TooltipButton>
  </div>
{/snippet}

{#snippet refreshButton(path: string)}
  <TooltipButton
    content={t('admin_page_refresh')}
    class='shell-panel-toggle-button'
    aria-label={t('admin_page_refresh')}
    onclick={() => refreshPage(path)}
  >
    {#if refreshingByPath[path]}
      <LoaderCircle class='size-4 animate-spin' />
    {:else}
      <RotateCcw class='size-4' />
    {/if}
  </TooltipButton>
{/snippet}

{#snippet pageViewport()}
  <div class='min-h-0 flex-1 pt-2'>
    {#if splitAdminPath}
      <div class='flex h-full min-h-0 gap-2'>
        <section class='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
          <header class='flex items-center justify-between border-b border-shell-border px-1 py-2'>
            <div class='min-w-0'>
              <p class='truncate text-sm font-semibold text-foreground'>{getAdminTitle(currentAdminPath)}</p>
              <p class='text-[11px] text-muted-foreground'>{t('admin_split_primary')}</p>
            </div>

            <Button
              variant='ghost'
              size='icon-xs'
              aria-label={t('admin_tab_maximize')}
              onclick={() => {
                maximizeAdminPath(currentAdminPath)
                void syncAdminRoute()
              }}
            >
              <Maximize2 class='size-3.5' />
            </Button>
          </header>

          <ScrollArea class='min-h-0 flex-1' scrollbars='vertical'>
            {@render renderPrimaryRouteContent(currentAdminPath)}
          </ScrollArea>
        </section>

        <Separator orientation='vertical' class='bg-shell-border/80' />

        <section class='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
          <header class='flex items-center justify-between border-b border-shell-border px-1 py-2'>
            <div class='min-w-0'>
              <p class='truncate text-sm font-semibold text-foreground'>{getAdminTitle(splitAdminPath)}</p>
              <p class='text-[11px] text-muted-foreground'>{t('admin_split_secondary')}</p>
            </div>

            <div class='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='icon-xs'
                aria-label={t('admin_split_focus')}
                onclick={() => {
                  swapAdminSplit()
                  void syncAdminRoute()
                }}
              >
                <Columns2 class='size-3.5' />
              </Button>
              <Button
                variant='ghost'
                size='icon-xs'
                aria-label={t('admin_tab_maximize')}
                onclick={() => {
                  maximizeAdminPath(splitAdminPath)
                  void syncAdminRoute()
                }}
              >
                <Maximize2 class='size-3.5' />
              </Button>
            </div>
          </header>

          <ScrollArea class='min-h-0 flex-1' scrollbars='vertical'>
            <AdminPageRenderer path={splitAdminPath} refreshKey={refreshVersionByPath[splitAdminPath] ?? 0} />
          </ScrollArea>
        </section>
      </div>
    {:else}
      <ScrollArea class='h-full min-h-0' scrollbars='vertical'>
        {@render renderPrimaryRouteContent(currentAdminPath)}
      </ScrollArea>
    {/if}
  </div>
{/snippet}

<section class={`workspace-pane workspace-right-pane h-full min-h-0 ${$navigationStore.rightCollapsed ? 'flex w-full flex-col items-center gap-2 px-1.5 py-2 xl:w-14' : 'flex min-w-0 flex-col overflow-hidden px-2 py-2'}`}>
  {#if !$navigationStore.rightCollapsed}
    {#if adminNavMode === 'sidebar'}
      <div class='flex min-h-0 flex-1 flex-col overflow-hidden'>
        <header class='pb-2'>
          <div class='flex items-center justify-between gap-3'>
            <div class='flex min-w-0 items-center gap-2'>
              {@render refreshButton(currentAdminPath)}
              <AdminBreadcrumb path={currentAdminPath} onnavigate={openAdminPath} />
            </div>
            {@render headerControls()}
          </div>
        </header>

        <Separator class='mb-2 bg-shell-border/80' />

        <div class='flex min-h-0 flex-1 gap-2'>
          <AdminSidebarNav nodes={adminMenuTree} activePath={currentAdminPath} onnavigate={openAdminPath} />
          <Separator orientation='vertical' class='bg-shell-border/80' />

          <div class='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
            <div class='pb-2'>
              <AdminTabBar
                {taskId}
                paths={orderedAdminTabs}
                activePath={currentAdminPath}
                splitPath={splitAdminPath}
                maximizedPath={maximizedAdminPath}
                pinnedPaths={$adminTabsStore.pinnedAdminPaths}
                getTitle={getAdminTitle}
              />
            </div>
            <Separator />
            {@render pageViewport()}
          </div>
        </div>
      </div>
    {:else}
      <div class='flex min-h-0 flex-1 flex-col overflow-hidden'>
        <header class='pb-2'>
          <div class='flex items-center justify-between gap-3'>
            <div class='flex min-w-0 items-center gap-2'>
              {@render refreshButton(currentAdminPath)}
              <AdminTopNav nodes={adminMenuTree} activePath={currentAdminPath} onnavigate={openAdminPath} />
            </div>
            {@render headerControls()}
          </div>
          <Separator class='mt-2' />
          <div class='pt-2'>
            <AdminTabBar
              {taskId}
              paths={orderedAdminTabs}
              activePath={currentAdminPath}
              splitPath={splitAdminPath}
              maximizedPath={maximizedAdminPath}
              pinnedPaths={$adminTabsStore.pinnedAdminPaths}
              getTitle={getAdminTitle}
            />
          </div>
        </header>

        {@render pageViewport()}
      </div>
    {/if}
  {:else}
    <TooltipButton
      content={t('expand_right')}
      class='shell-panel-toggle-button'
      aria-label={t('expand_right')}
      onclick={toggleRightCollapsed}
    >
      <PanelRightOpen class='size-4' />
    </TooltipButton>

    <div class='flex flex-col gap-2'>
      {#each adminMenuTree as node}
        {@const targetPath = getNodeDefaultPath(node)}
        {@const isActiveBranch = targetPath === currentAdminPath || ('children' in node && node.children.some(child => getNodeDefaultPath(child) === currentAdminPath))}
        {#if targetPath}
          <Button
            variant={isActiveBranch ? 'default' : 'outline'}
            size='icon-sm'
            class='rounded-[7px]'
            title={t(node.titleKey)}
            onclick={() => openAdminPath(targetPath)}
          >
            {#if node.icon === 'dashboard'}
              <Columns2 class='size-4' />
            {:else if node.icon === 'settings'}
              <Settings2 class='size-4' />
            {:else if node.icon === 'models'}
              <Columns2 class='size-4' />
            {:else}
              <BookOpenText class='size-4' />
            {/if}
          </Button>
        {/if}
      {/each}
    </div>
  {/if}
</section>

{#if maximizedAdminPath}
  <div class='fixed inset-0 z-80 bg-shell-canvas/96 backdrop-blur-xl'>
    <section class='flex h-full flex-col px-0 py-0'>
      <header class='flex items-center justify-between border-b border-shell-border bg-shell-panel px-3 py-2'>
        <div class='flex min-w-0 items-center gap-2'>
          {@render refreshButton(maximizedAdminPath)}
          <AdminTopNav nodes={adminMenuTree} activePath={maximizedAdminPath} onnavigate={openAdminPath} />
        </div>

        <Button
          variant='outline'
          size='icon-sm'
          aria-label={t('admin_tab_restore')}
          onclick={restoreAdminPath}
        >
          <Minimize2 class='size-4' />
        </Button>
      </header>

      <ScrollArea class='min-h-0 flex-1' scrollbars='vertical'>
        <AdminPageRenderer path={maximizedAdminPath} refreshKey={refreshVersionByPath[maximizedAdminPath] ?? 0} />
      </ScrollArea>
    </section>
  </div>
{/if}
