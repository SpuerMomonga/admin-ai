import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.svelte-kit/**', '**/e2e/**'],
		projects: [
			'app/vitest.client.config.ts',
			'app/vitest.server.config.ts',
			'packages/*/vitest.config.ts'
		]
	}
});
