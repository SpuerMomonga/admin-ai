import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { defineProject } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const appRoot = dirname(fileURLToPath(import.meta.url));

export default defineProject({
	root: appRoot,
	plugins: [svelte()],
	test: {
		name: 'app-client',
		expect: { requireAssertions: true },
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [{ browser: 'chromium', headless: true }]
		},
		include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
		exclude: ['src/lib/server/**', 'e2e/**']
	}
});

