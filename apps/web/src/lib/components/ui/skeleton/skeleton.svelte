<script lang='ts'>
  import type { WithElementRef, WithoutChildren } from '$lib/utils'
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> = $props()
</script>

<div
  bind:this={ref}
  data-slot='skeleton'
  class={cn('bg-muted rounded-md animate-pulse', className)}
  {...restProps}
></div>
