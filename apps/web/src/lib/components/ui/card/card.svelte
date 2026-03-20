<script lang='ts'>
  import type { WithElementRef } from '$lib/utils.js'
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils.js'

  let {
    ref = $bindable(null),
    class: className,
    children,
    size = 'default',
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & { size?: 'default' | 'sm' } = $props()
</script>

<div
  bind:this={ref}
  data-slot='card'
  data-size={size}
  class={cn('group/card flex flex-col gap-5 overflow-hidden rounded-[12px] border border-shell-border bg-shell-surface py-4 text-sm text-card-foreground shadow-[0_8px_20px_rgba(15,23,42,0.05)] has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-3 *:[img:first-child]:rounded-t-[12px] *:[img:last-child]:rounded-b-[12px]', className)}
  {...restProps}
>
  {@render children?.()}
</div>
