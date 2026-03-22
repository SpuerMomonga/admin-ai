import type { TaskRecord, TasksState, TaskStatus } from '$lib/types/app'
import { getCurrentLocale } from '$lib/i18n'
import { persistState, readStoredState, storageKeys } from '$lib/utils/storage'
import { createDefaultTasks, createTaskId, createTaskRecord, isTaskStatus, normalizeTask } from '$lib/utils/task-fixtures'
import { writable } from 'svelte/store'

export type { TaskRecord, TasksState, TaskStatus } from '$lib/types/app'

const titleWhitespacePattern = /\s+/g

interface CreateTaskOptions {
  title?: string
  mode?: TaskRecord['mode']
  knowledgeBaseId?: string
  draft?: string
  summary?: string
  status?: TaskStatus
  messages?: TaskRecord['messages']
}

function normalizeTasksState(input: unknown): TasksState {
  const locale = getCurrentLocale()
  const defaults = createDefaultTasks(locale)
  const payload = input as Partial<TasksState>
  const tasks = Array.isArray(payload.tasks) ? payload.tasks.map(normalizeTask) : defaults
  const activeTaskId = tasks.some(task => task.id === payload.activeTaskId)
    ? (payload.activeTaskId as string)
    : tasks[0]?.id ?? ''

  return {
    activeTaskId,
    tasks,
  }
}

const initialState = readStoredState<TasksState>(
  storageKeys.tasks,
  {
    activeTaskId: 'task-101',
    tasks: createDefaultTasks(getCurrentLocale()),
  },
  normalizeTasksState,
)

const store = writable<TasksState>(initialState)

store.subscribe((value) => {
  persistState(storageKeys.tasks, value)
})

export const tasksStore = store

export function updateTasksState(mutator: (state: TasksState) => TasksState) {
  store.update(mutator)
}

export function createTask(options: CreateTaskOptions = {}) {
  const nextId = createTaskId()

  store.update((state) => {
    const defaultTask = createTaskRecord(nextId, state.tasks.length + 1, getCurrentLocale())
    const trimmedTitle = options.title?.replace(titleWhitespacePattern, ' ').trim()
    const nextTask: TaskRecord = {
      ...defaultTask,
      title: trimmedTitle && trimmedTitle.length > 0 ? trimmedTitle : defaultTask.title,
      mode: options.mode ?? defaultTask.mode,
      knowledgeBaseId: options.knowledgeBaseId ?? defaultTask.knowledgeBaseId,
      draft: options.draft ?? defaultTask.draft,
      summary: options.summary ?? defaultTask.summary,
      status: options.status ?? defaultTask.status,
      messages: options.messages ?? defaultTask.messages,
      updatedAt: new Date().toISOString(),
    }

    return {
      ...state,
      activeTaskId: nextId,
      tasks: [nextTask, ...state.tasks],
    }
  })

  return nextId
}

export function renameTask(taskId: string, title: string) {
  const nextTitle = title.trim()

  if (nextTitle.length === 0) {
    return
  }

  store.update(state => ({
    ...state,
    tasks: state.tasks.map(task => task.id === taskId ? { ...task, title: nextTitle, updatedAt: new Date().toISOString() } : task),
  }))
}

export function deleteTask(taskId: string) {
  const snapshot = getTasksSnapshot()
  const deletingActiveTask = snapshot.activeTaskId === taskId
  let nextActiveTaskId = snapshot.activeTaskId

  store.update((state) => {
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

export function setTaskStatus(taskId: string, status: TaskStatus) {
  if (!isTaskStatus(status)) {
    return
  }

  store.update(state => ({
    ...state,
    tasks: state.tasks.map(task => task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task),
  }))
}

export function getTasksSnapshot(): TasksState {
  let snapshot = initialState
  store.subscribe(value => snapshot = value)()
  return snapshot
}
