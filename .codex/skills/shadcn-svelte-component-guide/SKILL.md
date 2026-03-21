---
name: shadcn-svelte-component-guide
description: Decide whether a Svelte page, route, form, overlay, menu, table, navigation element, shell region, feedback state, or display block should use an official shadcn-svelte component instead of bespoke markup. Use when building or reviewing UI in this repository and the request suggests buttons, inputs, forms, tabs, dialogs, drawers, menus, breadcrumbs, sidebars, tables, charts, loading states, empty states, or date and time entry.
---

# Shadcn Svelte Component Guide

Use this skill before creating new UI primitives in `apps/web`. The goal is to map product requirements to the smallest fitting shadcn-svelte building blocks, then decide whether to reuse an existing local component, add an official component, or build a custom primitive.

## Workflow

1. Identify the interaction pattern.
   Trigger this skill when the page or feature appears to need actions, form controls, overlays, navigation, table-like display, date or time entry, feedback states, charts, media containers, or resizable layout.

2. Inspect local availability first.
   Read `apps/web/src/lib/components/ui` for components or wrappers that already exist in this repository.
   Read `apps/web/components.json` if you need to confirm the local shadcn-svelte setup.

3. Match the need to the catalog.
   Read `references/component-catalog.md`.
   Prefer the narrowest component that already covers the required behavior instead of creating a custom primitive too early.

4. Decide whether to reuse, add, or go custom.
   Reuse a local component when it already exists and fits.
   Add the official shadcn-svelte component when the catalog fits but the repo does not yet contain the local implementation.
   Build a bespoke primitive only when the catalog does not cover the required behavior, accessibility model, composition pattern, or visual structure.

5. Keep repository constraints intact.
   Keep route-specific composition in route files.
   Keep shared primitives under `apps/web/src/lib/components/ui`.
   Keep the admin console compact and theme-aware in both light and dark appearance.
   Keep user-facing copy on `@inlang/paraglide-js`.

## Fast Intent Mapping

- Confirm a destructive or high-stakes action: `Alert Dialog`
- Show rich modal content or a modal form: `Dialog`
- Show complementary side content without leaving the page: `Sheet` or `Drawer`
- Offer actions from a trigger button: `Dropdown Menu`
- Offer actions on right-click or row context: `Context Menu`
- Offer command-palette search or action launching: `Command`
- Choose from a long searchable option list: `Combobox`
- Choose from a short closed option list: `Select` or `Native Select`
- Capture structured form fields with help and errors: `Field`, `Formsnap`, `Label`
- Capture date or time values: `Date Picker`, `Calendar`, `Range Calendar`, `Date Field`, `Date Range Field`, `Time Field`
- Show sortable and filterable grids: `Data Table`
- Show simple tabular content: `Table`
- Show multi-panel settings or section switching: `Tabs`
- Show shell navigation: `Sidebar`, `Breadcrumb`, `Navigation Menu`, `Pagination`
- Show loading, empty, progress, or toast feedback: `Skeleton`, `Spinner`, `Progress`, `Empty`, `Sonner`, `Alert`
- Show a resizeable multi-column workspace: `Resizable`

## Reading Order

- For a broad scan of what is available, start with `references/component-catalog.md`.
- For focused feature work, read only the categories that match the request instead of loading the whole catalog by default.

## Output Expectations

When choosing components for a page or feature, state:

1. which shadcn-svelte component or component combination fits,
2. whether it already exists locally or needs to be added,
3. why bespoke markup is unnecessary or, if custom work is still needed, what gap the official catalog leaves.
