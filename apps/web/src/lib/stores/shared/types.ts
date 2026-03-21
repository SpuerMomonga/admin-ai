import type { AppLocale } from '$lib/stores/i18n'
import type { ThemePreference } from '$lib/stores/theme'

export type TaskStatus = 'in_progress' | 'completed' | 'failed'
export type ChatMode = 'conversation' | 'operation'
export type AdminPanel = 'general' | 'preferences' | 'account' | 'models' | 'knowledge' | 'rules'
export type AdminNavigationMode = 'topbar' | 'sidebar'

export interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  createdAt: string
  feedback: 'up' | 'down' | null
}

export interface TaskRecord {
  id: string
  title: string
  status: TaskStatus
  updatedAt: string
  summary: string
  mode: ChatMode
  knowledgeBaseId: string
  draft: string
  messages: ChatMessage[]
}

export interface AccountSettings {
  displayName: string
  email: string
  role: string
}

export interface ModelSettings {
  primaryModel: string
  operationModel: string
  routingPolicy: string
}

export interface KnowledgeSettings {
  activeBaseId: string
  queryScope: 'current' | 'global'
  searchQuery: string
}

export interface RuleSettings {
  approvalMode: 'manual' | 'guided'
  responseStyle: 'compact' | 'structured'
  cachePolicy: 'session_and_reload' | 'session_only'
  executionPolicy: 'safe_first' | 'balanced'
}

export interface ColumnWidths {
  left: number
  right: number
}

export interface SessionState {
  isLoggedIn: boolean
  plan: string
}

export interface SystemPreferencesState {
  locale: AppLocale
  themePreference: ThemePreference
  adminNavigationMode: AdminNavigationMode
}

export interface NavigationState {
  leftCollapsed: boolean
  rightCollapsed: boolean
  adminSidebarCollapsed: boolean
  columnWidths: ColumnWidths
}

export interface AdminTabsState {
  activeAdminPath: string
  visitedAdminPaths: string[]
  pinnedAdminPaths: string[]
  adminMaximizedPath: string | null
  adminSplitPath: string | null
}
