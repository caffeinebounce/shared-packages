---
"@caffeinebounce/ui": minor
---

## Visual Form Builder: GrapesJS Studio SDK Migration

BREAKING CHANGE: Replaced `GrapesEditor` component with new `StudioEditor` using @grapesjs/studio-sdk

### New Features
- **StudioEditor**: Production-ready visual editor with beautiful built-in UI
- Built-in form blocks: form-section, text-input, email-input, textarea, select, checkbox, radio-group, submit-button
- Light/dark theme support via `theme` prop
- Multi-page and asset manager support

### Migration
```tsx
// Before
import { GrapesEditor, formPreset } from "@caffeinebounce/ui";
import "@caffeinebounce/ui/grapes.css";
<GrapesEditor preset={formPreset} height="700px" onChange={...} />

// After
import { StudioEditor } from "@caffeinebounce/ui";
<StudioEditor projectType="web" height={700} onChange={...} />
```

### Removed Exports
- `GrapesEditor`, `EditorToolbar`
- `formPreset`, `emailPreset`, `baseConfig`
- `./grapes.css` CSS export

---

## DataTable Improvements

- **Export dropdown**: CSV and Excel export options in dropdown menu
- **Styling updates**: Consistent compact styling with `h-8` buttons
- **useDataTableContext**: Now exported for external use
- **DataTableRowActions**: Added `successActive` prop for toggle button styling

---

## Component Updates

### IconButton
- Added `successActive` variant for active toggle states (green text that fades on hover)
- Fixed `success` variant to use proper green-600 color

### DisplayField
- Added `text-sm` class to link and value elements for consistent sizing
