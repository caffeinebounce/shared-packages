# @caffeinebounce/ui

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
