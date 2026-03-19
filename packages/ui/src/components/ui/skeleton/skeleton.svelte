<script lang='ts'>
  import type { HTMLAttributes } from 'svelte/elements'
  import type { WithElementRef, WithoutChildren } from '../../../utils.js'
  import { cn } from '../../../utils.js'

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
