import antfu from '@antfu/eslint-config'

export default antfu(
  {
    svelte: true,
    typescript: true,
    formatters: true,
    ignores: [
      '**/.vscode/**',
      '**/project.inlang/**',
      '**/src/lib/paraglide/**',
    ],
  },
  {
    rules: {
      'n/prefer-global/process': 'off',
      'no-control-regex': 'off',
      'toml/padding-line-between-pairs': 'off',
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/brace-style': 'off',
      'no-redeclare': 'off',
      'pnpm/json-enforce-catalog': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      'ts/no-unsafe-function-type': 'off',
      'ts/no-namespace': 'off',
      'unicorn/error-message': 'off',
      'pnpm/json-prefer-workspace-settings': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['pnpm-workspace.yaml'],
    rules: {
      'pnpm/yaml-enforce-settings': 'off',
    },
  },
)
