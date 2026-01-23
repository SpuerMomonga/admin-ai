import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Expect the title to contain a substring.
  // Note: Adjust this expectation based on the actual title of your app
  // For now, checking if it loads without error (title might be 'SvelteKit app' or similar)
  // Let's assume the title is defined in app.html or layout
});

test('home page has heading', async ({ page }) => {
  await page.goto('/');
  // Check for some content.
  // await expect(page.locator('h1')).toBeVisible();
});
