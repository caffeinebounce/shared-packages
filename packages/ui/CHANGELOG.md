# @caffeinebounce/ui

## 0.17.1

### Patch Changes

- 404d680: fix(ui): correct sidebar menu button size for lg variant when collapsed
- 404d680: fix(ui): correct sidebar menu button size for lg variant when collapsed

## 0.17.0

### Minor Changes

- Make `children` optional in BasePageLayout, UserPageLayout, and AdminPageLayout props to ease consumption in apps without explicit children content.
- Add keyboard shortcut (Alt+Shift+R) to FormWizard for form reset functionality.
- Implement deep equality comparison in FormWizard's `hasRestoredDataPropagated()` to properly handle nested object restoration from localStorage.

### Breaking Changes

- **useLocalStorage hook return type**: The return value has changed from a 3-tuple `[value, setValue, removeValue]` to a 4-tuple `[value, setValue, removeValue, isLoaded]`.

  - **Migration**: Destructure the 4th element if needed, or use `_` to ignore it. See hook JSDoc for examples.
  - **Why**: The `isLoaded` flag prevents hydration mismatches and allows safe rendering of localStorage-dependent UI only after client-side restoration.

- **Keyboard shortcut change**: Changed FormWizard reset shortcut from `Ctrl+Shift+F` to `Alt+Shift+R` to avoid conflicts with browser "Find in Page" functionality.
  - **Migration**: Update any user-facing documentation mentioning the old shortcut.
  - **Impact**: Forms using FormWizard will now use Alt+Shift+R for reset; users relying on Ctrl+Shift+F must use the new combination.

### Patch Changes

- Add validation comment in useLocalStorage's `setValue` function for cross-tab storage event synchronization.
- Improve FormWizard persistence handling with comments explaining race condition prevention.

## 0.16.0

### Minor Changes

- 3b2e926: Local storage on modal forms

### Patch Changes

- Fix AppHeader grouping and ComingSoonButton padding.
- 643fdb6: Ensure UserPageLayout renders BasePageLayout when loading to preserve layout structure.
- 898eda5: Remove unused PageLayout component.

## 0.15.2

### Patch Changes

- fix(ui): correct sidebar menu button size for lg variant when collapsed

## 0.15.1

### Patch Changes

- fix(ui): correct sidebar menu button size for lg variant when collapsed

## 0.15.0

### Minor Changes

- 92f0a7a: Add HelpPageLayout component and fix help navigation interception
- 92f0a7a: Enhance Help system with in-page search support and improved layouts.
  - Update `HelpProvider` to support search state management.
  - Update `HelpPageLayout` and `HelpPanelLayout` for better consistency.
  - Fix `DataTableTopper` and other UI components.
- 92f0a7a: Add Chart and ToggleGroup components, refactor Help system components.

### Patch Changes

- 92f0a7a: Align DataTableTopper icon styles and responsive layout:
  - Remove chevron from View Picker
  - Standardize icon sizes to size-4
  - Consistent text-muted-foreground and hover:text-foreground across Search, View Picker, and Column Picker
  - DataTableTopper now stays in a single line on mobile
  - Tabs collapse into a dropdown on screens < 450px
- 92f0a7a: Fix DataTableTopper overflow issue on small screens by removing self-end alignment
- 92f0a7a: Fix DataTableTopper responsiveness using container queries
- 92f0a7a: Hide DataTableViews name label on small container widths (<600px)
- 92f0a7a: Refine DataTableTopper responsiveness and align icon styles

  - Lower container query breakpoint to 450px for less aggressive flexing
  - Standardize icon button styles (hover effects, colors) across Search, View Picker, and Column Picker
  - Ensure View Picker icon color matches other toolbar icons

- 92f0a7a: Update DataTableTopper to use explicit 600px container query breakpoint for better responsiveness

## 0.14.1

### Patch Changes

- 5d4a257: Fix DashboardGrid spacing and DataTableViews layout bugs:
  - Remove horizontal padding from DashboardGrid (use gap-6 for consistent spacing)
  - Fix DataTableViews where 'onUpdateView &&' text was rendered outside JSX
  - Move "Save changes" button inside the dropdown menu for consistency

## 0.14.0

### Minor Changes

- fa443a8: Make DataTableViews handlers optional and update DashboardGrid padding.

## 0.13.0

### Minor Changes

- Add onRowClick prop to DataTable

## 0.12.0

### Minor Changes

- 965b44c: feat: add DashboardGrid layout component for consistent dashboard spacing
- DashboardGrid fix

### Patch Changes

- df90d1c: Upgrade dependencies and align versions.

## 0.11.0

### Minor Changes

- Add support for select and boolean types to EditableCell

## 0.10.0

### Minor Changes

- bc310ab: Add admin editable cell components: EditableCell, UserNameEditableCell, CompanyNameEditableCell

### Patch Changes

- bc310ab: Fix DataTable scrollbar overlapping summary row by adding bottom padding to scroll container.

## 0.9.14

### Patch Changes

- Fix DataTable summary row rendering and scroll behavior by moving summary into tfoot.

## 0.9.13

### Patch Changes

- Add summary prop to DataTable to allow rendering summary rows inside the scrollable container.
  Remove internal Table wrapper to ensure summary scrolls with table content.
  Style scrollbar track to be transparent.

## 0.9.12

### Patch Changes

- Make displayName mandatory in DataTableColumnMeta to enforce cosmetic names for columns.

## 0.9.11

### Patch Changes

- 7f9884e: Fix sidebar overlap issue by adding overflow-x-hidden to SidebarInset

## 0.9.10

### Patch Changes

- Add min-w-0 to SidebarInset and AdminPageLayout to prevent overflow

## 0.9.9

### Patch Changes

- d9d4f64: fix(ui): detach DataTable width from page width to allow horizontal scrolling

## 0.9.8

### Patch Changes

- Fix summary row hover effects: remove background hover, keep "Calculate" text visible when dropdown is open

## 0.9.7

### Patch Changes

- DataTable improvements:
  - Fix text/number filter in column header submenu (removed problematic onBlur, added Apply button back)
  - Prevent duplicate view names with real-time validation
  - Add hover actions (star for default, trash for delete) on individual views in dropdown
  - Remove old menu items for "Set as default" and "Delete view" since they're now available on hover

## 0.9.6

### Patch Changes

- Fix DataTable filter behavior:
  - Remove Apply button from text and number filters
  - Add onBlur handler so filters auto-apply when clicking away
  - Filters now apply on Enter key or blur (no Apply button needed)

## 0.8.6

### Patch Changes

- c2d60cf: Fix icon rendering in filter badges - use React.isValidElement to detect already-rendered React elements vs Lucide forwardRef components

## 0.8.5

### Patch Changes

- b82237c: Fix filter menu styling and icon rendering:
  - Remove blue border from condition dropdown (is/is not)
  - Reduce header padding for more compact layout
  - Fix icon rendering to handle both LucideIcon and ReactNode types

## 0.8.0

### Minor Changes

- Notion-style DataTable Topper with expandable search and icon-based view options

  - New `DataTableTopper` component: full-width header bar combining tabs (left) and actions (right)
    - Decoupled from table width - topper stays full-width while table can scroll independently
    - Tabs support count badges and active state indicator
    - Clean, modern aesthetic with subtle bottom border
  - `DataTableSearch`: expandable search icon that transitions to full input
    - Collapsed state shows only Search icon (size-7)
    - Expands smoothly on click with CSS transitions
    - Auto-expands when search value exists
    - Clear button appears when there's a value
  - `DataTableViewOptions`: Changed from full "View" button to minimal icon-only button
  - `DataTablePagination`: Lighter, smaller font styling
    - Changed from `text-sm font-medium` to `text-xs font-light`
    - More subtle, less obtrusive pagination controls
  - `DataTable`: Reduced header padding to minimize vertical space
    - Removed vertical padding from headers (`py-0`)
  - Removed deprecated `isFiltered` and `onResetFilters` props from `DataTableToolbar`

## 0.7.2

### Patch Changes

- Notion-style expandable search and icon-based view options for DataTable

  - DataTableToolbar: New expandable search icon that elegantly transitions to full search input
    - Collapsed state shows only Search icon (size-7)
    - Expands smoothly on click with CSS transitions (duration-200)
    - Auto-expands when search value exists
    - Collapses on blur if input is empty
    - Clear button appears when there's a value
  - DataTableViewOptions: Changed from full "View" button to minimal icon-only button
    - Removed button text, now shows only Settings2 icon
    - Matches styling with search icon (size-7, hover:bg-accent/50)
    - Dropdown functionality unchanged
  - Removed deprecated `isFiltered` and `onResetFilters` props from DataTableToolbar

## 0.7.1

### Patch Changes

- DataTable fixes: column resizing, header styling, compact mode

  - **Column Resizing**: Reduced min width to 30px, fixed smooth dragging with requestAnimationFrame
  - **Header Button**: Removed excess margin, reduced padding for cleaner appearance
  - **Header Hover**: Disabled row-level hover on header, only individual headers highlight
  - **Cell Content**: Added truncation and whitespace-nowrap to prevent row height changes
  - **Compact Mode**: Reduced padding (py-1 cells, py-1.5 headers) for denser display

## 0.7.0

### Minor Changes

- DataTable improvements: column resizing, header UX, filter menu refinements

  - **Column Resizing**: Added `enableColumnResizing` prop for drag-to-resize columns with visual resize handles
  - **Full Header Click Area**: Column headers are now clickable across the entire cell, not just the button text
  - **Compact Column Header Menu**: Reduced dropdown width and font size to match filter menu styling
  - **Filter Menu Refinements**:
    - Reduced filter dropdown width from w-56 to w-48
    - Delete filter button only shows when filter has an active value
    - Hide delete menu when opening filter from column header
  - **Visual**: Added faint borders between columns for clearer column separation

## 0.6.0

### Minor Changes

- Add density prop to DataTable component for compact/comfy display modes

  - DataTable now accepts a density prop ('compact' | 'comfy')
  - Compact mode uses tighter padding (px-2 py-1.5 for cells, px-2 py-2 for headers)
  - Comfy mode uses standard padding (px-4 py-3)
  - Added mx-1 to table wrapper to align with filter badges
  - Export DataTableDensity type

## 0.4.3

### Patch Changes

- DataTable filter improvements:

  - Added `filterable` prop to DataTableColumnHeader for explicit filter control
  - Added `filterable` to DataTableColumnMeta for setting via column meta
  - Changed onFilter callback signature to receive columnId: `(columnId: string) => void`
  - Filter now shows when: filterable prop, meta.filterable, column.getCanFilter(), or onFilter provided

## 0.4.2

### Patch Changes

- DataTable column header improvements:

  - Filter now shows automatically when column.getCanFilter() is true (no callback required)
  - Added filter indicator icon in column header when column is filtered
  - Added "Clear filter" option when a filter is active
  - Fixed submenu alignment (Sort menu) to be better centered on trigger with alignOffset and sideOffset

## 0.4.1

### Patch Changes

- Export ColumnType and DataTableColumnMeta types from main package entry point

## 0.4.0

### Minor Changes

- DataTable column header improvements:

  - Fixed double ChevronRight arrow in Sort submenu (DropdownMenuSubTrigger already includes one)
  - Added `ColumnType` enum with default icons for text, number, date, boolean, enum
  - Added `DataTableColumnMeta` interface for column customization via `columnDef.meta`
  - Added `icon` and `columnType` props to DataTableColumnHeader for per-column customization
  - Updated DataTableViewOptions to use `meta.displayName` for friendly column names
  - Priority for icons: prop icon > meta.icon > default by columnType
  - Priority for names: meta.displayName > header string > column.id

## 0.3.0

### Minor Changes

- Redesigned DataTableColumnHeader with Notion-style UX

  - Removed up/down arrow icon when column is not sorted (cleaner look)
  - Made entire header clickable to open menu
  - Added nested Sort submenu with Ascending/Descending options
  - Added optional `onFilter` prop to enable Filter menu item
  - Added "Clear sort" option when column is actively sorted
  - Each menu option now has an icon

  Added new DataTableFilterBadges component for displaying active filters:

  - Notion-style removable filter badges
  - Optional "Clear all" button when multiple filters are active
  - Customizable with icons per filter

## 0.2.1

### Patch Changes

- 9d4fee2: Add autoFocusSelector prop to FormWizard

  New optional prop `autoFocusSelector` allows specifying a CSS selector for the element that should receive focus when the wizard mounts. This is useful for focusing the first input field when a form dialog opens.

  Example usage:

  ```tsx
  <FormWizard
    autoFocusSelector='[role="dialog"] input[name="name"]'
    // ... other props
  >
  ```

## 0.2.0

### Minor Changes

- Add Combobox component and keyboard shortcuts to FormWizard

  - Add Combobox component with search and create-new functionality
  - Add Command and Popover components (dependencies for Combobox)
  - Add onCancel and onSubmit props to FormWizard for Escape and Cmd+Enter shortcuts
