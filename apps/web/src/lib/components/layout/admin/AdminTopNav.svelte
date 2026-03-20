<script lang='ts'>
  import type { AdminMenuNode } from '$lib/admin/routes'
  import { buttonVariants } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { translate as t } from '$lib/stores/i18n'
  import { cn } from '$lib/utils'
  import {
    BookOpenText,
    ChevronRight,
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
</script>

{#snippet renderDropdownNodes(menuNodes: ReadonlyArray<AdminMenuNode>)}
  {#each menuNodes as node (node.id)}
    {#if node.children?.length}
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger class='px-2.5 py-2 text-sm'>
          <span>{t(node.titleKey)}</span>
        </DropdownMenu.SubTrigger>
        <DropdownMenu.SubContent>
          {@render renderDropdownNodes(node.children)}
        </DropdownMenu.SubContent>
      </DropdownMenu.Sub>
    {:else if node.path}
      <DropdownMenu.Item class='px-2.5 py-2 text-sm' onclick={() => onnavigate(node.path!)}>
        <span>{t(node.titleKey)}</span>
      </DropdownMenu.Item>
    {/if}
  {/each}
{/snippet}

<div class='flex flex-wrap items-center gap-1.5'>
  {#each nodes as node (node.id)}
    {@const Icon = node.icon ? iconMap[node.icon] : null}
    {@const active = node.path === activePath || Boolean(node.children?.some(child => child.path === activePath || child.children?.some(grand => grand.path === activePath)))}

    {#if node.children?.length}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          class={cn(
            buttonVariants({ variant: active ? 'secondary' : 'ghost', size: 'sm' }),
            `h-8 rounded-[7px] px-2.5 text-[12px] font-medium ${active ? 'bg-brand/10 text-brand' : 'text-muted-foreground'}`,
          )}
        >
          {#if Icon}
            <Icon class='size-4' />
          {/if}
          <span>{t(node.titleKey)}</span>
          <ChevronRight class='size-3.5 rotate-90' />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align='start' sideOffset={8}>
          {@render renderDropdownNodes(node.children)}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {:else if node.path}
      <button
        type='button'
        class={cn(
          buttonVariants({ variant: active ? 'secondary' : 'ghost', size: 'sm' }),
          `h-8 rounded-[7px] px-2.5 text-[12px] font-medium ${active ? 'bg-brand/10 text-brand' : 'text-muted-foreground'}`,
        )}
        onclick={() => onnavigate(node.path!)}
      >
        {#if Icon}
          <Icon class='size-4' />
        {/if}
        <span>{t(node.titleKey)}</span>
      </button>
    {/if}
  {/each}
</div>
