<script lang='ts'>
  import { Tooltip as TooltipPrimitive } from 'bits-ui'

  const { children, ...restProps }: TooltipPrimitive.ProviderProps = $props()
</script>

<TooltipPrimitive.Provider {...restProps}>
  {@render children?.()}
</TooltipPrimitive.Provider>
