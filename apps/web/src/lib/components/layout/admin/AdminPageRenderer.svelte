<script lang='ts'>
  import { formatAdminRouteFallbackTitle, getAdminRouteComponent, getAdminRouteTitle } from '$lib/admin/routes'
  import { Card } from '$lib/components/ui/card'
  import { m } from '$lib/paraglide/messages.js'
  import { fly } from 'svelte/transition'

  const { path, refreshKey = 0 }: { path: string, refreshKey?: number } = $props()

  const PageComponent = $derived(getAdminRouteComponent(path))
  const title = $derived(getAdminRouteTitle(path))
</script>

{#key `${path}:${refreshKey}`}
  <div class='relative min-h-full'>
    <div
      class='min-h-full'
      in:fly={{ x: 28, duration: 520, opacity: 0.08 }}
    >
      {#if PageComponent}
        <PageComponent />
      {:else}
        <Card size='sm' class='m-3 px-4'>
          <p class='shell-card-label'>{m.admin_unknown_route()}</p>
          <h3 class='shell-card-title'>{title ?? formatAdminRouteFallbackTitle(path)}</h3>
          <p class='shell-card-copy'>{m.admin_unknown_route_description()}</p>
        </Card>
      {/if}
    </div>
  </div>
{/key}
