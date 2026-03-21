<script lang='ts'>
  import type { WithoutChildrenOrChild } from '$lib/utils.js'
  import { cn } from '$lib/utils.js'
  import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui'

  let {
    ref = $bindable(null),
    class: className,
    orientation = 'vertical',
    ...restProps
  }: WithoutChildrenOrChild<ScrollAreaPrimitive.ScrollbarProps> = $props()
</script>

<ScrollAreaPrimitive.Scrollbar
  bind:ref
  data-slot='scroll-area-scrollbar'
  {orientation}
  class={cn(
    'group/scrollbar flex touch-none select-none rounded-full p-px transition-[width,height,background-color,box-shadow] duration-150 ease-out',
    orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent bg-transparent hover:w-4.5 hover:bg-brand hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_0_0_1px_rgba(0,78,162,0.24)]',
    orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent bg-transparent hover:h-4.5 hover:bg-brand hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_0_0_1px_rgba(0,78,162,0.24)]',
    className,
  )}
  {...restProps}
>
  <ScrollAreaPrimitive.Thumb
    data-slot='scroll-area-thumb'
    class='relative flex-1 rounded-full bg-shell-border shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition-[background-color,box-shadow] duration-150 group-hover/scrollbar:bg-brand-foreground group-hover/scrollbar:shadow-[inset_0_0_0_1px_rgba(0,78,162,0.12),0_0_10px_rgba(0,78,162,0.22)]'
  />
</ScrollAreaPrimitive.Scrollbar>
