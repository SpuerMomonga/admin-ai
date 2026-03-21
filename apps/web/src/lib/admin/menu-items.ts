import type { ItemType } from '$lib/components/ui/menu'
import type { AdminMenuIconKey, AdminMenuNode } from './routes'
import { translate as t } from '$lib/stores/i18n'
import {
  BookOpenText,
  Columns2,
  Layers3,
  Settings2,
  ShieldCheck,
  UserRound,
} from '@lucide/svelte'

const iconMap: Record<AdminMenuIconKey, typeof Columns2> = {
  dashboard: Columns2,
  user: UserRound,
  models: Layers3,
  knowledge: BookOpenText,
  rules: ShieldCheck,
  settings: Settings2,
}

function toMenuItem(node: AdminMenuNode): ItemType {
  const label = t(node.titleKey)
  const icon = node.icon ? iconMap[node.icon] : undefined

  if (node.children?.length) {
    return {
      key: node.id,
      label,
      title: label,
      icon,
      children: node.children.map(toMenuItem),
    }
  }

  return {
    key: node.path!,
    label,
    title: label,
    icon,
  }
}

export function buildAdminMenuItems(nodes: ReadonlyArray<AdminMenuNode>) {
  return nodes.map(toMenuItem)
}
