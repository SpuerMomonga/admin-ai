<script lang='ts'>
  import type { WithoutChildrenOrChild } from '$lib/utils.js'
  import { cn } from '$lib/utils.js'
  import ChevronUpIcon from '@lucide/svelte/icons/chevron-up'
  import { Select as SelectPrimitive } from 'bits-ui'

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: WithoutChildrenOrChild<SelectPrimitive.ScrollUpButtonProps> = $props()
</script>

<SelectPrimitive.ScrollUpButton
  bind:ref
  data-slot='select-scroll-up-button'
  class={cn('bg-shell-elevated/96 text-muted-foreground z-10 flex h-7 cursor-default items-center justify-center border-b border-shell-border/70 [&_svg:not([class*=\'size-\'])]:size-3.5 top-0 w-full', className)}
  {...restProps}
>
  <ChevronUpIcon />
</SelectPrimitive.ScrollUpButton>
