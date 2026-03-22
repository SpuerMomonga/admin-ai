<script lang='ts'>
  import { adminMenuTree, findAdminMenuTrailByPath } from '$lib/admin/routes'
  import * as Breadcrumb from '$lib/components/ui/breadcrumb'
  import { m } from '$lib/paraglide/messages.js'

  const {
    path,
    onnavigate,
  }: {
    path: string
    onnavigate: (path: string) => void
  } = $props()

  const trail = $derived(findAdminMenuTrailByPath(path, adminMenuTree) ?? [])
</script>

<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link onclick={() => onnavigate('/general')}>
        {m.admin_label()}
      </Breadcrumb.Link>
    </Breadcrumb.Item>

    {#each trail as item, index}
      <Breadcrumb.Item>
        <Breadcrumb.Separator />
        {#if item.path && index < trail.length - 1}
          <Breadcrumb.Link onclick={() => onnavigate(item.path!)}>
            {item.titleMessage()}
          </Breadcrumb.Link>
        {:else}
          <Breadcrumb.Page>{item.titleMessage()}</Breadcrumb.Page>
        {/if}
      </Breadcrumb.Item>
    {/each}
  </Breadcrumb.List>
</Breadcrumb.Root>
