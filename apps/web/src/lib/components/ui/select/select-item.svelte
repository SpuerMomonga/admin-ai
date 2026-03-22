<script lang='ts'>
  import type { WithoutChild } from '$lib/utils'
  import { cn } from '$lib/utils'
  import CheckIcon from '@lucide/svelte/icons/check'
  import { Select as SelectPrimitive } from 'bits-ui'

  let {
    ref = $bindable(null),
    class: className,
    value,
    label,
    children: childrenProp,
    ...restProps
  }: WithoutChild<SelectPrimitive.ItemProps> = $props()
</script>

<SelectPrimitive.Item
  bind:ref
  {value}
  data-slot='select-item'
  class={cn(
    'relative flex w-full cursor-default items-center gap-2 rounded-[8px] py-2 pr-8 pl-2.5 text-sm text-foreground outline-hidden select-none transition-colors data-highlighted:bg-brand/[0.08] data-highlighted:text-foreground focus:bg-brand/[0.08] focus:text-foreground not-data-[variant=destructive]:focus:**:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*=\'size-\'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2',
    className,
  )}
  {...restProps}
>
  {#snippet children({ selected, highlighted })}
    <span class='absolute end-2 flex size-4 items-center justify-center'>
      {#if selected}
        <CheckIcon class='size-3.5 text-brand' />
      {/if}
    </span>
    {#if childrenProp}
      {@render childrenProp({ selected, highlighted })}
    {:else}
      <span class={cn(selected ? 'font-semibold text-brand' : highlighted ? 'text-foreground' : 'text-foreground/92')}>
        {label || value}
      </span>
    {/if}
  {/snippet}
</SelectPrimitive.Item>
