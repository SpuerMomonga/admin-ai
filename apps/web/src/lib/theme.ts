import { browser } from '$app/environment'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ThemeMode = 'light' | 'dark'

const systemThemeQuery = '(prefers-color-scheme: dark)'

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
