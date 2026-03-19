import { browser } from '$app/environment'
import * as messages from '$lib/paraglide/messages.js'
import { getLocale, setLocale } from '$lib/paraglide/runtime.js'

export type AppLocale = 'zh-CN' | 'en'

export const localeOptions = [
  {
    value: 'zh-CN',
    labelKey: 'locale_zh_cn',
  },
  {
    value: 'en',
    labelKey: 'locale_en',
  },
] as const satisfies ReadonlyArray<{ value: AppLocale, labelKey: string }>

export function translate(key: string) {
  return messages.text({ key }) as string
}

export function applyDocumentLocale(locale: AppLocale) {
  if (!browser) {
    return
  }

  document.documentElement.lang = locale
}

export function getCurrentLocale(): AppLocale {
  try {
    return getLocale() as AppLocale
  }
  catch {
    return 'zh-CN'
  }
}

export function setAppLocale(locale: AppLocale) {
  setLocale(locale, { reload: false })
  applyDocumentLocale(locale)
}
