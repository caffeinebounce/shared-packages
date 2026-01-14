---
"@caffeinebounce/ui": patch
---

Fix StudioEditor CSS injection for duplicated system forms

- Use SDK-native plugins approach with editor.Css.addRules() instead of embedding CSS in page styles
- CSS is now properly injected via GrapesJS CssComposer when editor is ready
- Ensures forms display with correct styling when system forms are duplicated
