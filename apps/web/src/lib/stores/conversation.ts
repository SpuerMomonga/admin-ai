import type { ChatMode, PendingTaskComposerState } from '$lib/types/app'
import { getCurrentLocale } from '$lib/i18n'
import { persistState, readStoredState, storageKeys } from '$lib/utils/storage'
import { buildAssistantReply, isChatMode, knowledgeBases } from '$lib/utils/task-fixtures'
import { derived, writable } from 'svelte/store'
import { getTasksSnapshot, tasksStore, updateTasksState } from './tasks'

export type { ChatMode, PendingTaskComposerState } from '$lib/types/app'
export { knowledgeBases } from '$lib/utils/task-fixtures'

function createDefaultPendingTaskComposerState(): PendingTaskComposerState {
  return {
    draft: '',
    mode: 'conversation',
    knowledgeBaseId: knowledgeBases[0]?.id ?? 'ops-playbook',
  }
}

function normalizePendingTaskComposerState(input: unknown): PendingTaskComposerState {
  const fallback = createDefaultPendingTaskComposerState()
  const payload = input as Partial<PendingTaskComposerState>

  return {
    draft: typeof payload.draft === 'string' ? payload.draft : fallback.draft,
    mode: payload.mode && isChatMode(payload.mode) ? payload.mode : fallback.mode,
    knowledgeBaseId: typeof payload.knowledgeBaseId === 'string' && payload.knowledgeBaseId.length > 0
      ? payload.knowledgeBaseId
      : fallback.knowledgeBaseId,
  }
}

const initialPendingTaskComposerState = readStoredState<PendingTaskComposerState>(
  storageKeys.pendingTaskComposer,
  createDefaultPendingTaskComposerState(),
  normalizePendingTaskComposerState,
)

const pendingTaskComposer = writable<PendingTaskComposerState>(initialPendingTaskComposerState)

pendingTaskComposer.subscribe((value) => {
  persistState(storageKeys.pendingTaskComposer, value)
})

export const conversationStore = derived(tasksStore, state => ({
  tasks: state.tasks,
  activeTaskId: state.activeTaskId,
}))
export const pendingTaskComposerStore = pendingTaskComposer

export function resetPendingTaskComposer() {
  pendingTaskComposer.set(createDefaultPendingTaskComposerState())
}

export function setPendingTaskDraft(draft: string) {
  pendingTaskComposer.update(state => ({ ...state, draft }))
}

export function setPendingTaskMode(mode: ChatMode) {
  if (!isChatMode(mode)) {
    return
  }

  pendingTaskComposer.update(state => ({ ...state, mode }))
}

export function setPendingTaskKnowledgeBase(knowledgeBaseId: string) {
  pendingTaskComposer.update(state => ({ ...state, knowledgeBaseId }))
}

export function setTaskDraft(taskId: string, draft: string) {
  updateTasksState(state => ({
    ...state,
    tasks: state.tasks.map(task => task.id === taskId ? { ...task, draft } : task),
  }))
}

export function setTaskMode(taskId: string, mode: ChatMode) {
  if (!isChatMode(mode)) {
    return
  }

  updateTasksState(state => ({
    ...state,
    tasks: state.tasks.map(task => task.id === taskId ? { ...task, mode } : task),
  }))
}

export function setTaskKnowledgeBase(taskId: string, knowledgeBaseId: string) {
  updateTasksState(state => ({
    ...state,
    tasks: state.tasks.map(task => task.id === taskId ? { ...task, knowledgeBaseId } : task),
  }))
}

export function submitTaskDraft(taskId: string) {
  const snapshot = getTasksSnapshot()
  const task = snapshot.tasks.find(item => item.id === taskId)

  if (!task || task.draft.trim().length === 0) {
    return
  }

  const prompt = task.draft.trim()
  const locale = getCurrentLocale()

  updateTasksState(state => ({
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
            content: buildAssistantReply({ locale }, item, prompt),
            createdAt: new Date().toISOString(),
            feedback: null,
          },
        ],
      }
    }),
  }))
}

export function setMessageFeedback(taskId: string, messageId: string, feedback: 'up' | 'down') {
  updateTasksState(state => ({
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
