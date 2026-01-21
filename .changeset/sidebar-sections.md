---
"@caffeinebounce/ui": minor
---

Add sidebar navigation sections, dividers, and disabled items support

- Add `disabled` and `disabledTooltip` props to `NavItem` for "coming soon" items
- Add `iconAnimation` prop to `NavItem` for hover animations (scale, rotate, bounce)
- Add `NavSection` type for grouped nav items with section headers
- Add `NavDivider` type for visual separators
- Add `NavElement` union type combining all navigation element types
- Add type guards: `isNavItem`, `isNavSection`, `isNavDivider`
- Update `AppSidebar` to render sections with headers and dividers
- Disabled items show tooltip and have reduced opacity with cursor: not-allowed
- Keyboard shortcuts skip disabled items
- Animations respect `prefers-reduced-motion`
