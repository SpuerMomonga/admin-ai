<script lang='ts'>
  import type { WithoutChildrenOrChild } from '$lib/utils.js'
  import type { ComponentProps } from 'svelte'
  import { cn } from '$lib/utils.js'
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui'
  import DropdownMenuPortal from './dropdown-menu-portal.svelte'

  let {
    ref = $bindable(null),
    sideOffset = 4,
    align = 'start',
    portalProps,
    class: className,
    ...restProps
  }: DropdownMenuPrimitive.ContentProps & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DropdownMenuPortal>>
  } = $props()
</script>

<DropdownMenuPortal {...portalProps}>
  <DropdownMenuPrimitive.Content
    bind:ref
    data-slot='dropdown-menu-content'
    {sideOffset}
    {align}
    class={cn(
      'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-shell-elevated text-popover-foreground z-50 min-w-36 w-(--bits-dropdown-menu-anchor-width) overflow-x-hidden overflow-y-auto rounded-[10px] border border-shell-border p-1.5 shadow-[0_20px_40px_rgba(15,23,42,0.18)] duration-100 data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 outline-none backdrop-blur data-closed:overflow-hidden',
      className,
    )}
    {...restProps}
  />
</DropdownMenuPortal>
