<script lang='ts'>
  import { formatAdminRouteFallbackTitle, getAdminRouteComponent, getAdminRouteTitleKey } from '$lib/admin/routes'
  import { Card } from '$lib/components/ui/card'
  import { translate as t } from '$lib/stores/i18n'
  import { fly } from 'svelte/transition'

  const { path, refreshKey = 0 }: { path: string, refreshKey?: number } = $props()

  const PageComponent = $derived(getAdminRouteComponent(path))
  const titleKey = $derived(getAdminRouteTitleKey(path))
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
          <p class='shell-card-label'>{t('admin_unknown_route')}</p>
          <h3 class='shell-card-title'>{titleKey ? t(titleKey) : formatAdminRouteFallbackTitle(path)}</h3>
          <p class='shell-card-copy'>{t('admin_unknown_route_description')}</p>
        </Card>
      {/if}
    </div>
  </div>
{/key}
