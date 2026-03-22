<script lang='ts'>
  import type { WithoutChildrenOrChild } from '$lib/utils'
  import { cn } from '$lib/utils'
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
    'group/scrollbar flex touch-none select-none bg-transparent p-px transition-[width,height,background-color,box-shadow,padding] duration-150 ease-out',
    orientation === 'vertical'
      ? 'h-full w-2 hover:w-3.5 hover:bg-(--scrollbar-track) hover:p-[2.5px] hover:shadow-[inset_0_0_0_1px_var(--scrollbar-track-border)]'
      : undefined,
    orientation === 'horizontal'
      ? 'h-2 flex-col hover:h-3.5 hover:bg-(--scrollbar-track) hover:p-[2.5px] hover:shadow-[inset_0_0_0_1px_var(--scrollbar-track-border)]'
      : undefined,
    className,
  )}
  {...restProps}
>
  <ScrollAreaPrimitive.Thumb
    data-slot='scroll-area-thumb'
    class='relative flex-1 rounded-full bg-(--scrollbar-thumb) shadow-[inset_0_0_0_1px_var(--scrollbar-thumb-edge)] transition-[background-color,box-shadow] duration-150 ease-out group-hover/scrollbar:bg-(--scrollbar-thumb-hover)'
  />
</ScrollAreaPrimitive.Scrollbar>
