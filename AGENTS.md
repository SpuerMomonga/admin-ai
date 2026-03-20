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
- `apps/web` should keep the admin console shell route-driven. Major views like login, workspace, and settings should be separate routes instead of conditional panels on a single page.
- User-facing copy in `apps/web` should go through `@inlang/paraglide-js`; avoid introducing a second i18n path for route text, menus, breadcrumbs, or shell actions.
- Theme tokens should be defined with Tailwind `@theme` and layered on top of `@admin-ai/ui/styles.css`; the console brand primary is `#004EA2`.
- The shared console UI should support both light and dark appearance and stay visually compact. Avoid oversized border radii and excessive padding in shell-level components.
- Put reusable shell primitives in `packages/ui` only when they are route-agnostic; keep workspace-specific composition in `apps/web`.
- For the current product scope, locale switching should not be encoded into the URL. Persist the active locale in client state plus durable storage instead of locale-prefixed routes.
- The current frontend locale set is `zh-CN` and `en`.
- Workspace state should support both route-switch persistence and refresh recovery for task context, active admin panel, drafts, and user preferences.
- Workspace `taskId` should live in the query string, for example `/workspace/general?taskId=task-101`; do not introduce a `[taskId]` path segment for workspace routes.
- The initial admin-side routed panels are `general`, `account`, `models`, `knowledge`, and `rules`.
- Right-side admin pages should use concrete SvelteKit file routes for each page instead of a single dynamic `[panel]` route, so the admin area can scale to many pages later.
- The initial login page is a UI-only flow with account, password, remember-me, and a client-side transition into the workspace.
- The workspace shell should use a persistent parent layout so changing `taskId` or admin panels does not remount the whole three-column interface.
- The three workspace columns should support desktop drag-resize, with the center conversation area remaining the dominant working area.
- Left and right workspace side panels should support true full collapse to `0px` without leaving a residual strip behind.
- When the left task rail is fully collapsed, the brand logo and name should move into the center header area.
- The right admin panel may expand up to roughly 80% of the workspace width. When it is dragged beyond 50% while the left rail is open, the left rail should auto-collapse.
- The shell should provide a classic admin-style visited-tab bar with tab switching and close actions while preserving cached page state.
- The right-side admin area is global settings UI in the current scope; switching tasks should not change the admin panel content model.
- Theme preference should default to `system`, while still allowing explicit light and dark overrides with persistence.
- Avoid large border radii in the console shell. Keep corners, padding, and spacing compact across task, chat, and admin surfaces.
- Creating a new task should preserve the current routed admin panel and only switch the `taskId` context.
- The initial chat input mode set is `conversation` and `operation`; keep the UI ready for later mode expansion without coupling to backend execution yet.
- The initial user avatar menu contains profile, preferences, language, theme, and logout actions.
- Header ownership is split by column: the center column top bar contains the new-task action and user avatar menu, while breadcrumbs, admin navigation, and similar page-level controls belong to the right admin column header.
- Admin management pages should live directly in their route files, not under `src/lib/components`.
- Only split a route page when it exceeds roughly 300 lines, and keep any split files under the same route folder instead of moving them into `src/lib/components`.
- Route-page code should go into `src/lib/components` only when it is shared across routes, cannot reasonably live in `packages/ui`, and would otherwise be duplicated.

## Backend notes

- Register external HTTP routes under `apps/api/src/routes`.
- Keep environment parsing centralized in `apps/api/src/config`.
- Reuse `packages/contracts` schemas in handlers whenever frontend-visible payloads are involved.
