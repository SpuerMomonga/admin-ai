import type { AppLocale } from '$lib/i18n'
import type { ThemePreference } from '$lib/theme'
import { browser } from '$app/environment'
import { getCurrentLocale, setAppLocale } from '$lib/i18n'
import { m } from '$lib/paraglide/messages.js'
import { applyDocumentTheme } from '$lib/theme'
import { writable } from 'svelte/store'

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

function getViewportWidth() {
  if (!browser || typeof document === 'undefined') {
    return 1440
  }

  return document.documentElement.clientWidth || window.innerWidth || 1440
}

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

function createTaskRecord(id: string, index: number, locale: AppLocale = browser ? getCurrentLocale() : 'zh-CN'): TaskRecord {
  const messageOptions = { locale }
  const paddedIndex = String(index).padStart(2, '0')

  return {
    id,
    title: m.task_default_title({ index: paddedIndex }, messageOptions) as string,
    status: 'in_progress',
    updatedAt: buildTimestamp(index * 4),
    summary: m.task_default_summary({}, messageOptions) as string,
    mode: 'conversation',
    knowledgeBaseId: 'ops-playbook',
    draft: '',
    messages: [
      createMessage('assistant', m.task_default_assistant_message({}, messageOptions) as string, index * 5),
    ],
  }
}

function createDefaultTasks(locale: AppLocale): TaskRecord[] {
  const messageOptions = { locale }

  return [
    {
      id: 'task-101',
      title: m.sample_task_one_title({}, messageOptions) as string,
      status: 'in_progress',
      updatedAt: buildTimestamp(10),
      summary: m.sample_task_one_summary({}, messageOptions) as string,
      mode: 'conversation',
      knowledgeBaseId: 'ops-playbook',
      draft: '',
      messages: [
        createMessage('assistant', m.sample_task_one_assistant({}, messageOptions) as string, 18),
        createMessage('user', m.sample_task_one_user({}, messageOptions) as string, 16),
      ],
    },
    {
      id: 'task-102',
      title: m.sample_task_two_title({}, messageOptions) as string,
      status: 'completed',
      updatedAt: buildTimestamp(84),
      summary: m.sample_task_two_summary({}, messageOptions) as string,
      mode: 'operation',
      knowledgeBaseId: 'product-guides',
      draft: '',
      messages: [
        createMessage('assistant', m.sample_task_two_assistant({}, messageOptions) as string, 96),
      ],
    },
    {
      id: 'task-103',
      title: m.sample_task_three_title({}, messageOptions) as string,
      status: 'failed',
      updatedAt: buildTimestamp(220),
      summary: m.sample_task_three_summary({}, messageOptions) as string,
      mode: 'conversation',
      knowledgeBaseId: 'security-manual',
      draft: '',
      messages: [
        createMessage('assistant', m.sample_task_three_assistant({}, messageOptions) as string, 226),
      ],
    },
  ]
}

function getDefaultRightPaneWidth() {
  const viewportWidth = getViewportWidth()
  return Math.min(Math.max(Math.round(viewportWidth * 0.5), minDesktopRightWidth), maxDesktopRightWidth)
}

function createDefaultState(): AppShellState {
  const locale = browser ? getCurrentLocale() : 'zh-CN'

  return {
    isLoggedIn: false,
    locale,
    themePreference: 'system',
    leftCollapsed: false,
    rightCollapsed: false,
    columnWidths: {
      left: 220,
      right: getDefaultRightPaneWidth(),
    },
    activeTaskId: 'task-101',
    activePanel: 'general',
    visitedPanels: ['general'],
    tasks: createDefaultTasks(locale),
    settings: {
      account: {
        displayName: 'SpuerMomonga',
        email: 'admin-ai@example.com',
        role: 'Admin',
      },
      models: {
        primaryModel: 'GPT-5.4',
        operationModel: 'GPT-5.3-codex',
        routingPolicy: m.models_routing_policy_complexity_first({}, { locale }) as string,
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

function normalizeCollapsedPanels(leftCollapsed: boolean, rightCollapsed: boolean) {
  if (leftCollapsed && rightCollapsed) {
    return {
      leftCollapsed: false,
      rightCollapsed: false,
    }
  }

  return {
    leftCollapsed,
    rightCollapsed,
  }
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
  const nextTasks = Array.isArray(input.tasks)
    ? input.tasks.map(normalizeTask)
    : defaults.tasks
  const collapsedPanels = normalizeCollapsedPanels(Boolean(input.leftCollapsed), Boolean(input.rightCollapsed))

  const activeTaskId = nextTasks.some(task => task.id === input.activeTaskId)
    ? (input.activeTaskId as string)
    : nextTasks[0]?.id ?? ''

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
    leftCollapsed: collapsedPanels.leftCollapsed,
    rightCollapsed: collapsedPanels.rightCollapsed,
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

function getInitialState(): AppShellState {
  const defaults = createDefaultState()

  if (!browser) {
    return defaults
  }

  try {
    const stored = localStorage.getItem(storageKey)

    if (!stored) {
      return defaults
    }

    return normalizeState(JSON.parse(stored) as Partial<AppShellState>)
  }
  catch {
    return defaults
  }
}

function createTaskId() {
  return `task-${Date.now().toString(36)}`
}

function buildAssistantReply(state: AppShellState, task: TaskRecord, prompt: string) {
  const selectedBase = knowledgeBases.find(base => base.id === task.knowledgeBaseId)
  const locale = state.locale
  const knowledgeBase = selectedBase?.badge ?? 'OPS'

  if (task.mode === 'operation') {
    return m.assistant_reply_operation({
      title: task.title,
      knowledgeBase,
      prompt,
    }, { locale }) as string
  }

  return m.assistant_reply_conversation({
    title: task.title,
    knowledgeBase,
  }, { locale }) as string
}

function createAppShell() {
  const initialState = getInitialState()
  const { subscribe, set, update } = writable<AppShellState>(initialState)

  let currentState = initialState
  let hydrated = browser

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
    if (!browser) {
      return
    }

    if (hydrated) {
      syncDocumentState(currentState)
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
    mutate((state) => {
      const collapsedPanels = normalizeCollapsedPanels(!state.leftCollapsed, state.rightCollapsed)

      return {
        ...state,
        leftCollapsed: collapsedPanels.leftCollapsed,
        rightCollapsed: collapsedPanels.rightCollapsed,
      }
    })
  }

  function toggleRightCollapsed() {
    mutate((state) => {
      const collapsedPanels = normalizeCollapsedPanels(state.leftCollapsed, !state.rightCollapsed)

      return {
        ...state,
        leftCollapsed: collapsedPanels.leftCollapsed,
        rightCollapsed: collapsedPanels.rightCollapsed,
      }
    })
  }

  function setLeftCollapsed(leftCollapsed: boolean) {
    mutate((state) => {
      const collapsedPanels = normalizeCollapsedPanels(leftCollapsed, state.rightCollapsed)

      return {
        ...state,
        leftCollapsed: collapsedPanels.leftCollapsed,
        rightCollapsed: collapsedPanels.rightCollapsed,
      }
    })
  }

  function setRightCollapsed(rightCollapsed: boolean) {
    mutate((state) => {
      const collapsedPanels = normalizeCollapsedPanels(state.leftCollapsed, rightCollapsed)

      return {
        ...state,
        leftCollapsed: collapsedPanels.leftCollapsed,
        rightCollapsed: collapsedPanels.rightCollapsed,
      }
    })
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

      nextActiveTaskId = deletingActiveTask ? (remainingTasks[0]?.id ?? '') : state.activeTaskId

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

    mutate(state => ({
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
    mutate(state => ({
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

export function buildWorkspacePath(taskId: string | null | undefined, panel: AdminPanel) {
  if (!taskId) {
    return `/workspace/${panel}`
  }

  const searchParams = new URLSearchParams({ taskId })
  return `/workspace/${panel}?${searchParams.toString()}`
}

export function resolveAdminPanelFromPathname(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const maybePanel = segments[1]

  return maybePanel && isAdminPanel(maybePanel) ? maybePanel : null
}
