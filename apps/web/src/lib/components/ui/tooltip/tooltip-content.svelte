<script lang='ts'>
  import type { WithoutChildrenOrChild } from '$lib/utils.js'
  import type { ComponentProps } from 'svelte'
  import { cn } from '$lib/utils.js'
  import { Tooltip as TooltipPrimitive } from 'bits-ui'
  import TooltipPortal from './tooltip-portal.svelte'

  let {
    ref = $bindable(null),
    class: className,
    sideOffset = 0,
    side = 'top',
    children,
    portalProps,
    ...restProps
  }: TooltipPrimitive.ContentProps & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof TooltipPortal>>
  } = $props()
</script>

<TooltipPortal {...portalProps}>
  <TooltipPrimitive.Content
    bind:ref
    data-slot='tooltip-content'
    {sideOffset}
    {side}
    class={cn(
      'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--bits-tooltip-content-transform-origin) overflow-hidden rounded-md border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950',
      className,
    )}
    {...restProps}
  >
    {@render children?.()}
  </TooltipPrimitive.Content>
</TooltipPortal>
