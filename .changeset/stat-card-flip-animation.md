---
"@caffeinebounce/ui": minor
---

feat(ui): Add StatCard flip-to-chart feature with 3D animation

- StatCard now supports optional `chart` prop for flip-to-chart functionality
- Full 3D card flip animation using CSS transforms (perspective, preserve-3d, backface-visibility)
- Built-in MiniChart component with SVG-based area/line/bar charts
- New props: `chart`, `defaultSide`, `href` for navigation
- Enhanced value formatting: `format` prop supports "number", "currency", "percent", "compact", "none"
- Click handling: card body flips, header navigates via href
- FlipIndicator dots show current side and enable manual flipping
- Fixed ChartContainer dimension issues with ResizeObserver
