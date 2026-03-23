import type { AppLocale } from '$lib/types/app'
import { browser } from '$app/environment'
import { getLocale, getTextDirection, locales, setLocale } from '$lib/paraglide/runtime.js'
import { writable } from 'svelte/store'

export const availableLocales = locales as readonly AppLocale[]
export const localeStore = writable<AppLocale>(browser ? getCurrentLocale() : 'zh-CN')

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

  const result = setLocale(locale, { reload: false })
  localeStore.set(locale)
  applyDocumentLocale(locale)

  if (result instanceof Promise) {
    void result.catch(() => {
      localeStore.set(getCurrentLocale())
      applyDocumentLocale(getCurrentLocale())
    })
  }

  return locale
}

export function syncDocumentLocale() {
  if (!browser) {
    return
  }

  const locale = getCurrentLocale()

  localeStore.set(locale)
  applyDocumentLocale(locale)
}
