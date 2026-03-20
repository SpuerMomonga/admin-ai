import process from 'node:process'
import { compile } from '@inlang/paraglide-js'

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production'

await compile({
  project: './project.inlang',
  outdir: './src/lib/paraglide',
  strategy: ['localStorage', 'preferredLanguage', 'baseLocale'],
  localStorageKey: 'admin-ai.locale',
  outputStructure: mode === 'development' ? 'locale-modules' : 'message-modules',
})
