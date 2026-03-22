<script lang='ts' module>
  import type { VariantProps } from 'tailwind-variants'
  import { tv } from 'tailwind-variants'

  export const badgeVariants = tv({
    base: 'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive focus-visible:ring-2 group/badge [&>svg]:pointer-events-none [&>svg]:size-3!',
    variants: {
      variant: {
        default: 'border-brand/20 bg-brand/10 text-brand [a]:hover:bg-brand/15',
        secondary: 'border-shell-border bg-shell-muted-panel text-foreground [a]:hover:bg-brand/5',
        destructive: 'border-destructive/20 bg-destructive/10 text-destructive [a]:hover:bg-destructive/15 focus-visible:ring-destructive/20 dark:bg-destructive/20',
        outline: 'border-shell-border bg-shell-surface text-foreground [a]:hover:bg-shell-muted-panel',
        ghost: 'border-transparent bg-transparent hover:bg-shell-muted-panel hover:text-foreground dark:hover:bg-shell-muted-panel',
        link: 'text-primary underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  })

  export type BadgeVariant = VariantProps<typeof badgeVariants>['variant']
</script>

<script lang='ts'>
  import type { WithElementRef } from '$lib/utils'
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'

  let {
    ref = $bindable(null),
    href,
    class: className,
    variant = 'default',
    children,
    ...restProps
  }: WithElementRef<HTMLAnchorAttributes> & {
    variant?: BadgeVariant
  } = $props()
</script>

<svelte:element
  this={href ? 'a' : 'span'}
  bind:this={ref}
  data-slot='badge'
  {href}
  class={cn(badgeVariants({ variant }), className)}
  {...restProps}
>
  {@render children?.()}
</svelte:element>
