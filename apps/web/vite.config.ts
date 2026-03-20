import { paraglideVitePlugin, type CompilerOptions } from '@inlang/paraglide-js'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      strategy: ['localStorage', 'preferredLanguage', 'baseLocale'],
      localStorageKey: 'admin-ai.locale',
      outputStructure: mode === 'development' ? 'locale-modules' : 'message-modules',
    } as CompilerOptions),
    sveltekit(),
  ],
}))
