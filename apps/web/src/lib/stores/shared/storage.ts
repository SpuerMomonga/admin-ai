import { browser } from '$app/environment'

export const storageKeys = {
  session: 'admin-ai.session.v1',
  language: 'admin-ai.language.v1',
  themePreference: 'admin-ai.theme.v1',
  navigation: 'admin-ai.navigation.v1',
  pendingTaskComposer: 'admin-ai.pending-task-composer.v1',
  adminTabs: 'admin-ai.admin-tabs.v1',
  tasks: 'admin-ai.tasks.v1',
  settings: 'admin-ai.settings.v1',
} as const

export function readStoredState<T>(key: string, fallback: T, normalize?: (input: unknown) => T) {
  if (!browser) {
    return fallback
  }

  try {
    const raw = localStorage.getItem(key)

    if (!raw) {
      return fallback
    }

    const parsed = JSON.parse(raw) as unknown
    return normalize ? normalize(parsed) : parsed as T
  }
  catch {
    return fallback
  }
}

export function persistState<T>(key: string, value: T) {
  if (!browser) {
    return
  }

  localStorage.setItem(key, JSON.stringify(value))
}
