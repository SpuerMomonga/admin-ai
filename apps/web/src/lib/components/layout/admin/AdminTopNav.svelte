<script lang='ts'>
  import type { AdminMenuNode } from '$lib/admin/routes'
  import { buildAdminMenuItems } from '$lib/admin/menu-items'
  import { Menu } from '$lib/components/ui/menu'

  const {
    nodes,
    activePath,
    onnavigate,
  }: {
    nodes: ReadonlyArray<AdminMenuNode>
    activePath: string
    onnavigate: (path: string) => void
  } = $props()

  const menuItems = $derived(buildAdminMenuItems(nodes))
</script>

<Menu
  items={menuItems}
  mode='horizontal'
  selectedKeys={[activePath]}
  triggerSubMenuAction='hover'
  onClick={({ key }) => {
    if (key.startsWith('/')) {
      onnavigate(key)
    }
  }}
/>
