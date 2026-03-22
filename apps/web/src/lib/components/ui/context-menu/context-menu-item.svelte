<script lang='ts'>
  import { cn } from '$lib/utils'
  import { ContextMenu as ContextMenuPrimitive } from 'bits-ui'

  let {
    ref = $bindable(null),
    class: className,
    inset,
    variant = 'default',
    ...restProps
  }: ContextMenuPrimitive.ItemProps & {
    inset?: boolean
    variant?: 'default' | 'destructive'
  } = $props()
</script>

<ContextMenuPrimitive.Item
  bind:ref
  data-slot='context-menu-item'
  data-inset={inset}
  data-variant={variant}
  class={cn(
    'data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive group/context-menu-item relative flex cursor-default items-center gap-2 rounded-[8px] px-2.5 py-2 text-sm outline-hidden select-none transition-colors focus:bg-brand/[0.08] focus:text-foreground data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg:not([class*=\'size-\'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    className,
  )}
  {...restProps}
/>
