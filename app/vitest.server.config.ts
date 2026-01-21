import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { defineProject } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const appRoot = dirname(fileURLToPath(import.meta.url));

export default defineProject({
	root: appRoot,
	plugins: [svelte()],
	test: {
		name: 'app-server',
		expect: { requireAssertions: true },
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', 'e2e/**']
	}
});

