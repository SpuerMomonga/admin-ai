<script lang='ts'>
  import type { WithoutChild, WithoutChildrenOrChild } from '$lib/utils.js'
  import type { ComponentProps } from 'svelte'
  import { cn } from '$lib/utils.js'
  import { Select as SelectPrimitive } from 'bits-ui'
  import SelectPortal from './select-portal.svelte'
  import SelectScrollDownButton from './select-scroll-down-button.svelte'
  import SelectScrollUpButton from './select-scroll-up-button.svelte'

  let {
    ref = $bindable(null),
    class: className,
    sideOffset = 4,
    portalProps,
    children,
    preventScroll = true,
    ...restProps
  }: WithoutChild<SelectPrimitive.ContentProps> & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SelectPortal>>
  } = $props()
</script>

<SelectPortal {...portalProps}>
  <SelectPrimitive.Content
    bind:ref
    {sideOffset}
    {preventScroll}
    data-slot='select-content'
    class={cn(
      'relative isolate z-50 min-w-32 overflow-x-hidden overflow-y-auto rounded-[10px] border border-shell-border/90 bg-shell-elevated/98 text-popover-foreground shadow-[0_16px_34px_rgba(15,23,42,0.14)] backdrop-blur-xl duration-100 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2',
      className,
    )}
    {...restProps}
  >
    <SelectScrollUpButton />
    <SelectPrimitive.Viewport
      class={cn(
        'h-(--bits-select-anchor-height) w-full min-w-(--bits-select-anchor-width) p-1.5',
      )}
    >
      {@render children?.()}
    </SelectPrimitive.Viewport>
    <SelectScrollDownButton />
  </SelectPrimitive.Content>
</SelectPortal>
