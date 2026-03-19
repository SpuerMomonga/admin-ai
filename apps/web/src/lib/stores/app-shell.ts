import { browser } from '$app/environment'
import { writable } from 'svelte/store'
import { getCurrentLocale, setAppLocale, type AppLocale } from '$lib/i18n'
import { applyDocumentTheme, type ThemePreference } from '$lib/theme'

export type TaskStatus = 'in_progress' | 'completed' | 'failed'
export type ChatMode = 'conversation' | 'operation'
export type AdminPanel = 'general' | 'account' | 'models' | 'knowledge' | 'rules'

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

export interface AppSettings {
  account: AccountSettings
  models: ModelSettings
  knowledge: KnowledgeSettings
  rules: RuleSettings
}

export interface UserProfile {
  displayName: string
  role: string
  plan: string
}

export interface ColumnWidths {
  left: number
  right: number
}

export interface AppShellState {
  isLoggedIn: boolean
  locale: AppLocale
  themePreference: ThemePreference
  leftCollapsed: boolean
  rightCollapsed: boolean
  columnWidths: ColumnWidths
  activeTaskId: string
  activePanel: AdminPanel
  visitedPanels: AdminPanel[]
  tasks: TaskRecord[]
  settings: AppSettings
  user: UserProfile
}

export const adminPanels = ['general', 'account', 'models', 'knowledge', 'rules'] as const satisfies ReadonlyArray<AdminPanel>
export const chatModes = ['conversation', 'operation'] as const satisfies ReadonlyArray<ChatMode>

export const knowledgeBases = [
  {
    id: 'ops-playbook',
    badge: 'OPS',
  },
  {
    id: 'product-guides',
    badge: 'DOC',
  },
  {
    id: 'security-manual',
    badge: 'SEC',
  },
] as const

const storageKey = 'admin-ai.app-shell.v3'
const minDesktopLeftWidth = 180
const maxDesktopLeftWidth = 420
const minDesktopRightWidth = 280
const maxDesktopRightWidth = 1600

function buildTimestamp(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString()
}

function createMessage(role: ChatMessage['role'], content: string, minutesAgo: number): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: buildTimestamp(minutesAgo),
    feedback: null,
  }
}

function createTaskRecord(id: string, index: number): TaskRecord {
  return {
    id,
    title: `任务 ${String(index).padStart(2, '0')}`,
    status: 'in_progress',
    updatedAt: buildTimestamp(index * 4),
    summary: '等待进一步对话或操作指令。',
    mode: 'conversation',
    knowledgeBaseId: 'ops-playbook',
    draft: '',
    messages: [
      createMessage('assistant', '任务上下文已准备，可以开始新的对话或操作编排。', index * 5),
    ],
  }
}

function createDefaultTasks(): TaskRecord[] {
  return [
    {
      id: 'task-101',
      title: '设计运营控制台',
      status: 'in_progress',
      updatedAt: buildTimestamp(10),
      summary: '整理三栏工作台、主题、路由和缓存行为。',
      mode: 'conversation',
      knowledgeBaseId: 'ops-playbook',
      draft: '',
      messages: [
        createMessage('assistant', '已同步整体需求，当前优先搭建持久三栏壳子。', 18),
        createMessage('user', '先收敛设计，再分批确认交互和路由。', 16),
      ],
    },
    {
      id: 'task-102',
      title: '接入国际化与主题切换',
      status: 'completed',
      updatedAt: buildTimestamp(84),
      summary: '补齐语言切换、亮暗模式与品牌色 token。',
      mode: 'operation',
      knowledgeBaseId: 'product-guides',
      draft: '',
      messages: [
        createMessage('assistant', '建议采用 Paraglide 本地产物并持久化语言、主题偏好。', 96),
      ],
    },
    {
      id: 'task-103',
      title: '梳理知识库问答面板',
      status: 'failed',
      updatedAt: buildTimestamp(220),
      summary: '等待知识库数据结构与检索策略进一步确认。',
      mode: 'conversation',
      knowledgeBaseId: 'security-manual',
      draft: '',
      messages: [
        createMessage('assistant', '当前缺少真实索引和召回约束，先保留 UI 和状态模型。', 226),
      ],
    },
  ]
}

function createDefaultState(): AppShellState {
  return {
    isLoggedIn: false,
    locale: browser ? getCurrentLocale() : 'zh-CN',
    themePreference: 'system',
    leftCollapsed: false,
    rightCollapsed: false,
    columnWidths: {
      left: 220,
      right: 360,
    },
    activeTaskId: 'task-101',
    activePanel: 'general',
    visitedPanels: ['general'],
    tasks: createDefaultTasks(),
    settings: {
      account: {
        displayName: 'SpuerMomonga',
        email: 'admin-ai@example.com',
        role: 'Admin',
      },
      models: {
        primaryModel: 'GPT-5.4',
        operationModel: 'GPT-5.3-codex',
        routingPolicy: '任务复杂度优先',
      },
      knowledge: {
        activeBaseId: 'ops-playbook',
        queryScope: 'current',
        searchQuery: '',
      },
      rules: {
        approvalMode: 'guided',
        responseStyle: 'compact',
        cachePolicy: 'session_and_reload',
        executionPolicy: 'safe_first',
      },
    },
    user: {
      displayName: 'SpuerMomonga',
      role: 'Admin',
      plan: 'Pro',
    },
  }
}

export function isAdminPanel(value: string): value is AdminPanel {
  return adminPanels.includes(value as AdminPanel)
}

function isChatMode(value: string): value is ChatMode {
  return chatModes.includes(value as ChatMode)
}

function isTaskStatus(value: string): value is TaskStatus {
  return ['in_progress', 'completed', 'failed'].includes(value)
}

function isAppLocale(value: string): value is AppLocale {
  return value === 'zh-CN' || value === 'en'
}

function isThemePreference(value: string): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

function clampWidth(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function normalizeTask(task: Partial<TaskRecord>, index: number): TaskRecord {
  const fallback = createTaskRecord(`task-auto-${index + 1}`, index + 1)

  return {
    id: task.id ?? fallback.id,
    title: task.title ?? fallback.title,
    status: task.status && isTaskStatus(task.status) ? task.status : fallback.status,
    updatedAt: task.updatedAt ?? fallback.updatedAt,
    summary: task.summary ?? fallback.summary,
    mode: task.mode && isChatMode(task.mode) ? task.mode : fallback.mode,
    knowledgeBaseId: typeof task.knowledgeBaseId === 'string' ? task.knowledgeBaseId : fallback.knowledgeBaseId,
    draft: typeof task.draft === 'string' ? task.draft : '',
    messages: Array.isArray(task.messages)
      ? task.messages.map((message, messageIndex) => ({
          id: message.id ?? `${fallback.id}-message-${messageIndex + 1}`,
          role: message.role === 'user' ? 'user' : 'assistant',
          content: typeof message.content === 'string' ? message.content : '',
          createdAt: message.createdAt ?? fallback.updatedAt,
          feedback: message.feedback === 'up' || message.feedback === 'down' ? message.feedback : null,
        }))
      : fallback.messages,
  }
}

function normalizeState(input: Partial<AppShellState>): AppShellState {
  const defaults = createDefaultState()
  const nextTasks = Array.isArray(input.tasks) && input.tasks.length > 0
    ? input.tasks.map(normalizeTask)
    : defaults.tasks

  const activeTaskId = nextTasks.some(task => task.id === input.activeTaskId)
    ? (input.activeTaskId as string)
    : nextTasks[0]?.id ?? defaults.activeTaskId

  const activePanel = typeof input.activePanel === 'string' && isAdminPanel(input.activePanel)
    ? input.activePanel
    : defaults.activePanel

  const visitedPanels = Array.isArray(input.visitedPanels)
    ? input.visitedPanels.filter(isAdminPanel)
    : defaults.visitedPanels

  const dedupedPanels = Array.from(new Set([...(visitedPanels.length > 0 ? visitedPanels : defaults.visitedPanels), activePanel]))

  return {
    isLoggedIn: Boolean(input.isLoggedIn),
    locale: typeof input.locale === 'string' && isAppLocale(input.locale) ? input.locale : defaults.locale,
    themePreference: typeof input.themePreference === 'string' && isThemePreference(input.themePreference)
      ? input.themePreference
      : defaults.themePreference,
    leftCollapsed: Boolean(input.leftCollapsed),
    rightCollapsed: Boolean(input.rightCollapsed),
    columnWidths: {
      left: typeof input.columnWidths?.left === 'number'
        ? clampWidth(input.columnWidths.left, minDesktopLeftWidth, maxDesktopLeftWidth)
        : defaults.columnWidths.left,
      right: typeof input.columnWidths?.right === 'number'
        ? clampWidth(input.columnWidths.right, minDesktopRightWidth, maxDesktopRightWidth)
        : defaults.columnWidths.right,
    },
    activeTaskId,
    activePanel,
    visitedPanels: dedupedPanels,
    tasks: nextTasks,
    settings: {
      account: {
        displayName: input.settings?.account?.displayName ?? defaults.settings.account.displayName,
        email: input.settings?.account?.email ?? defaults.settings.account.email,
        role: input.settings?.account?.role ?? defaults.settings.account.role,
      },
      models: {
        primaryModel: input.settings?.models?.primaryModel ?? defaults.settings.models.primaryModel,
        operationModel: input.settings?.models?.operationModel ?? defaults.settings.models.operationModel,
        routingPolicy: input.settings?.models?.routingPolicy ?? defaults.settings.models.routingPolicy,
      },
      knowledge: {
        activeBaseId: input.settings?.knowledge?.activeBaseId ?? defaults.settings.knowledge.activeBaseId,
        queryScope: input.settings?.knowledge?.queryScope === 'global' ? 'global' : defaults.settings.knowledge.queryScope,
        searchQuery: input.settings?.knowledge?.searchQuery ?? defaults.settings.knowledge.searchQuery,
      },
      rules: {
        approvalMode: input.settings?.rules?.approvalMode === 'manual' ? 'manual' : defaults.settings.rules.approvalMode,
        responseStyle: input.settings?.rules?.responseStyle === 'structured' ? 'structured' : defaults.settings.rules.responseStyle,
        cachePolicy: input.settings?.rules?.cachePolicy === 'session_only'
          ? 'session_only'
          : defaults.settings.rules.cachePolicy,
        executionPolicy: input.settings?.rules?.executionPolicy === 'balanced'
          ? 'balanced'
          : defaults.settings.rules.executionPolicy,
      },
    },
    user: {
      displayName: input.user?.displayName ?? defaults.user.displayName,
      role: input.user?.role ?? defaults.user.role,
      plan: input.user?.plan ?? defaults.user.plan,
    },
  }
}

function createTaskId() {
  return `task-${Date.now().toString(36)}`
}

function buildAssistantReply(state: AppShellState, task: TaskRecord, prompt: string) {
  const selectedBase = knowledgeBases.find(base => base.id === task.knowledgeBaseId)
  const locale = state.locale

  if (task.mode === 'operation') {
    return locale === 'en'
      ? `Operation plan drafted for "${task.title}". Knowledge base: ${selectedBase?.badge ?? 'OPS'}. Next step is to confirm the execution boundary for: ${prompt}`
      : `已为「${task.title}」生成操作计划。当前知识库：${selectedBase?.badge ?? 'OPS'}。下一步建议确认执行边界：${prompt}`
  }

  return locale === 'en'
    ? `Conversation context updated for "${task.title}". I will answer using the ${selectedBase?.badge ?? 'OPS'} knowledge base and keep the response compact.`
    : `已更新「${task.title}」的会话上下文。我会基于 ${selectedBase?.badge ?? 'OPS'} 知识库继续回答，并保持紧凑输出。`
}

function createAppShell() {
  const initialState = createDefaultState()
  const { subscribe, set, update } = writable<AppShellState>(initialState)

  let currentState = initialState
  let hydrated = false

  function syncDocumentState(state: AppShellState) {
    applyDocumentTheme(state.themePreference)
    setAppLocale(state.locale)
  }

  subscribe((value) => {
    currentState = value

    if (browser && hydrated) {
      localStorage.setItem(storageKey, JSON.stringify(value))
      syncDocumentState(value)
    }
  })

  function mutate(mutator: (state: AppShellState) => AppShellState) {
    update(state => mutator(state))
  }

  function hydrate() {
    if (!browser || hydrated) {
      return
    }

    hydrated = true

    const stored = localStorage.getItem(storageKey)

    if (!stored) {
      syncDocumentState(currentState)
      return
    }

    try {
      const parsed = JSON.parse(stored) as Partial<AppShellState>
      const normalized = normalizeState(parsed)
      set(normalized)
    }
    catch {
      localStorage.removeItem(storageKey)
      syncDocumentState(currentState)
    }
  }

  function activateRoute(taskId: string, panel: AdminPanel) {
    mutate((state) => {
      const nextTasks = state.tasks.some(task => task.id === taskId)
        ? state.tasks
        : [createTaskRecord(taskId, state.tasks.length + 1), ...state.tasks]

      return {
        ...state,
        activeTaskId: taskId,
        activePanel: panel,
        visitedPanels: Array.from(new Set([...state.visitedPanels, panel])),
        tasks: nextTasks,
      }
    })
  }

  function setThemePreference(themePreference: ThemePreference) {
    mutate(state => ({ ...state, themePreference }))
  }

  function setLocalePreference(locale: AppLocale) {
    mutate(state => ({ ...state, locale }))
  }

  function toggleLeftCollapsed() {
    mutate(state => ({ ...state, leftCollapsed: !state.leftCollapsed }))
  }

  function toggleRightCollapsed() {
    mutate(state => ({ ...state, rightCollapsed: !state.rightCollapsed }))
  }

  function setLeftCollapsed(leftCollapsed: boolean) {
    mutate(state => ({ ...state, leftCollapsed }))
  }

  function setRightCollapsed(rightCollapsed: boolean) {
    mutate(state => ({ ...state, rightCollapsed }))
  }

  function createTask() {
    const nextId = createTaskId()

    mutate((state) => {
      const nextTask = createTaskRecord(nextId, state.tasks.length + 1)

      return {
        ...state,
        activeTaskId: nextId,
        tasks: [nextTask, ...state.tasks],
      }
    })

    return nextId
  }

  function renameTask(taskId: string, title: string) {
    const nextTitle = title.trim()

    if (nextTitle.length === 0) {
      return
    }

    mutate(state => ({
      ...state,
      tasks: state.tasks.map(task => task.id === taskId ? { ...task, title: nextTitle, updatedAt: new Date().toISOString() } : task),
    }))
  }

  function deleteTask(taskId: string) {
    const deletingActiveTask = currentState.activeTaskId === taskId
    let nextActiveTaskId = currentState.activeTaskId

    mutate((state) => {
      const remainingTasks = state.tasks.filter(task => task.id !== taskId)

      if (remainingTasks.length === 0) {
        const replacementTask = createTaskRecord(createTaskId(), 1)
        nextActiveTaskId = replacementTask.id

        return {
          ...state,
          activeTaskId: replacementTask.id,
          tasks: [replacementTask],
        }
      }

      if (deletingActiveTask) {
        nextActiveTaskId = remainingTasks[0].id
      }

      return {
        ...state,
        activeTaskId: deletingActiveTask ? nextActiveTaskId : state.activeTaskId,
        tasks: remainingTasks,
      }
    })

    return {
      deletedActiveTask: deletingActiveTask,
      nextActiveTaskId,
    }
  }

  function setTaskDraft(taskId: string, draft: string) {
    mutate(state => ({
      ...state,
      tasks: state.tasks.map(task => task.id === taskId ? { ...task, draft } : task),
    }))
  }

  function setTaskMode(taskId: string, mode: ChatMode) {
    mutate(state => ({
      ...state,
      tasks: state.tasks.map(task => task.id === taskId ? { ...task, mode } : task),
    }))
  }

  function setTaskKnowledgeBase(taskId: string, knowledgeBaseId: string) {
    mutate(state => ({
      ...state,
      tasks: state.tasks.map(task => task.id === taskId ? { ...task, knowledgeBaseId } : task),
      settings: {
        ...state.settings,
        knowledge: {
          ...state.settings.knowledge,
          activeBaseId: knowledgeBaseId,
        },
      },
    }))
  }

  function setTaskStatus(taskId: string, status: TaskStatus) {
    mutate(state => ({
      ...state,
      tasks: state.tasks.map(task => task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task),
    }))
  }

  function submitTaskDraft(taskId: string) {
    const task = currentState.tasks.find(item => item.id === taskId)

    if (!task || task.draft.trim().length === 0) {
      return
    }

    const prompt = task.draft.trim()

    mutate((state) => ({
      ...state,
      tasks: state.tasks.map((item) => {
        if (item.id !== taskId) {
          return item
        }

        return {
          ...item,
          draft: '',
          status: 'in_progress',
          summary: prompt,
          updatedAt: new Date().toISOString(),
          messages: [
            ...item.messages,
            {
              id: crypto.randomUUID(),
              role: 'user',
              content: prompt,
              createdAt: new Date().toISOString(),
              feedback: null,
            },
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: buildAssistantReply(state, item, prompt),
              createdAt: new Date().toISOString(),
              feedback: null,
            },
          ],
        }
      }),
    }))
  }

  function openPanel(panel: AdminPanel) {
    mutate(state => ({
      ...state,
      activePanel: panel,
      visitedPanels: Array.from(new Set([...state.visitedPanels, panel])),
    }))
  }

  function closePanel(panel: AdminPanel) {
    if (currentState.visitedPanels.length === 1) {
      return currentState.activePanel
    }

    const panelIndex = currentState.visitedPanels.indexOf(panel)
    const remaining = currentState.visitedPanels.filter(item => item !== panel)
    const fallbackIndex = Math.max(panelIndex - 1, 0)
    const nextPanel = currentState.activePanel === panel
      ? remaining[fallbackIndex] ?? remaining[0] ?? 'general'
      : currentState.activePanel

    mutate(state => ({
      ...state,
      activePanel: nextPanel,
      visitedPanels: state.visitedPanels.filter(item => item !== panel),
    }))

    return nextPanel
  }

  function setMessageFeedback(taskId: string, messageId: string, feedback: 'up' | 'down') {
    mutate(state => ({
      ...state,
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId) {
          return task
        }

        return {
          ...task,
          messages: task.messages.map((message) => {
            if (message.id !== messageId) {
              return message
            }

            return {
              ...message,
              feedback: message.feedback === feedback ? null : feedback,
            }
          }),
        }
      }),
    }))
  }

  function updateSettingsSection<K extends keyof AppSettings>(section: K, patch: Partial<AppSettings[K]>) {
    const accountPatch = section === 'account' ? patch as Partial<AccountSettings> : null

    mutate(state => ({
      ...state,
      settings: {
        ...state.settings,
        [section]: {
          ...state.settings[section],
          ...patch,
        },
      },
      user: section === 'account'
        ? {
            ...state.user,
            displayName: typeof accountPatch?.displayName === 'string' ? accountPatch.displayName : state.user.displayName,
            role: typeof accountPatch?.role === 'string' ? accountPatch.role : state.user.role,
          }
        : state.user,
    }))
  }

  function login(account: string) {
    mutate((state) => {
      const displayName = account.trim().length > 0
        ? account.trim().split('@')[0] ?? state.user.displayName
        : state.user.displayName

      return {
        ...state,
        isLoggedIn: true,
        settings: {
          ...state.settings,
          account: {
            ...state.settings.account,
            displayName,
            email: account.trim().length > 0 ? account.trim() : state.settings.account.email,
          },
        },
        user: {
          ...state.user,
          displayName,
        },
      }
    })
  }

  function logout() {
    mutate(state => ({ ...state, isLoggedIn: false }))
  }

  function setColumnWidth(side: keyof ColumnWidths, width: number) {
    mutate((state) => ({
      ...state,
      columnWidths: {
        ...state.columnWidths,
        [side]: side === 'left'
          ? clampWidth(width, minDesktopLeftWidth, maxDesktopLeftWidth)
          : clampWidth(width, minDesktopRightWidth, maxDesktopRightWidth),
      },
    }))
  }

  return {
    subscribe,
    hydrate,
    activateRoute,
    setThemePreference,
    setLocalePreference,
    toggleLeftCollapsed,
    toggleRightCollapsed,
    setLeftCollapsed,
    setRightCollapsed,
    createTask,
    renameTask,
    deleteTask,
    setTaskDraft,
    setTaskMode,
    setTaskKnowledgeBase,
    setTaskStatus,
    submitTaskDraft,
    openPanel,
    closePanel,
    setMessageFeedback,
    updateSettingsSection,
    login,
    logout,
    setColumnWidth,
    getSnapshot: () => currentState,
  }
}

export const appShell = createAppShell()

export function buildWorkspacePath(taskId: string, panel: AdminPanel) {
  return `/workspace/${taskId}/${panel}`
}

export function resolveAdminPanelFromPathname(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const maybePanel = segments[2]

  return maybePanel && isAdminPanel(maybePanel) ? maybePanel : null
}
