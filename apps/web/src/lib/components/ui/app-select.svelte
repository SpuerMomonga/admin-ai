<script lang='ts'>
  import * as Select from '$lib/components/ui/select'
  import { cn } from '$lib/utils'

  export interface AppSelectOption {
    value: string
    label: string
  }

  let {
    value = $bindable(''),
    options,
    placeholder = '',
    class: className,
    triggerClass,
    contentClass,
    size = 'default',
    disabled = false,
    plainWhenSelected = false,
    onValueChange,
  }: {
    value?: string
    options: AppSelectOption[]
    placeholder?: string
    class?: string
    triggerClass?: string
    contentClass?: string
    size?: 'sm' | 'default'
    disabled?: boolean
    plainWhenSelected?: boolean
    onValueChange?: (value: string) => void
  } = $props()

  const selectedLabel = $derived(options.find(option => option.value === value)?.label ?? '')
  const triggerStateClass = $derived(
    plainWhenSelected && selectedLabel.length > 0
      ? 'border-transparent bg-transparent shadow-none hover:border-transparent hover:bg-transparent focus-visible:border-transparent focus-visible:ring-0'
      : '',
  )
</script>

<Select.Root
  type='single'
  bind:value={value as never}
  items={options}
  {disabled}
  onValueChange={nextValue => onValueChange?.(nextValue)}
>
  <Select.Trigger class={cn('w-full justify-between', className, triggerStateClass, triggerClass)} {size}>
    <span
      data-slot='select-value'
      class={cn(selectedLabel.length === 0 ? 'text-muted-foreground' : '')}
    >
      {selectedLabel || placeholder || options[0]?.label || ''}
    </span>
  </Select.Trigger>

  <Select.Content class={contentClass}>
    {#each options as option}
      <Select.Item value={option.value} label={option.label} />
    {/each}
  </Select.Content>
</Select.Root>
