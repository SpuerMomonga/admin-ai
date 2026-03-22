<script lang='ts'>
  import type { WithElementRef } from '$lib/utils'
  import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements'
  import { cn } from '$lib/utils'

  type InputType = Exclude<HTMLInputTypeAttribute, 'file'>

  type Props = WithElementRef<
    Omit<HTMLInputAttributes, 'type'>
    & ({ type: 'file', files?: FileList } | { type?: InputType, files?: undefined })
  >

  let {
    ref = $bindable(null),
    value = $bindable(),
    type,
    files = $bindable(),
    class: className,
    'data-slot': dataSlot = 'input',
    ...restProps
  }: Props = $props()
</script>

{#if type === 'file'}
  <input
    bind:this={ref}
    data-slot={dataSlot}
    class={cn(
      'border-shell-border bg-shell-surface text-foreground focus-visible:border-ring focus-visible:ring-ring/60 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full min-w-0 rounded-[10px] border px-2.5 py-1 text-sm shadow-none transition-[color,box-shadow,border-color,background-color] file:h-7 file:text-sm file:font-medium focus-visible:ring-2 aria-invalid:ring-2 outline-none placeholder:text-muted-foreground/90 file:inline-flex file:border-0 file:bg-transparent file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    type='file'
    bind:files
    bind:value
    {...restProps}
  />
{:else}
  <input
    bind:this={ref}
    data-slot={dataSlot}
    class={cn(
      'border-shell-border bg-shell-surface text-foreground focus-visible:border-ring focus-visible:ring-ring/60 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full min-w-0 rounded-[10px] border px-2.5 py-1 text-sm shadow-none transition-[color,box-shadow,border-color,background-color] file:h-7 file:text-sm file:font-medium focus-visible:ring-2 aria-invalid:ring-2 outline-none placeholder:text-muted-foreground/90 file:inline-flex file:border-0 file:bg-transparent file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {type}
    bind:value
    {...restProps}
  />
{/if}
