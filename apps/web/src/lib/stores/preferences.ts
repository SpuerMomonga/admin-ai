import type { SystemPreferencesState } from './shared/types'
import { writable } from 'svelte/store'
import { setAppLocale } from './i18n'
import { persistState, readStoredState, storageKeys } from './shared/storage'
import { applyDocumentTheme } from './theme'

function normalizeSystemPreferencesState(input: unknown): SystemPreferencesState {
  const payload = input as Partial<SystemPreferencesState>

  return {
    locale: payload.locale === 'en' ? 'en' : 'zh-CN',
    themePreference: payload.themePreference === 'light' || payload.themePreference === 'dark' ? payload.themePreference : 'system',
    adminNavigationMode: payload.adminNavigationMode === 'sidebar' ? 'sidebar' : 'topbar',
  }
}

const initialState = readStoredState<SystemPreferencesState>(
  storageKeys.themePreference,
  {
    locale: 'zh-CN',
    themePreference: 'system',
    adminNavigationMode: 'topbar',
  },
  normalizeSystemPreferencesState,
)

const store = writable<SystemPreferencesState>(initialState)

store.subscribe((value) => {
  persistState(storageKeys.themePreference, value)
  setAppLocale(value.locale)
  applyDocumentTheme(value.themePreference)
})

export const systemPreferencesStore = store

export function setSystemPreference(
  key: keyof SystemPreferencesState,
  value: string,
) {
  store.update((state) => {
    if (key === 'locale') {
      return {
        ...state,
        locale: value === 'en' ? 'en' : 'zh-CN',
      }
    }

    if (key === 'themePreference') {
      return {
        ...state,
        themePreference: value === 'light' || value === 'dark' ? value : 'system',
      }
    }

    return {
      ...state,
      adminNavigationMode: value === 'sidebar' ? 'sidebar' : 'topbar',
    }
  })
}

export function getSystemPreferencesSnapshot() {
  let snapshot = initialState
  store.subscribe(value => snapshot = value)()
  return snapshot
}
