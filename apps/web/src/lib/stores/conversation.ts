import type { ChatMode } from './shared/types'
import { derived } from 'svelte/store'
import { getSystemPreferencesSnapshot } from './preferences'
import { updateSettingsSection } from './settings'
import { buildAssistantReply, isChatMode } from './shared/task-fixtures'
import { getTasksSnapshot, tasksStore, updateTasksState } from './tasks'

export { knowledgeBases } from './shared/task-fixtures'
export type { ChatMode } from './shared/types'

export const conversationStore = derived(tasksStore, state => ({
  tasks: state.tasks,
  activeTaskId: state.activeTaskId,
}))

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

  updateSettingsSection('knowledge', { activeBaseId: knowledgeBaseId })
}

export function submitTaskDraft(taskId: string) {
  const snapshot = getTasksSnapshot()
  const task = snapshot.tasks.find(item => item.id === taskId)

  if (!task || task.draft.trim().length === 0) {
    return
  }

  const prompt = task.draft.trim()
  const locale = getSystemPreferencesSnapshot().locale

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
