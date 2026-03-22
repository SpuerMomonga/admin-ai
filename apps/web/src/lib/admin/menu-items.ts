import type { ItemType } from '$lib/components/ui/menu'
import type { AdminMenuIconKey, AdminMenuNode } from './routes'
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

interface BuildAdminMenuItemsOptions {
  clickable?: boolean
}

function resolveClickable(node: AdminMenuNode, options: BuildAdminMenuItemsOptions) {
  return node.clickable ?? options.clickable ?? true
}

function toMenuItem(node: AdminMenuNode, options: BuildAdminMenuItemsOptions): ItemType {
  const label = node.titleMessage()
  const icon = node.icon ? iconMap[node.icon] : undefined
  const clickable = resolveClickable(node, options)

  if (node.children?.length) {
    return {
      key: node.id,
      label,
      title: label,
      icon,
      clickable,
      children: node.children.map(child => toMenuItem(child, options)),
    }
  }

  return {
    key: node.path!,
    label,
    title: label,
    icon,
    clickable,
  }
}

export function buildAdminMenuItems(nodes: ReadonlyArray<AdminMenuNode>, options: BuildAdminMenuItemsOptions = {}) {
  return nodes.map(node => toMenuItem(node, options))
}
