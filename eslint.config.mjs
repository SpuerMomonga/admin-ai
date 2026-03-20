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
  {
    // Without `files`, they are general rules for all files
    rules: {
      'toml/padding-line-between-pairs': 'off',
      'pnpm/json-enforce-catalog': 'off',
      'ts/no-unsafe-function-type': 'off',
      'ts/no-namespace': 'off',
      'unicorn/error-message': 'off',
      'pnpm/json-prefer-workspace-settings': 'off',
      'no-restricted-syntax': 'off',
      'pnpm/yaml-enforce-settings': 'off',
    },
  },
)
