---
"@caffeinebounce/ui": patch
---

Add autoFocusSelector prop to FormWizard

New optional prop `autoFocusSelector` allows specifying a CSS selector for the element that should receive focus when the wizard mounts. This is useful for focusing the first input field when a form dialog opens.

Example usage:
```tsx
<FormWizard
  autoFocusSelector='[role="dialog"] input[name="name"]'
  // ... other props
>
```
