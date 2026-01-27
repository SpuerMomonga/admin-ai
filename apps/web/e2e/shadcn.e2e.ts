import { expect, test } from '@playwright/test'

test('shadcn demo page has buttons', async ({ page }) => {
  await page.goto('/shadcn-demo')
  await expect(page.getByRole('heading', { level: 1, name: 'Shadcn Svelte Demo' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Default' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Destructive' })).toBeVisible()
})
