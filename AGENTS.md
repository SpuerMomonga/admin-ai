# AGENTS

## Repository layout

- `apps/web` contains frontend routes, app-specific UI composition, and browser-side API access.
- `apps/api` contains backend HTTP entrypoints, service wiring, and runtime configuration.
- `packages/ui` is a source-only shared UI package. Keep it framework-light and free of page logic.
- `packages/contracts` contains shared API schemas and types.

## Core rules

- Keep workspace-wide configuration in the repository root instead of duplicating it under `apps/*` or `packages/*`.
- Prefer pnpm workspace dependencies with the `workspace:*` protocol for internal packages.
- Put reusable visual components in `packages/ui` only when they are not tied to a specific route or page.
- Put shared request and response schemas in `packages/contracts`; do not put frontend stores or backend services there.
- After making code changes, run `pnpm lint:fix`. If auto-fixes do not fully resolve issues, fix the remaining problems manually before finishing.

## Frontend architecture

- `apps/web` currently behaves as a pure SPA-style client app. Do not introduce SSR-dependent behavior unless explicitly required.
- `apps/web` consumes `packages/ui` as source. Internal imports inside `packages/ui` must stay relative; do not introduce `$lib` or SvelteKit-only aliases there.
- `apps/web/src/routes/layout.css` is the Tailwind entry and must continue to scan `packages/ui/src/lib`.
- Shared UI styles are exported from `@admin-ai/ui/styles.css`.
- User-facing copy in `apps/web` must go through `@inlang/paraglide-js`; do not introduce a second i18n path for route text, menus, breadcrumbs, or shell actions.
- Theme tokens should be defined with Tailwind `@theme` on top of `@admin-ai/ui/styles.css`; the console brand primary is `#004EA2`.
- The console UI must support both light and dark appearance and stay visually compact. Avoid oversized radii, padding, and shell-level spacing.
- Locale switching must not be encoded into the URL. Persist locale in client state plus durable storage.
- The current frontend locales are `zh-CN` and `en`.

## Workspace routing and state

- Keep the admin console shell route-driven. Major views such as login and workspace must stay as separate routes.
- Workspace `taskId` must live in the query string, for example `/workspace/general?taskId=task-101`; do not add a `[taskId]` path segment for workspace routes.
- The routed admin panels are `general`, `account`, `models`, `knowledge`, and `rules`.
- The right-side admin area is global settings UI; switching tasks must not change the admin panel content model.
- Creating a new task must preserve the current routed admin panel and only change the `taskId` context.
- Workspace state must support route-switch persistence and refresh recovery for task context, active admin panel, drafts, widths, and user preferences.
- The workspace shell must use a persistent parent layout so changing `taskId` or admin panels does not remount the whole three-column interface.
- The three workspace columns must support desktop drag-resize, with the center conversation area remaining dominant.
- Left and right side panels must support true full collapse to `0px` without leaving a residual strip.
- When the left task rail is fully collapsed, move the brand logo and name into the center header area.
- The right admin panel may expand up to roughly 80% of the workspace width. When it is dragged beyond 50% while the left rail is open, the left rail should auto-collapse.
- The shell should provide a visited-tab bar with tab switching and close actions while preserving cached page state.
- Theme preference should default to `system`, while still allowing explicit light and dark overrides with persistence.
- The current chat input modes are `conversation` and `operation`; keep the UI ready for later mode expansion without coupling to backend execution.
- The current user avatar menu contains profile, preferences, language, theme, and logout actions.
- Header ownership is split by column: the center top bar owns new-task and user actions; breadcrumbs and admin navigation belong to the right admin header.

## Frontend file organization

- Admin management pages should live directly in their route files, not under `src/lib/components`.
- Only split a route page when it exceeds roughly 300 lines, and keep split files under the same route folder.
- Put route-page code into `src/lib/components` only when it is shared across routes, cannot reasonably live in `packages/ui`, and would otherwise be duplicated.
- Put reusable shell primitives in `packages/ui` only when they are route-agnostic and not tied to workspace-specific composition.

## Backend rules

- Register external HTTP routes under `apps/api/src/routes`.
- Keep environment parsing centralized in `apps/api/src/config`.
- Reuse `packages/contracts` schemas in handlers whenever frontend-visible payloads are involved.
