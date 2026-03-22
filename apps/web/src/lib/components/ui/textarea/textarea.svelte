<script lang='ts'>
  import type { WithElementRef, WithoutChildren } from '$lib/utils'
  import type { HTMLTextareaAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    'data-slot': dataSlot = 'textarea',
    ...restProps
  }: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props()
</script>

<textarea
  bind:this={ref}
  data-slot={dataSlot}
  class={cn(
    'border-shell-border bg-shell-surface text-foreground focus-visible:border-ring focus-visible:ring-ring/60 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-[10px] border px-2.5 py-2 text-sm shadow-none transition-[color,box-shadow,border-color,background-color] focus-visible:ring-2 aria-invalid:ring-2 outline-none placeholder:text-muted-foreground/90 disabled:cursor-not-allowed disabled:opacity-50',
    className,
  )}
  bind:value
  {...restProps}
></textarea>
