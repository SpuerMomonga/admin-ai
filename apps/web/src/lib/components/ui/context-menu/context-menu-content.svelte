<script lang='ts'>
  import type { WithoutChildrenOrChild } from '$lib/utils'
  import type { ComponentProps } from 'svelte'
  import { cn } from '$lib/utils'
  import { ContextMenu as ContextMenuPrimitive } from 'bits-ui'
  import ContextMenuPortal from './context-menu-portal.svelte'

  let {
    ref = $bindable(null),
    portalProps,
    class: className,
    ...restProps
  }: ContextMenuPrimitive.ContentProps & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof ContextMenuPortal>>
  } = $props()
</script>

<ContextMenuPortal {...portalProps}>
  <ContextMenuPrimitive.Content
    bind:ref
    data-slot='context-menu-content'
    class={cn(
      'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-shell-elevated text-popover-foreground z-50 min-w-36 overflow-x-hidden overflow-y-auto rounded-[10px] border border-shell-border p-1.5 shadow-[0_20px_40px_rgba(15,23,42,0.18)] outline-none backdrop-blur-xl duration-100',
      className,
    )}
    {...restProps}
  />
</ContextMenuPortal>
