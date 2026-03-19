<script lang='ts'>
  import { Tooltip as TooltipPrimitive } from 'bits-ui'
  import { cn } from '../../../utils.js'

  const {
    content,
    side = 'top',
    sideOffset = 8,
    class: className,
    contentClass,
    children,
    ...restProps
  }: TooltipPrimitive.TriggerProps & {
    content: string
    contentClass?: string
    side?: TooltipPrimitive.ContentProps['side']
    sideOffset?: number
  } = $props()
</script>

<TooltipPrimitive.Root>
  <TooltipPrimitive.Trigger class={cn(className)} {...restProps}>
    {@render children?.()}
  </TooltipPrimitive.Trigger>

  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      {side}
      {sideOffset}
      class={cn(
        'z-50 rounded-[8px] border px-2 py-1 text-[11px] font-medium shadow-lg',
        'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950',
        contentClass,
      )}
    >
      {content}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
</TooltipPrimitive.Root>
