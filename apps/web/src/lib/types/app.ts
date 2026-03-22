import type { locales } from '$lib/paraglide/runtime.js'

export type AppLocale = typeof locales[number]
export type ThemePreference = 'system' | 'light' | 'dark'
export type ThemeMode = 'light' | 'dark'
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

export interface UserInfo {
  displayName: string
  email: string
  role: string
  plan: string
}

export interface AuthState {
  isLoggedIn: boolean
  user: UserInfo
}

export interface ColumnWidths {
  left: number
  right: number
}

export interface ResizeState {
  activeHandle: 'left' | 'right' | null
  isResizing: boolean
  pointerX: number | null
}

export interface PreferencesState {
  locale: AppLocale
  themePreference: ThemePreference
  adminNavigationMode: AdminNavigationMode
  adminTabBarVisible: boolean
}

export interface AppState {
  leftCollapsed: boolean
  rightCollapsed: boolean
  adminSidebarCollapsed: boolean
  columnWidths: ColumnWidths
  resizeState: ResizeState
}

export interface TabsState {
  activeAdminPath: string
  visitedAdminPaths: string[]
  pinnedAdminPaths: string[]
  adminMaximizedPath: string | null
  adminSplitPath: string | null
}

export interface TasksState {
  activeTaskId: string
  tasks: TaskRecord[]
}

export interface PendingTaskComposerState {
  draft: string
  mode: ChatMode
  knowledgeBaseId: string
}
