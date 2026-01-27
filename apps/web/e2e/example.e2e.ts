import { expect, test } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome to SvelteKit')
})

test('home page has heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'svelte.dev/docs/kit' })).toBeVisible()
})
