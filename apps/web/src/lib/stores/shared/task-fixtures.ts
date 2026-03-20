import type { AppLocale } from '$lib/stores/i18n'
import type { ChatMessage, ChatMode, SessionState, TaskRecord, TaskStatus } from './types'
import { browser } from '$app/environment'
import { m } from '$lib/paraglide/messages.js'
import { getCurrentLocale } from '$lib/stores/i18n'

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

export function buildTimestamp(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString()
}

export function createMessage(role: ChatMessage['role'], content: string, minutesAgo: number): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: buildTimestamp(minutesAgo),
    feedback: null,
  }
}

export function createTaskRecord(id: string, index: number, locale: AppLocale = browser ? getCurrentLocale() : 'zh-CN'): TaskRecord {
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

export function createDefaultTasks(locale: AppLocale): TaskRecord[] {
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

export function createTaskId() {
  return `task-${Date.now().toString(36)}`
}

export function isChatMode(value: string): value is ChatMode {
  return chatModes.includes(value as ChatMode)
}

export function isTaskStatus(value: string): value is TaskStatus {
  return ['in_progress', 'completed', 'failed'].includes(value)
}

export function normalizeTask(task: Partial<TaskRecord>, index: number): TaskRecord {
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

export function buildAssistantReply(session: SessionState['isLoggedIn'] extends boolean ? { locale: AppLocale } : never, task: TaskRecord, prompt: string) {
  const selectedBase = knowledgeBases.find(base => base.id === task.knowledgeBaseId)
  const knowledgeBase = selectedBase?.badge ?? 'OPS'

  if (task.mode === 'operation') {
    return m.assistant_reply_operation({
      title: task.title,
      knowledgeBase,
      prompt,
    }, { locale: session.locale }) as string
  }

  return m.assistant_reply_conversation({
    title: task.title,
    knowledgeBase,
  }, { locale: session.locale }) as string
}
