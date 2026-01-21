import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['**/*.{test,spec}.{js,ts,tsx}'],
		exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
		environment: 'node',
		passWithNoTests: true
	}
});

