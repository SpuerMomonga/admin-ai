<script lang='ts'>
  import type { AdminMenuNode } from '$lib/admin/routes'
  import { buildAdminMenuItems } from '$lib/admin/menu-items'
  import { Menu } from '$lib/components/ui/menu'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import TooltipButton from '$lib/components/ui/tooltip-button.svelte'
  import { m } from '$lib/paraglide/messages'
  import { appStateStore, toggleAdminSidebarCollapsed } from '$lib/stores/app-state'
  import {
    PanelLeftClose,
    PanelLeftOpen,
  } from '@lucide/svelte'

  const {
    nodes,
    activePath,
    onnavigate,
  }: {
    nodes: ReadonlyArray<AdminMenuNode>
    activePath: string
    onnavigate: (path: string) => void
  } = $props()

  let expandedIds = $state<string[]>([])
  let syncedActivePath = $state<string | null>(null)
  const menuItems = $derived(buildAdminMenuItems(nodes, { clickable: false }))

  function collectAncestors(path: string, menuNodes: ReadonlyArray<AdminMenuNode>, trail: string[] = []): string[] | null {
    for (const node of menuNodes) {
      const nextTrail = [...trail, node.id]

      if (node.path === path) {
        return trail
      }

      if (node.children) {
        const nested = collectAncestors(path, node.children, nextTrail)

        if (nested) {
          return nested
        }
      }
    }

    return null
  }

  $effect(() => {
    if (syncedActivePath === activePath) {
      return
    }

    syncedActivePath = activePath
    const ancestorIds = collectAncestors(activePath, nodes) ?? []
    expandedIds = Array.from(new Set([...expandedIds, ...ancestorIds]))
  })
</script>

<aside class={`flex h-full min-h-0 shrink-0 flex-col overflow-hidden bg-transparent ${$appStateStore.adminSidebarCollapsed ? 'w-9 items-center' : 'w-44'}`}>
  <ScrollArea class='min-h-0 w-full flex-1' viewportClass='px-0 py-1' scrollbars='vertical'>
    <Menu
      items={menuItems}
      mode='inline'
      inlineCollapsed={$appStateStore.adminSidebarCollapsed}
      inlineIndent={11}
      openKeys={expandedIds}
      selectedKeys={[activePath]}
      tooltip={{
        side: 'right',
        sideOffset: 10,
      }}
      triggerSubMenuAction='hover'
      onOpenChange={(nextOpenKeys) => {
        if ($appStateStore.adminSidebarCollapsed) {
          return
        }

        expandedIds = nextOpenKeys
      }}
      onClick={({ key }) => {
        if (key.startsWith('/')) {
          onnavigate(key)
        }
      }}
    />
  </ScrollArea>

  <div class={`w-full border-t border-shell-border/70 pt-2 ${$appStateStore.adminSidebarCollapsed ? 'px-0' : ''}`}>
    {#if $appStateStore.adminSidebarCollapsed}
      <div class='flex justify-center'>
        <TooltipButton
          content={m.expand_admin_sidebar()}
          class='inline-flex size-7 items-center justify-center rounded-[8px] text-muted-foreground transition hover:bg-muted hover:text-foreground'
          aria-label={m.expand_admin_sidebar()}
          onclick={toggleAdminSidebarCollapsed}
        >
          <PanelLeftOpen class='size-4' />
        </TooltipButton>
      </div>
    {:else}
      <button
        type='button'
        class='inline-flex h-8 w-full items-center justify-start gap-2 rounded-[7px] px-2 text-[12px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground'
        aria-label={m.collapse_admin_sidebar()}
        onclick={toggleAdminSidebarCollapsed}
      >
        <PanelLeftClose class='size-4 shrink-0' />
        <span class='truncate'>{m.collapse_admin_sidebar()}</span>
      </button>
    {/if}
  </div>
</aside>
