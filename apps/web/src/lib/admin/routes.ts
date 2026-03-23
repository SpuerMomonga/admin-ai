import type { AdminPanel } from '$lib/types/app'
import type { Component } from 'svelte'
import { m } from '$lib/paraglide/messages'
import AccountPage from '../../routes/(workspace)/account/+page.svelte'
import GeneralPage from '../../routes/(workspace)/general/+page.svelte'
import KnowledgePage from '../../routes/(workspace)/knowledge/+page.svelte'
import ModelsPage from '../../routes/(workspace)/models/+page.svelte'
import PreferencesPage from '../../routes/(workspace)/preferences/+page.svelte'
import RulesPage from '../../routes/(workspace)/rules/+page.svelte'

const adminRouteTitleSegmentPattern = /[-_]/g

export type AdminMenuIconKey = 'dashboard' | 'user' | 'models' | 'knowledge' | 'rules' | 'settings'
type TitleMessage = () => string

export interface AdminRouteDefinition {
  path: string
  panel: AdminPanel
  titleMessage: TitleMessage
  menu: boolean
  order: number
  component: Component<any>
}

export interface AdminMenuNode {
  id: string
  titleMessage: TitleMessage
  icon?: AdminMenuIconKey
  path?: string
  clickable?: boolean
  children?: AdminMenuNode[]
}

export const adminRouteDefinitions = [
  {
    path: '/general',
    panel: 'general',
    titleMessage: m.panel_general,
    menu: true,
    order: 0,
    component: GeneralPage,
  },
  {
    path: '/preferences',
    panel: 'preferences',
    titleMessage: m.panel_preferences,
    menu: true,
    order: 1,
    component: PreferencesPage,
  },
  {
    path: '/account',
    panel: 'account',
    titleMessage: m.panel_account,
    menu: true,
    order: 2,
    component: AccountPage,
  },
  {
    path: '/models',
    panel: 'models',
    titleMessage: m.panel_models,
    menu: true,
    order: 3,
    component: ModelsPage,
  },
  {
    path: '/knowledge',
    panel: 'knowledge',
    titleMessage: m.panel_knowledge,
    menu: true,
    order: 4,
    component: KnowledgePage,
  },
  {
    path: '/rules',
    panel: 'rules',
    titleMessage: m.panel_rules,
    menu: true,
    order: 5,
    component: RulesPage,
  },
] as const satisfies ReadonlyArray<AdminRouteDefinition>

export const adminMenuTree = [
  {
    id: 'overview',
    titleMessage: m.admin_group_overview,
    icon: 'dashboard',
    path: '/general',
  },
  {
    id: 'workspace',
    titleMessage: m.admin_group_workspace,
    icon: 'settings',
    children: [
      {
        id: 'preferences',
        titleMessage: m.panel_preferences,
        icon: 'settings',
        path: '/preferences',
      },
      {
        id: 'account',
        titleMessage: m.panel_account,
        icon: 'user',
        path: '/account',
      },
      {
        id: 'policies',
        titleMessage: m.admin_group_policies,
        icon: 'rules',
        children: [
          {
            id: 'rules',
            titleMessage: m.panel_rules,
            icon: 'rules',
            path: '/rules',
          },
        ],
      },
    ],
  },
  {
    id: 'intelligence',
    titleMessage: m.admin_group_intelligence,
    icon: 'models',
    children: [
      {
        id: 'models',
        titleMessage: m.panel_models,
        icon: 'models',
        path: '/models',
      },
      {
        id: 'knowledge-stack',
        titleMessage: m.admin_group_knowledge,
        icon: 'knowledge',
        children: [
          {
            id: 'knowledge',
            titleMessage: m.panel_knowledge,
            icon: 'knowledge',
            path: '/knowledge',
          },
        ],
      },
    ],
  },
] as const satisfies ReadonlyArray<AdminMenuNode>

export function findAdminRoute(path: string) {
  return adminRouteDefinitions.find(route => route.path === path) ?? null
}

export function listAdminMenuRoutes() {
  return adminRouteDefinitions
    .filter(route => route.menu)
    .toSorted((left, right) => left.order - right.order)
}

export function findAdminMenuTrailByPath(path: string, nodes: ReadonlyArray<AdminMenuNode> = adminMenuTree, trail: AdminMenuNode[] = []): AdminMenuNode[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node]

    if (node.path === path) {
      return nextTrail
    }

    if (node.children) {
      const nestedTrail = findAdminMenuTrailByPath(path, node.children, nextTrail)

      if (nestedTrail) {
        return nestedTrail
      }
    }
  }

  return null
}

export function getAdminRouteComponent(path: string) {
  return findAdminRoute(path)?.component ?? null
}

export function getAdminRouteTitle(path: string) {
  return findAdminRoute(path)?.titleMessage() ?? null
}

export function formatAdminRouteFallbackTitle(path: string) {
  const segment = path.split('/').filter(Boolean).at(-1) ?? 'route'
  return segment
    .split(adminRouteTitleSegmentPattern)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
