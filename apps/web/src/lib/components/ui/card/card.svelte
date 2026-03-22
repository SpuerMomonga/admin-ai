<script lang='ts'>
  import type { WithElementRef } from '$lib/utils'
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

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
  class={cn('group/card flex flex-col gap-4 overflow-hidden rounded-[8px] border border-shell-border bg-shell-surface py-3.5 text-sm text-card-foreground shadow-[0_6px_16px_rgba(15,23,42,0.045)] has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-2.5 *:[img:first-child]:rounded-t-[8px] *:[img:last-child]:rounded-b-[8px]', className)}
  {...restProps}
>
  {@render children?.()}
</div>
