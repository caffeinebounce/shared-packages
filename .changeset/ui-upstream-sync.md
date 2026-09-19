---
"@caffeinebounce/ui": minor
---

Re-sync forked primitives with upstream shadcn (new-york-v4) and add the `Empty` and `Item` components.

**Re-synced with upstream:** `calendar`, `sonner`, `popover`, `toggle-group`, `switch`, `checkbox`, `slider`, `avatar`, `tabs`, `spinner`, `button-group`. Each file is now the upstream source with relative imports; local additions sit after the upstream code under a `// --- local extension over shadcn ---` marker.

**New exports:**

- `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`, `EmptyMedia` (main barrel)
- `Item`, `ItemMedia`, `ItemContent`, `ItemActions`, `ItemGroup`, `ItemSeparator`, `ItemTitle`, `ItemDescription`, `ItemHeader`, `ItemFooter` (main barrel)
- `Toggle`, `toggleVariants` (required by the upstream `ToggleGroup`)
- `AvatarBadge`, `AvatarGroup`, `AvatarGroupCount`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription`, `CalendarDayButton`, `buttonGroupVariants`, `tabsListVariants`

**Local extensions kept (used by consumers):**

- `Spinner` keeps `size="xs" | "sm" | "md" | "lg"` and the muted foreground colour via `spinnerVariants` / `SpinnerProps`, layered over the upstream component. The upstream spinner also adds `role="status"` and `aria-label="Loading"`.
- `Checkbox` keeps a boolean-typed `checked` / `onCheckedChange` contract (`CheckboxProps`) over the upstream Radix checkbox, so handlers that pass the value into boolean setters still type-check.
- `CheckboxProps`, `ButtonGroupProps`, `CalendarProps` remain exported as aliases of the upstream component props.
- `DateRangePicker` passes `captionLayout="dropdown"` explicitly to keep the month/year dropdowns it had when the local calendar defaulted to them.

**Dropped (no consumer used them):** the local `Calendar` default of `captionLayout="dropdown"` (upstream default is `"label"`), the native `<input>`-based `Checkbox` and `<button>`-based `Switch` implementations (now Radix), the custom `ButtonGroup` nested-group radius rules, the `Toaster` without icons and theme wiring (upstream now reads `next-themes` and sets Sonner icons/CSS variables), and `Avatar`'s `object-cover` on the image.

**Tabs:** `TabsList` keeps `variant="line"` (the underline look consumers were built on) as its default; pass `variant="default"` for the upstream pill style.

**Internal layout:** the 42 non-shadcn components (stat card, page header, date picker, icon button, stepper, effects, …) moved from `src/components/ui/` to `src/components/custom/`, so `components/ui/` now holds only shadcn registry files and can be diffed against upstream. Public exports are unchanged.

**Dependencies:** adds `@radix-ui/react-checkbox`, `@radix-ui/react-switch`, `@radix-ui/react-toggle`. `react-day-picker` was already on v9; no bump.

**Types:** `FormWithSetFieldValue.setFieldValue` in `useWizardForm` is now the same non-generic shape as `WizardFormInstance.setFieldValue`, so TanStack Form instances are assignable again when calling `createDataRestorationHandler(form, defaults)`.
