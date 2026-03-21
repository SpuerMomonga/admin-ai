import type { Component, Snippet } from 'svelte'

export type MenuMode = 'vertical' | 'horizontal' | 'inline'
export type MenuTheme = 'light' | 'dark'
export type MenuTriggerSubMenuAction = 'hover' | 'click'
export type MenuTooltipSide = 'top' | 'right' | 'bottom' | 'left'
export type MenuRenderable = string | Snippet
export type MenuIcon = Component<any>

export interface MenuTooltipConfig {
  side?: MenuTooltipSide
  sideOffset?: number
}

export interface MenuItemType {
  key: string
  label: MenuRenderable
  icon?: MenuIcon
  title?: string
  disabled?: boolean
  danger?: boolean
  extra?: MenuRenderable
}

export interface MenuTitleClickInfo {
  key: string
  domEvent: MouseEvent
}

export interface SubMenuType {
  key: string
  label: MenuRenderable
  icon?: MenuIcon
  title?: string
  disabled?: boolean
  children: ItemType[]
  popupClassName?: string
  popupOffset?: [number, number]
  theme?: MenuTheme
  onTitleClick?: (info: MenuTitleClickInfo) => void
}

export interface MenuItemGroupType {
  type: 'group'
  key?: string
  label: MenuRenderable
  children: ItemType[]
}

export interface MenuDividerType {
  type: 'divider'
  key?: string
  dashed?: boolean
}

export type ItemType = MenuItemType | SubMenuType | MenuItemGroupType | MenuDividerType

export interface MenuClickInfo {
  key: string
  keyPath: string[]
  domEvent: MouseEvent
  item: MenuItemType
}

export interface MenuSelectInfo extends MenuClickInfo {
  selectedKeys: string[]
}

export function isMenuDividerType(item: ItemType): item is MenuDividerType {
  return 'type' in item && item.type === 'divider'
}

export function isMenuItemGroupType(item: ItemType): item is MenuItemGroupType {
  return 'type' in item && item.type === 'group'
}

export function isSubMenuType(item: ItemType): item is SubMenuType {
  return 'children' in item && !('type' in item)
}
