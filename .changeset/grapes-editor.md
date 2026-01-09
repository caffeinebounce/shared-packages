---
"@caffeinebounce/ui": minor
---

Add GrapesJS visual editor for forms and emails

- New `GrapesEditor` component - React wrapper for GrapesJS visual block editor
- New `EditorToolbar` component - Toolbar with save/export/preview/undo/redo actions
- `formPreset` - Preset for building application forms with 12 field types (text, textarea, select, radio, checkbox, number, date, file, email, phone, url)
- `emailPreset` - Preset for building email templates with 10 block types (header, text, heading, button, image, divider, columns, social, footer, spacer)
- Full TypeScript types for editor configuration, presets, and exported schemas
- Supports both form schema export (for application forms) and email HTML export (with inlined styles)

This implements Phase 1 of the unified visual builder initiative.
