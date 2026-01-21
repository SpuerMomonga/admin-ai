import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './app/e2e',
	testMatch: '**/*.{test,spec}.{js,ts}',
	webServer: {
		command: 'pnpm -C app build && pnpm -C app preview --port 4173',
		port: 4173,
		reuseExistingServer: !process.env.CI
	}
});

