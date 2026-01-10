---
"@caffeinebounce/ui": patch
---

Fix GrapesJS CSS bundling for visual form builder

- Copy grapes.min.css to dist folder during build
- Export CSS via `./grapes.css` for consumer import
- Update GrapesEditor documentation to require CSS import

Consumers must now import CSS explicitly:
```tsx
import "@caffeinebounce/ui/grapes.css";
```
