<script lang='ts'>
  import type { WithoutChildrenOrChild } from '$lib/utils'
  import { cn } from '$lib/utils'
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down'
  import { Select as SelectPrimitive } from 'bits-ui'

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: WithoutChildrenOrChild<SelectPrimitive.ScrollDownButtonProps> = $props()
</script>

<SelectPrimitive.ScrollDownButton
  bind:ref
  data-slot='select-scroll-down-button'
  class={cn('bg-shell-elevated/96 text-muted-foreground z-10 flex h-7 cursor-default items-center justify-center border-t border-shell-border/70 [&_svg:not([class*=\'size-\'])]:size-3.5 bottom-0 w-full', className)}
  {...restProps}
>
  <ChevronDownIcon />
</SelectPrimitive.ScrollDownButton>
