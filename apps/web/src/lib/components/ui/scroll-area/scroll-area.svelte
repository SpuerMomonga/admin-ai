<script lang='ts'>
  import type { WithoutChildrenOrChild } from '$lib/utils'
  import type { Snippet } from 'svelte'
  import { cn } from '$lib/utils'
  import { ScrollArea as ScrollAreaPrimitive } from 'bits-ui'
  import ScrollBar from './scroll-area-scrollbar.svelte'

  type Scrollbars = 'vertical' | 'horizontal' | 'both'

  let {
    ref = $bindable(null),
    class: className,
    viewportClass,
    scrollbarClass,
    type = 'hover',
    scrollHideDelay = 140,
    scrollbars = 'both',
    children,
    ...restProps
  }: WithoutChildrenOrChild<ScrollAreaPrimitive.RootProps> & {
    viewportClass?: string
    scrollbarClass?: string
    type?: ScrollAreaPrimitive.RootProps['type']
    scrollbars?: Scrollbars
    children: Snippet
  } = $props()
</script>

<ScrollAreaPrimitive.Root
  bind:ref
  {type}
  {scrollHideDelay}
  data-slot='scroll-area'
  class={cn('relative min-h-0 min-w-0 overflow-hidden', className)}
  {...restProps}
>
  <ScrollAreaPrimitive.Viewport
    data-slot='scroll-area-viewport'
    class={cn(
      'size-full rounded-[inherit] focus-visible:outline-none *:data-scroll-area-content:block *:data-scroll-area-content:min-h-full *:data-scroll-area-content:min-w-full',
      viewportClass,
    )}
  >
    {@render children?.()}
  </ScrollAreaPrimitive.Viewport>

  {#if scrollbars === 'vertical' || scrollbars === 'both'}
    <ScrollBar orientation='vertical' class={scrollbarClass} />
  {/if}

  {#if scrollbars === 'horizontal' || scrollbars === 'both'}
    <ScrollBar orientation='horizontal' class={scrollbarClass} />
  {/if}

  {#if scrollbars === 'both'}
    <ScrollAreaPrimitive.Corner data-slot='scroll-area-corner' class='bg-transparent' />
  {/if}
</ScrollAreaPrimitive.Root>
