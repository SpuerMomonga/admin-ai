<script lang='ts'>
  import type { WithElementRef } from '$lib/utils'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  let {
    ref = $bindable(null),
    class: className,
    type = 'button',
    children,
    ...restProps
  }: WithElementRef<HTMLButtonAttributes> = $props()
</script>

<button
  bind:this={ref}
  data-slot='breadcrumb-link'
  {type}
  class={cn('transition hover:text-foreground', className)}
  {...restProps}
>
  {@render children?.()}
</button>
