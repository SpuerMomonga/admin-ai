<script lang='ts'>
  import type { AdminMenuNode } from '$lib/admin/routes'
  import { Button } from '$lib/components/ui/button'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import { translate as t } from '$lib/stores/i18n'
  import {
    BookOpenText,
    ChevronDown,
    Columns2,
    Layers3,
    Settings2,
    ShieldCheck,
    UserRound,
  } from '@lucide/svelte'

  const iconMap = {
    dashboard: Columns2,
    user: UserRound,
    models: Layers3,
    knowledge: BookOpenText,
    rules: ShieldCheck,
    settings: Settings2,
  } as const

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

  function isExpanded(id: string) {
    return expandedIds.includes(id)
  }

  function setExpanded(id: string, expanded: boolean) {
    expandedIds = expanded
      ? Array.from(new Set([...expandedIds, id]))
      : expandedIds.filter(item => item !== id)
  }

  function toggleExpanded(id: string) {
    setExpanded(id, !isExpanded(id))
  }

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

{#snippet renderNodes(menuNodes: ReadonlyArray<AdminMenuNode>, level: number)}
  {#each menuNodes as node (node.id)}
    {@const Icon = node.icon ? iconMap[node.icon] : null}
    {@const active = node.path === activePath}

    {#if node.children?.length}
      <div class='grid gap-1'>
        <Button
          variant='ghost'
          size='sm'
          class={`h-8 w-full justify-between rounded-[7px] px-2 text-[12px] font-medium ${level > 0 ? 'pl-3' : ''} ${isExpanded(node.id) ? 'bg-brand/6 text-foreground' : 'text-muted-foreground'}`}
          onclick={() => toggleExpanded(node.id)}
        >
          <span class='inline-flex min-w-0 items-center gap-2'>
            {#if Icon}
              <Icon class='size-4 shrink-0' />
            {/if}
            <span class='truncate'>{t(node.titleKey)}</span>
          </span>
          <ChevronDown class={`size-3.5 transition ${isExpanded(node.id) ? 'rotate-180' : ''}`} />
        </Button>

        {#if isExpanded(node.id)}
          <div class={`grid gap-1 ${level === 0 ? 'ml-2 border-l border-shell-border/70 pl-2' : 'ml-2 border-l border-shell-border/50 pl-2'}`}>
            {@render renderNodes(node.children, level + 1)}
          </div>
        {/if}
      </div>
    {:else if node.path}
      <Button
        variant={active ? 'secondary' : 'ghost'}
        size='sm'
        class={`h-8 w-full justify-start rounded-[7px] px-2 text-[12px] font-medium ${level > 0 ? 'pl-3' : ''} ${active ? 'bg-brand/10 text-brand' : 'text-muted-foreground'}`}
        onclick={() => onnavigate(node.path!)}
      >
        {#if Icon}
          <Icon class='size-4 shrink-0' />
        {/if}
        <span class='truncate'>{t(node.titleKey)}</span>
      </Button>
    {/if}
  {/each}
{/snippet}

<aside class='flex h-full min-h-0 w-44 shrink-0 flex-col overflow-hidden bg-transparent'>
  <ScrollArea class='min-h-0 flex-1' viewportClass='px-0 py-1' scrollbars='vertical'>
    <div class='grid gap-0.5'>
      {@render renderNodes(nodes, 0)}
    </div>
  </ScrollArea>
</aside>
