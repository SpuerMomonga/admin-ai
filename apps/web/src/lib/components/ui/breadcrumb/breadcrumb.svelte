<script lang='ts'>
  import type { WithElementRef } from '$lib/utils'
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>, HTMLElement> = $props()
</script>

<nav
  bind:this={ref}
  aria-label='Breadcrumb'
  data-slot='breadcrumb'
  class={cn('w-full', className)}
  {...restProps}
>
  {@render children?.()}
</nav>
