import type { AuthState, UserInfo } from '$lib/types/app'
import { persistState, readStoredState, storageKeys } from '$lib/utils/storage'
import { get, writable } from 'svelte/store'

const defaultUser: UserInfo = {
  displayName: 'SpuerMomonga',
  email: 'admin-ai@example.com',
  role: 'Admin',
  plan: 'Pro',
}

function normalizeAuthState(input: unknown): AuthState {
  const payload = input as Partial<AuthState> & { plan?: string }
  const user = (payload.user ?? {}) as Partial<UserInfo>

  return {
    isLoggedIn: Boolean(payload.isLoggedIn),
    user: {
      displayName: typeof user.displayName === 'string' && user.displayName.length > 0
        ? user.displayName
        : defaultUser.displayName,
      email: typeof user.email === 'string' && user.email.length > 0
        ? user.email
        : defaultUser.email,
      role: typeof user.role === 'string' && user.role.length > 0
        ? user.role
        : defaultUser.role,
      plan: typeof user.plan === 'string' && user.plan.length > 0
        ? user.plan
        : typeof payload.plan === 'string' && payload.plan.length > 0
          ? payload.plan
          : defaultUser.plan,
    },
  }
}

const initialState = readStoredState<AuthState>(
  storageKeys.auth,
  {
    isLoggedIn: false,
    user: defaultUser,
  },
  normalizeAuthState,
)

const store = writable<AuthState>(initialState)

store.subscribe((value) => {
  persistState(storageKeys.auth, value)
})

export const authStore = store

export function hydrateAuth() {
}

export function login(account: string) {
  const trimmed = account.trim()
  const currentUser = get(store).user
  const displayName = trimmed.length > 0
    ? (trimmed.split('@')[0] ?? currentUser.displayName)
    : currentUser.displayName

  store.update(state => ({
    ...state,
    isLoggedIn: true,
    user: {
      ...state.user,
      displayName,
      email: trimmed.length > 0 ? trimmed : state.user.email,
    },
  }))
}

export function logout() {
  store.update(state => ({ ...state, isLoggedIn: false }))
}

export function getAuthSnapshot() {
  return get(store)
}
