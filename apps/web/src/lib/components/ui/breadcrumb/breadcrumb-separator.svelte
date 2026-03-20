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
  aria-hidden='true'
  data-slot='breadcrumb-separator'
  class={cn('text-muted-foreground/70', className)}
  {...restProps}
>
  {#if children}
    {@render children()}
  {:else}
    /
  {/if}
</span>
