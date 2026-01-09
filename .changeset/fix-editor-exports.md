---
"@caffeinebounce/ui": patch
---

Fix TypeScript errors and export GrapesEditor from main index

- Export GrapesEditor, formPreset, emailPreset, EditorToolbar from main index
- Fix EditorToolbar import path for Button component  
- Fix device manager type compatibility with GrapesJS
- Exclude panels from baseConfig type to avoid conflicts
- Fix component iteration type in extractSections
