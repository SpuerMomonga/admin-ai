<script lang='ts'>
  import type { WithoutChild } from '$lib/utils.js'
  import { cn } from '$lib/utils.js'
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down'
  import { Select as SelectPrimitive } from 'bits-ui'

  let {
    ref = $bindable(null),
    class: className,
    children,
    size = 'default',
    ...restProps
  }: WithoutChild<SelectPrimitive.TriggerProps> & {
    size?: 'sm' | 'default'
  } = $props()
</script>

<SelectPrimitive.Trigger
  bind:ref
  data-slot='select-trigger'
  data-size={size}
  class={cn(
    'flex w-fit items-center justify-between gap-1.5 whitespace-nowrap rounded-[8px] border border-shell-border/90 bg-shell-surface/96 py-2 pr-2 pl-2.5 text-sm text-foreground shadow-none outline-none transition-[color,box-shadow,border-color,background-color] hover:border-brand/18 hover:bg-brand/[0.035] focus-visible:border-brand/30 focus-visible:ring-2 focus-visible:ring-brand/12 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*=\'size-\'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 data-[size=default]:h-9 data-[size=sm]:h-8',
    className,
  )}
  {...restProps}
>
  {@render children?.()}
  <ChevronDownIcon class='size-3.5 pointer-events-none text-muted-foreground/85' />
</SelectPrimitive.Trigger>
