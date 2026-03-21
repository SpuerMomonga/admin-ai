# Shadcn Svelte Component Catalog

This catalog summarizes the official `shadcn-svelte` component index and `llms.txt` snapshot from `https://www.shadcn-svelte.com/docs/components` and `https://www.shadcn-svelte.com/llms.txt` as accessed on 2026-03-21. Re-check the source when the upstream docs change.

## Actions, Forms, and Data Entry

- `Button`: Trigger primary, secondary, destructive, or inline actions.
- `Button Group`: Present a tight cluster of related actions as one visual group.
- `Calendar`: Let users pick a single date from a calendar surface.
- `Checkbox`: Capture an independent yes or no choice or multi-select list state.
- `Combobox`: Offer a searchable option picker that combines typing and selection.
- `Date Picker`: Collect a date through a calendar-driven picker workflow.
- `Date Field`: Capture a date as structured field segments instead of a popup picker.
- `Date Range Field`: Capture a start and end date as structured field segments.
- `Field`: Wrap labels, controls, help text, and validation messages into one form row.
- `Formsnap`: Build accessible validated forms with Formsnap, Superforms, and Zod.
- `Input`: Capture basic single-line text-like input.
- `Input Group`: Add leading or trailing affordances around an input, such as icons or action buttons.
- `Input OTP`: Capture one-time passwords or verification codes in segmented inputs.
- `Label`: Provide an accessible text label for a form control.
- `Native Select`: Use the browser's native select element when native behavior is enough.
- `Radio Group`: Let users choose exactly one visible option from a small set.
- `Range Calendar`: Let users pick a date range directly on a calendar.
- `Select`: Present a styled dropdown for choosing one option from a list.
- `Slider`: Capture a numeric value with a draggable control.
- `Switch`: Capture an immediate on or off state change.
- `Textarea`: Capture multi-line text input.

## Layout, Navigation, and Shell

- `Accordion`: Reveal and hide grouped sections of content inline.
- `Breadcrumb`: Show the current location inside a hierarchy.
- `Navigation Menu`: Build top-level or sectional navigation menus.
- `Pagination`: Move between pages of a larger result set.
- `Resizable`: Build panels that users can drag to resize.
- `Scroll Area`: Provide a styled scroll container for overflowing content.
- `Separator`: Visually divide related groups of content or controls.
- `Sidebar`: Build a persistent app-shell sidebar for navigation or tools.
- `Tabs`: Switch between sibling panels while staying on the same page.

## Overlays, Menus, and Floating UI

- `Alert Dialog`: Ask for explicit confirmation before destructive or sensitive actions.
- `Command`: Provide command-palette style search, filtering, and action launching.
- `Context Menu`: Expose actions from right-click or contextual invocation.
- `Dialog`: Show modal content that needs focused attention.
- `Drawer`: Show content in an edge-attached overlay, often better for mobile flows.
- `Dropdown Menu`: Show a menu of actions or options from a trigger.
- `Hover Card`: Show lightweight preview content on hover or focus.
- `Menubar`: Present application-style menus in a horizontal bar.
- `Popover`: Show anchored floating content without a full modal.
- `Sheet`: Show an off-canvas panel for supporting tasks or settings.
- `Tooltip`: Show brief explanatory text on hover or focus.

## Feedback, Status, and Transitional States

- `Alert`: Surface important information, warnings, or errors inline.
- `Badge`: Show compact status labels, categories, or counts.
- `Empty`: Show an intentional empty-state placeholder when no data is available.
- `Progress`: Show completion progress for a task or upload.
- `Skeleton`: Show placeholder blocks while content is loading.
- `Sonner`: Show toast notifications for transient feedback.
- `Spinner`: Show an active loading indicator when work is in progress.

## Data Display, Content, and Media

- `Aspect Ratio`: Preserve a fixed media ratio while content scales responsively.
- `Avatar`: Show a user or entity image with fallback behavior.
- `Card`: Group related content and actions in a bounded container.
- `Carousel`: Present swipeable or scrollable slides of content.
- `Chart`: Render data visualizations with `layerchart`.
- `Data Table`: Build sortable, filterable, data-heavy tables with TanStack Table.
- `Item`: Compose reusable display rows or list items with consistent spacing and structure.
- `Kbd`: Render keyboard shortcut hints such as `Ctrl` or `Cmd`.
- `Table`: Render straightforward tabular data without the heavier data-table feature set.
- `Typography`: Apply consistent prose and content styling primitives.

## Utility Selection and Toggle Patterns

- `Collapsible`: Expand or collapse a single content region without a full accordion.
- `Toggle`: Represent a pressable on or off state with button semantics.
- `Toggle Group`: Coordinate single or multiple toggle buttons as one control.

## Decision Notes

- Prefer `Table` for simple read-only rows and columns; prefer `Data Table` when sorting, filtering, selection, or faceting is part of the requirement.
- Prefer `Select` for closed option lists; prefer `Combobox` when searchability or fast keyboard filtering matters.
- Prefer `Dialog` for focused modal tasks; prefer `Sheet` or `Drawer` for supportive side content that should feel less blocking.
- Prefer `Field` plus `Label` and the relevant input control when building custom form layouts; add `Formsnap` when validation structure and form state management are part of the task.
- Prefer `Popover` for anchored floating content; prefer `Tooltip` only for short non-interactive hints.
