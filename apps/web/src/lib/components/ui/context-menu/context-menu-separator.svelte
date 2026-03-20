<script lang='ts'>
  import { cn } from '$lib/utils.js'
  import { ContextMenu as ContextMenuPrimitive } from 'bits-ui'

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: ContextMenuPrimitive.SeparatorProps = $props()
</script>

<ContextMenuPrimitive.Separator
  bind:ref
  data-slot='context-menu-separator'
  class={cn('bg-shell-border -mx-1.5 my-1 h-px', className)}
  {...restProps}
/>
