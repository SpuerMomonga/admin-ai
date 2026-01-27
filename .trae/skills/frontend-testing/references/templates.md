# Test File Templates

## 1. Unit Test Template

Use this template for testing pure functions, utilities, and business logic.

```typescript
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
// Import the module to be tested
// import { sum } from './math';

describe('ModuleName', () => {
  // Setup if needed
  beforeEach(() => {
    // Initialization
  })

  afterEach(() => {
    // Cleanup
  })

  describe('functionName', () => {
    it('should return expected result when [condition]', () => {
      // Arrange
      const input = 5
      const expected = 10

      // Act
      // const result = sum(input, input);

      // Assert
      // expect(result).toBe(expected);
    })

    it('should handle edge cases', () => {
      // Arrange
      // ...

      // Act
      // ...

      // Assert
      // ...
    })
  })
})
```

## 2. E2E Test Template

Use this template for end-to-end testing with Playwright.

```typescript
import { expect, test } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting page
    await page.goto('/')
  })

  test('should perform specific user flow', async ({ page }) => {
    // Arrange: Prepare the state or navigate

    // Act: Perform user interactions
    // await page.getByRole('button', { name: 'Login' }).click();

    // Assert: Verify the outcome
    // await expect(page).toHaveURL('/dashboard');
    // await expect(page.getByText('Welcome')).toBeVisible();
  })

  test('should handle error states', async ({ page }) => {
    // ...
  })
})
```

## 3. Component Test Template

Use this template for testing Svelte components.

```typescript
import { fireEvent, render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
// import Component from './Component.svelte';

describe('Component Name', () => {
  it('should render correctly', () => {
    // Arrange
    // render(Component, { props: { name: 'World' } });

    // Assert
    // expect(screen.getByText('Hello World')).toBeInTheDocument();
  })

  it('should handle user interaction', async () => {
    // Arrange
    // render(Component);
    // const button = screen.getByRole('button');

    // Act
    // await fireEvent.click(button);

    // Assert
    // expect(screen.getByText('Clicked')).toBeInTheDocument();
  })
})
```
