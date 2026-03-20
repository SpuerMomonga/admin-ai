import type { SessionState } from './shared/types'
import { derived, get, writable } from 'svelte/store'
import { adminTabsStore } from './admin-tabs'
import { settingsStore, updateSettingsSection } from './settings'
import { persistState, readStoredState, storageKeys } from './shared/storage'
import { tasksStore } from './tasks'

function normalizeSessionState(input: unknown): SessionState {
  const payload = input as Partial<SessionState>
  return {
    isLoggedIn: Boolean(payload.isLoggedIn),
    plan: payload.plan ?? 'Pro',
  }
}

const initialState = readStoredState<SessionState>(
  storageKeys.session,
  {
    isLoggedIn: false,
    plan: 'Pro',
  },
  normalizeSessionState,
)

const authStore = writable<SessionState>(initialState)

authStore.subscribe((value) => {
  persistState(storageKeys.session, value)
})

export const sessionStore = derived(
  [authStore, settingsStore, tasksStore, adminTabsStore],
  ([$authStore, $settingsStore, $tasksStore, $adminTabsStore]) => ({
    isLoggedIn: $authStore.isLoggedIn,
    user: {
      displayName: $settingsStore.settings.account.displayName,
      role: $settingsStore.settings.account.role,
      plan: $authStore.plan,
    },
    activeTaskId: $tasksStore.activeTaskId,
    activeAdminPath: $adminTabsStore.activeAdminPath,
  }),
)

export function hydrateSession() {
}

export function login(account: string) {
  const trimmed = account.trim()
  const displayName = trimmed.length > 0
    ? trimmed.split('@')[0] ?? get(settingsStore).settings.account.displayName
    : get(settingsStore).settings.account.displayName

  authStore.update(state => ({ ...state, isLoggedIn: true }))

  updateSettingsSection('account', {
    displayName,
    email: trimmed.length > 0 ? trimmed : get(settingsStore).settings.account.email,
  })
}

export function logout() {
  authStore.update(state => ({ ...state, isLoggedIn: false }))
}

export function getSessionSnapshot() {
  return get(sessionStore)
}
