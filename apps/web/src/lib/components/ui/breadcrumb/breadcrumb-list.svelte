<script lang='ts'>
  import type { WithElementRef } from '$lib/utils'
  import type { HTMLOlAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLOlAttributes> = $props()
</script>

<ol
  bind:this={ref}
  data-slot='breadcrumb-list'
  class={cn('flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground', className)}
  {...restProps}
>
  {@render children?.()}
</ol>
