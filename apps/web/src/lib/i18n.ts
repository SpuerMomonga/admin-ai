import type { AppLocale } from '$lib/types/app'
import { browser } from '$app/environment'
import { getLocale, getTextDirection, locales, setLocale } from '$lib/paraglide/runtime.js'

export const availableLocales = locales as readonly AppLocale[]

export function normalizeLocale(value: unknown): AppLocale {
  return value === 'en' ? 'en' : 'zh-CN'
}

export function applyDocumentLocale(locale: AppLocale) {
  if (!browser) {
    return
  }

  document.documentElement.lang = locale
  document.documentElement.dir = getTextDirection(locale)
}

export function getCurrentLocale(): AppLocale {
  try {
    return normalizeLocale(getLocale())
  }
  catch {
    return 'zh-CN'
  }
}

export function setAppLocale(locale: AppLocale) {
  if (!browser) {
    return locale
  }

  void setLocale(locale, { reload: false })
  applyDocumentLocale(locale)

  return locale
}

export function syncDocumentLocale() {
  if (!browser) {
    return
  }

  applyDocumentLocale(getCurrentLocale())
}
