import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  sourcemap: true,
  clean: true,
  dts: false,
  noExternal: ['@admin-ai/contracts'],
})
