import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import { defineConfig } from 'vitest/config'

export default defineConfig(() => {
  const isVitest = !!process.env.VITEST

  const plugins = [
    tailwindcss(),
    sveltekit(),
    devtoolsJson(),
  ]

  if (!isVitest) {
    plugins.push(paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide' }))
  }

  return {
    plugins,
    resolve: isVitest ? {
      conditions: ['browser'],
    } : undefined,
    test: {
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,ts}'],
      setupFiles: ['./src/setupTests.ts'],
      server: {
        deps: {
          inline: ['@testing-library/svelte'],
        },
      },
    },
  }
})
