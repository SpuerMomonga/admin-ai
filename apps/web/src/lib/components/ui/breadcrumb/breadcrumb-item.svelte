<script lang='ts'>
  import type { WithElementRef } from '$lib/utils'
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLLIElement>, HTMLLIElement> = $props()
</script>

<li
  bind:this={ref}
  data-slot='breadcrumb-item'
  class={cn('inline-flex min-w-0 items-center gap-1.5', className)}
  {...restProps}
>
  {@render children?.()}
</li>
