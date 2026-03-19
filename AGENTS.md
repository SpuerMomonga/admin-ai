# AGENTS

## Repository layout

- `apps/web` contains only frontend routes, app-specific UI composition, and browser-side API access.
- `apps/api` contains only backend HTTP entrypoints, service wiring, and runtime configuration.
- `packages/ui` is a source-only shared UI package. Keep it framework-light and free of page logic.
- `packages/contracts` contains shared schemas and types for API boundaries.

## Working rules

- Put reusable visual components in `packages/ui` only when they are not tied to a single route or page.
- Put shared request or response schemas in `packages/contracts`; do not place backend services or frontend stores there.
- Keep workspace-wide config in the repository root instead of duplicating it under `apps/*` or `packages/*`.
- Prefer pnpm workspace dependencies with the `workspace:*` protocol for internal packages.

## Frontend notes

- `apps/web` consumes `packages/ui` as source. Internal imports inside `packages/ui` must stay relative; do not introduce `$lib` or SvelteKit-only aliases there.
- `apps/web/src/routes/layout.css` is the Tailwind entry and must continue to scan `packages/ui/src/lib`.
- Shared styles for UI components are exported from `@admin-ai/ui/styles.css`.

## Backend notes

- Register external HTTP routes under `apps/api/src/routes`.
- Keep environment parsing centralized in `apps/api/src/config`.
- Reuse `packages/contracts` schemas in handlers whenever frontend-visible payloads are involved.
