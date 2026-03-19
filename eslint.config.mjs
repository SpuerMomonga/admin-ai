import antfu from '@antfu/eslint-config'

export default antfu(
  {
    svelte: true,
    typescript: true,
    yaml: true,
    jsonc: true,
    markdown: true,
    formatters: true,
  },
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/.svelte-kit/**',
      '**/coverage/**',
    ],
  },
)
