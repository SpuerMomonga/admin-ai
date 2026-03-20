import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const localeStrategy = ['localStorage', 'preferredLanguage', 'baseLocale']

export function getParaglideOptions(mode: string = 'production') {
  return {
    project: './project.inlang',
    outdir: './src/lib/paraglide',
    strategy: localeStrategy,
    localStorageKey: 'admin-ai.locale',
    outputStructure: mode === 'development' ? 'locale-modules' : 'message-modules',
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    paraglideVitePlugin(getParaglideOptions(mode === 'development' ? 'development' : 'production')),
    sveltekit(),
  ],
}))
