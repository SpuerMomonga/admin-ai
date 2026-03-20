<script lang='ts'>
  import type { WithElementRef } from '$lib/utils'
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> = $props()
</script>

<span
  bind:this={ref}
  aria-current='page'
  data-slot='breadcrumb-page'
  class={cn('truncate font-medium text-foreground', className)}
  {...restProps}
>
  {@render children?.()}
</span>
