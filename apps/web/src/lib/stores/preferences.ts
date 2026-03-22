import type { PreferencesState, ThemeMode, ThemePreference } from '$lib/types/app'
import { browser } from '$app/environment'
import { getCurrentLocale, setAppLocale } from '$lib/i18n'
import { persistState, readStoredState, storageKeys } from '$lib/utils/storage'
import { writable } from 'svelte/store'

const systemThemeQuery = '(prefers-color-scheme: dark)'

function normalizePreferencesState(input: unknown): PreferencesState {
  const payload = input as Partial<PreferencesState>

  return {
    locale: payload.locale === 'en' ? 'en' : 'zh-CN',
    themePreference: payload.themePreference === 'light' || payload.themePreference === 'dark' ? payload.themePreference : 'system',
    adminNavigationMode: payload.adminNavigationMode === 'sidebar' ? 'sidebar' : 'topbar',
    adminTabBarVisible: payload.adminTabBarVisible !== false,
  }
}

const initialState = readStoredState<PreferencesState>(
  storageKeys.preferences,
  {
    locale: getCurrentLocale(),
    themePreference: 'system',
    adminNavigationMode: 'topbar',
    adminTabBarVisible: true,
  },
  normalizePreferencesState,
)

const store = writable<PreferencesState>(initialState)

store.subscribe((value) => {
  persistState(storageKeys.preferences, value)
  setAppLocale(value.locale)
  applyDocumentTheme(value.themePreference)
})

export const preferencesStore = store

export function resolveThemeMode(preference: ThemePreference): ThemeMode {
  if (!browser) {
    return 'light'
  }

  if (preference === 'system') {
    return window.matchMedia(systemThemeQuery).matches ? 'dark' : 'light'
  }

  return preference
}

export function applyDocumentTheme(preference: ThemePreference) {
  if (!browser) {
    return 'light' satisfies ThemeMode
  }

  const mode = resolveThemeMode(preference)

  document.documentElement.dataset.theme = mode
  document.documentElement.style.colorScheme = mode

  return mode
}

export function watchSystemTheme(callback: () => void) {
  if (!browser) {
    return () => {}
  }

  const mediaQuery = window.matchMedia(systemThemeQuery)
  const listener = () => callback()

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', listener)

    return () => mediaQuery.removeEventListener('change', listener)
  }

  mediaQuery.addListener(listener)

  return () => mediaQuery.removeListener(listener)
}

export function updatePreference<K extends keyof PreferencesState>(
  key: K,
  value: PreferencesState[K],
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

    if (key === 'adminNavigationMode') {
      return {
        ...state,
        adminNavigationMode: value === 'sidebar' ? 'sidebar' : 'topbar',
      }
    }

    return {
      ...state,
      adminTabBarVisible: value !== false,
    }
  })
}

export function getPreferencesSnapshot() {
  let snapshot = initialState
  store.subscribe(value => snapshot = value)()
  return snapshot
}
