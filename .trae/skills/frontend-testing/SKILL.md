---
name: frontend-testing
description: A comprehensive guide for writing, executing, and maintaining tests (unit and end-to-end) in frontend development. Use this when writing new tests, debugging existing tests, or setting up frontend testing infrastructure.
---

# Testing Guide

## Overview

This guide provides standards and best practices for writing and executing tests in the project. It covers unit testing (Vitest) and end-to-end testing (Playwright).

## 1. Test File Standards

### File Naming

- **Unit/Component Tests**: Must match the tested file name with `.test.ts` or `.spec.ts` suffix.
  - Example: `utils.ts` -> `utils.test.ts`
- **E2E Tests**: Should have `.e2e.ts` suffix or be located in the `e2e` directory.

### Directory Structure

- **Unit Tests**: Co-located with the source file or in a `tests` directory.
- **E2E Tests**: Placed in the `tests/e2e` or `e2e` directory.

### Imports

- Import the module under test using relative paths or aliases.
- Import testing utilities from `vitest` or `@playwright/test`.

### Test Case Structure

- **Description**: Clear and descriptive string explaining _what_ is being tested and _under what conditions_.
- **Pre-conditions**: Setup required state in `beforeEach` or `beforeAll`.
- **Steps**: Discrete actions performed during the test.
- **Assertions**: Verification of the expected outcome.

## 2. Execution Flow

### Unit Tests

Run all unit tests:

```bash
pnpm test:unit
```

### E2E Tests

Run end-to-end tests:

```bash
pnpm test:e2e
```

## 3. Testing Principles

### FIRST Principle

- **Fast**: Tests should run quickly.
- **Independent**: Tests should not depend on each other or execution order.
- **Repeatable**: Results should be consistent across environments.
- **Self-Validating**: Pass/Fail status should be obvious without manual inspection.
- **Timely**: Write tests alongside or before the code (TDD).

### AAA Pattern

- **Arrange**: Set up the initial state and inputs.
- **Act**: Execute the code or action being tested.
- **Assert**: Verify the result matches expectations.

### Other Principles

- **Single Responsibility**: Each test should verify one specific behavior.
- **Readability**: Test names should read like documentation.
- **Determinism**: Eliminate flakiness; results must be predictable.

## 4. Usage Scenarios

### Unit Testing (Vitest)

Use for:

- Individual functions and methods.
- Pure functions (no side effects).
- Algorithms and data processing logic.
- Utility functions.
- Component internal state and rendering logic.

### E2E Testing (Playwright)

Use for:

- Complete user workflows (e.g., Login -> Dashboard).
- Integration across multiple modules/pages.
- UI interactions and UX validation.
- API end-to-end call chains.
- Verification in a real browser environment.

## 5. Best Practices

### Coverage Targets

- **Statement Coverage**: ≥ 80%
- **Branch Coverage**: ≥ 75%
- **Function Coverage**: ≥ 85%

### Data Management

- Use factory functions or fixtures to generate test data.
- Avoid hardcoding complex data structures in test cases.

### Mocking & Stubbing

- Isolate the unit under test by mocking external dependencies (APIs, databases).
- Use `vi.mock()` for module mocking in Vitest.

### Cleanup

- Reset state after each test (`afterEach`) to prevent pollution.
- Ensure databases or environment variables are restored.

### Continuous Integration

- Tests are automatically run in the CI/CD pipeline. Ensure they pass locally before pushing.

## 6. Templates

Refer to [templates.md](references/templates.md) for copy-pasteable code snippets:

- Unit Test Template
- E2E Test Template
- Component Test Template
