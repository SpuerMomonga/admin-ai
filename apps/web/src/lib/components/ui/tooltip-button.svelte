<script lang='ts'>
  import type { Tooltip as TooltipPrimitive } from 'bits-ui'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { cn } from '$lib/utils'

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

<Tooltip.Root>
  <Tooltip.Trigger class={cn(className)} {...restProps}>
    {@render children?.()}
  </Tooltip.Trigger>

  <Tooltip.Content {side} {sideOffset} class={contentClass}>
    {content}
  </Tooltip.Content>
</Tooltip.Root>
