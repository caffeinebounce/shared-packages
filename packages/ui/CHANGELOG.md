<!-- markdownlint-disable MD024 -->

## 0.47.0

### Minor Changes

- Update ThemeToggle to use next-themes instead of internal state management. ThemeProvider is now a re-export from next-themes. Removes useThemeContext/useThemeContextOptional exports.

## 0.46.2

### Patch Changes

- fd65591: Prevent Textarea from expanding layout when value contains a single very long word by constraining width and forcing word wrapping. Also prevent Sidebar horizontal overflow by hiding x-axis overflow.

## 0.46.0

### Minor Changes

- 1088844: Add FormDialog component for modal forms with built-in header, footer, and loading state handling.

## 0.45.45

### Patch Changes

- Updated dependencies [e3a3a28]
  - @caffeinebounce/shared-utils@0.7.0

## 0.45.44

### Patch Changes

- Add onTabChange prop to UserPageLayout for tab persistence

## 0.45.43

### Patch Changes

- Fix Dialog close button positioning - add relative to DialogContent so X button stays in modal corner

## 0.45.42

### Patch Changes

- Remove hover border from SidebarRail

## 0.45.41

### Patch Changes

- Revert sidebar changes to restore working state

## 0.45.40

### Patch Changes

- Remove hover border line from SidebarRail

## 0.45.39

### Patch Changes

- Remove focus ring from SidebarMenuButton to prevent border flash on hover/click

## 0.45.38

### Patch Changes

- Add data-active support for destructive button to persist hover state

## 0.45.37

### Patch Changes

- Fix destructive button slide effect - starts with light bg, fills red on hover

## 0.45.36

### Patch Changes

- Add slide hover effect for destructive button variant

## 0.45.35

### Patch Changes

- Fix ButtonGroup connected appearance by using !important to override Button's rounded classes

## 0.45.34

### Patch Changes

- 2852a6a: Fix ButtonGroup styling for Button asChild with Link - now properly removes rounded corners on anchor elements

## 0.45.22

### Patch Changes

- 9a54b6c: fix: Legal pages - remove double underline on headers, make TOC sticky

## 0.45.21

### Patch Changes

- Button: use focus: instead of focus-visible: for consistent focus ring visibility

## 0.45.20

### Patch Changes

- Radio group item: use box-shadow for focus effect instead of ring utility

## 0.45.19

### Patch Changes

- Radio group item: add transition and border change on focus for better visibility

## 0.45.18

### Patch Changes

- Radio group item shows focus ring on all focus (not just focus-visible)

## 0.45.17

### Patch Changes

- Update radio group item to use primary color for focus ring

## 0.45.16

### Patch Changes

- Add visible focus ring to buttons using theme primary color with offset for better accessibility

## 0.45.15

### Patch Changes

- Add theme selection color to Textarea, NumberStepper, and CommandInput

## 0.45.14

### Patch Changes

- Change SelectContent default alignment to start (left-aligned)

## 0.45.13

### Patch Changes

- Fix NumberStepper typing behavior - allow intermediate values while editing

## 0.45.0

### Minor Changes

- Add PageSections layout component for structuring pages with optional separators between sections

## 0.44.0

### Minor Changes

- feat: add HoverEffect card component

  Aceternity-style card hover effect where a background highlight smoothly slides to the currently hovered card.

  - Added `motion` dependency for animations
  - `HoverEffect` component with configurable items (title, description, optional link)
  - Exported `HoverEffect`, `HoverEffectCard`, `HoverEffectCardTitle`, `HoverEffectCardDescription`

## 0.43.4

### Patch Changes

- fix(ui): improve navbar link spacing - change gap from 8px to 24px for better visual separation

## 0.43.3

### Patch Changes

- 09525fa: fix(ui): feedback modal focus and toggle behavior

  - Remove focus ring on dialog content when opened via keyboard
  - Toggle feedback dialog with F key (pressing F when open closes it)

## 0.43.0

### Minor Changes

- Add Slider component using Radix UI primitives

## 0.42.2

### Patch Changes

- 1bd7455: Add useToast hook export for shadcn/ui-compatible toast interface using sonner

## 0.42.1

### Patch Changes

- Updated dependencies [67c0c8b]
  - @caffeinebounce/shared-utils@0.6.0

## 0.42.0

### Minor Changes

- e39c78d: Add CSS variable extensions and data-theme support for brand customization

  - Add 10 new CSS custom properties for brand customization (accent colors, gradients, typography, shadow/spacing multipliers)
  - Implement 8 theme variants via data-theme attribute (light, dark, colorful, high-contrast, high-contrast-dark, deuteranopia, protanopia, tritanopia)
  - Add accessibility media queries for prefers-contrast and prefers-reduced-motion
  - Map new brand variables to Tailwind color utilities
  - Add TypeScript types for brand customization variables (brandVariables, brandDefaults)

- e7334a0: Add sidebar navigation sections, dividers, and disabled items support

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

### Patch Changes

- a0c409c: Improve navbar visibility and transparent scroll behavior

  - Increase brand name opacity from 50% to 80%
  - Increase nav link visibility from muted-foreground/70 to foreground/70
  - Transparent navbar now shows blur background when scrolled for better readability

## 0.38.0

### Minor Changes

- 2caac8f: Add TextHighlight component for animated text emphasis

  - New `TextHighlight` component that draws an animated gradient background behind text
  - Perfect for emphasizing key phrases in hero sections
  - Customizable gradient colors via Tailwind classes
  - Configurable animation duration and delay
  - Respects `prefers-reduced-motion` for accessibility
  - CSS-only implementation (no motion library dependency)

- a6acaa3: Add proper image layering to HeroSectionWithRipple

  - Restructure HeroSectionWithRipple to properly layer images below ripple effect
  - Images render at z-0, ripple at z-10 (semi-transparent), content at z-20
  - Add `showArrows` prop to HeroSection to control arrow navigation visibility
  - Add `carouselState` prop to HeroSection for external carousel control
  - Add `rippleOpacity` prop to HeroSectionWithRipple (default 40% with images)
  - Export CarouselState type from marketing barrel
  - Remove arrow navigation in HeroSectionWithRipple (only dot indicators shown)

### Patch Changes

- 74dad22: Fix autofill background color unreadable in dark mode

  - Override browser autofill styles to maintain proper text contrast
  - Use CSS variables (--foreground, --background, --card) for theme consistency
  - Support both WebKit/Blink (Chrome, Safari, Edge) and Firefox browsers

## 0.35.2

### Patch Changes

- b6a361e: Fix navbar hide-on-scroll feature for Tailwind CSS v4 compatibility

  Use inline styles instead of Tailwind classes for the transform animation to ensure the hide-on-scroll feature works reliably across different build configurations.

## 0.37.1

### Patch Changes

- Updated dependencies [dbccb63]
  - @caffeinebounce/shared-utils@0.5.0

## 0.37.0

### Minor Changes

- 6947479: Add sticky navbar with hide-on-scroll-down behavior and fix dark mode primary colors

  **Navbar improvements:**

  - Add `hideOnScrollDown` prop for marketing pages
  - When enabled, navbar hides on scroll down and reappears on scroll up
  - Uses new `useScrollDirection` hook with requestAnimationFrame for smooth performance

  **CSS fixes:**

  - Remove dark mode `--primary` and `--primary-foreground` overrides from base.css
  - Products setting brand colors in `:root` now work consistently in both light and dark modes
  - Dark brand primaries (L < 0.7) automatically get white text without additional overrides

## 0.36.0

### Minor Changes

- c87e107: Add centralized base CSS styles export (`@caffeinebounce/ui/styles.css`)

  This consolidates ~400 lines of common CSS that was previously duplicated across product repos:

  - CSS custom properties (layout, colors, ripple effect variables)
  - Dark mode variables and `.dark` class overrides
  - `@custom-variant dark` declaration for Tailwind v4
  - `@theme inline` mappings for semantic color tokens
  - Base layer styles, container utilities, and component-specific styles

  Product repos can now import this single CSS file and only need to define their own `@source` directives, `@plugin` directives, and brand color overrides.

## 0.35.2

### Patch Changes

- 5422136: Add suppressHydrationWarning to RootLayout wrapper div to prevent hydration errors from font class name differences between server and client rendering

## 0.35.1

### Patch Changes

- 4948f6d: Fix Navbar container max-width alignment

  - Add `container mx-auto` to Navbar inner div
  - Navbar now aligns with Footer on wide screens
  - Resolves layout inconsistency where navbar content extended full-width while footer was constrained

## 0.35.0

### Minor Changes

- 41149cd: Enhance StudioEditor canvas styles with comprehensive Typeform-inspired design

  The light and dark mode canvas styles for the form builder now include:

  - CSS variables for consistent theming
  - Full form section, field, and label styling
  - Input fields with proper sizing (0.875rem font, 2.5rem height)
  - Textarea and select styling with custom dropdown arrows
  - Radio group styling with horizontal and vertical layouts
  - Checkbox group styling with selected state
  - Conditional field support with visibility classes
  - Focus states with themed box shadows
  - Consistent border radius, spacing, and transitions

  This ensures that when forms are duplicated and opened in the StudioEditor, they display with proper styling consistent with the form preview.

### Patch Changes

- 41149cd: Fix StudioEditor CSS injection for duplicated system forms

  - Use SDK-native plugins approach with editor.Css.addRules() instead of embedding CSS in page styles
  - CSS is now properly injected via GrapesJS CssComposer when editor is ready
  - Ensures forms display with correct styling when system forms are duplicated

## 0.34.0

### Minor Changes

- Add email-specific blocks to StudioEditor for email template building

  - 11 new email blocks: header, hero, text, button, image, divider, spacer, two-columns, feature-card, social-links, footer
  - Email-safe table-based layouts with inline styles for maximum email client compatibility
  - EMAIL_CONTENT_MAX_WIDTH constant (600px) for consistent container widths
  - JSDoc documentation for email blocks
  - SVG icons and text labels instead of emojis for accessibility
  - ARIA labels on social links
  - Generic placeholder text for customization
  - useMemo optimization for baseBlocks selection

## 0.33.1

### Patch Changes

- 76c7b79: Fix Dialog centering issue where dialogs appeared offset to bottom-left instead of centered.

  Changed from transform-based centering (translate-x/y -50%) to flexbox-based centering to avoid conflicts with animate-in animation transforms. The slide animation has been simplified to a vertical-only slide (slide-in-from-top-[2%]) which works correctly with the new flexbox positioning.

- cf2b175: Replace console.error with useErrorLogger for structured logging

  Migrates 7 instances of console.error to use the structured logging hook from @caffeinebounce/logger:

  - **FeedbackDialog**: Log feedback submission errors with component context
  - **EditableCell**: Log cell update errors with column and row metadata
  - **CompanyNameEditableCell**: Log company name update errors
  - **UserNameEditableCell**: Log user name update errors
  - **FormWizard**: Log localStorage save/clear errors on unmount and reset

  This change improves error visibility in Better Stack dashboards while maintaining identical user-facing behavior (toast notifications). Development-only warnings (GoogleAnalytics invalid ID, EditableCell select option mismatch) are intentionally preserved as console.warn for developer debugging.

- Updated dependencies [0704b46]
  - @caffeinebounce/shared-utils@0.4.1

## 0.33.0

### Minor Changes

- 392c4ad: Add StatCard dashboard component with flip-to-chart interactions

  - Ultra-aesthetic shadcn v4-inspired stat card with gradient and solid variants
  - Supports trend indicators with up/down badges and isPercentage option
  - Optional icon, description, and footer sections for flexible layouts
  - Flip-to-chart interaction with built-in MiniChart (SVG area/line/bar charts)
  - Smooth 3D flip animation using CSS transforms (perspective, preserve-3d)
  - Enhanced value formatting: `format` prop supports "number", "currency", "percent", "compact", "none"
  - Accessible: aria-label, aria-pressed, keyboard navigation
  - StatCardsContainer helper for responsive grid layouts with static Tailwind classes
  - Comprehensive test coverage (33 tests)
  - Fully typed with TypeScript and exported from the UI package entrypoint

## 0.32.0

### Minor Changes

- c888798: ## Visual Form Builder: GrapesJS Studio SDK Migration

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

  ### Existing GrapesJS Project Data (`gjsData`)

  This migration does **not** automatically transform previously saved GrapesJS project data.

  If your application stores `gjsData` from the old `GrapesEditor`:

  - Test loading existing projects into `StudioEditor` in a non-production environment first
  - The Studio SDK uses the same underlying GrapesJS engine, so most project data should be compatible
  - If projects fail to load or behave differently, implement an application-level migration
  - Plan a fallback/rollback strategy if you have critical production content

  ***

  ## DataTable Improvements

  - **Export dropdown**: CSV and Excel export options in dropdown menu
  - **Styling updates**: Consistent compact styling with `h-8` buttons
  - **useDataTableContext**: Now exported for external use
  - **DataTableRowActions**: Added `successActive` prop for toggle button styling

  ***

  ## Component Updates

  ### IconButton

  - Added `successActive` variant for active toggle states (green text that fades on hover)
  - Fixed `success` variant to use proper green-600 color

  ### DisplayField

  - Added `text-sm` class to link and value elements for consistent sizing

## 0.31.0

### Minor Changes

- 964df04: Add `gjsData` prop to GrapesEditor component for loading previously saved project data.

  This allows re-editing forms and email templates by passing in the GrapesJS project JSON data that was previously exported via `onSave` or `onExport` callbacks.

## 0.30.0

### Minor Changes

- 3e58f9a: Enhance DataTable with column/row drag-drop, export button, and styling improvements

  **DataTable Enhancements:**

  - Add DataTableContext for shared state (density, font size, column wrapping)
  - Add column drag/drop reordering via ViewOptions panel
  - Add row drag/drop reordering with visual drag handles
  - Add DataTableAddButton component for standardized add actions
  - Add DataTableExportButton with loading state and tooltip
  - Add WrapText toggle to column header menu
  - Update comfy density padding for better visual balance
  - Add data-table-styles.ts for consistent topper button styling

  **UI Component Updates:**

  - Add 'success' variant to IconButton for green hover effect
  - Add 'icon-xs' size to Button component
  - Fix min-width overflow in AdminPageLayout and AppLayout

  **Logger Fix:**

  - Fix api-wrapper.ts Next.js cross-version type compatibility

- 1a22fe0: Add GrapesJS visual editor for forms and emails

  - New `GrapesEditor` component - React wrapper for GrapesJS visual block editor
  - New `EditorToolbar` component - Toolbar with save/export/preview/undo/redo actions
  - `formPreset` - Preset for building application forms with 12 field types (text, textarea, select, radio, checkbox, number, date, file, email, phone, url)
  - `emailPreset` - Preset for building email templates with 10 block types (header, text, heading, button, image, divider, columns, social, footer, spacer)
  - Full TypeScript types for editor configuration, presets, and exported schemas
  - Supports both form schema export (for application forms) and email HTML export (with inlined styles)

  This implements Phase 1 of the unified visual builder initiative.

### Patch Changes

- 2c7343e: Fix TypeScript errors and export GrapesEditor from main index

  - Export GrapesEditor, formPreset, emailPreset, EditorToolbar from main index
  - Fix EditorToolbar import path for Button component
  - Fix device manager type compatibility with GrapesJS
  - Exclude panels from baseConfig type to avoid conflicts
  - Fix component iteration type in extractSections

- 089a368: Fix DataTable review feedback: correct enableRowDrag default, fix context columnWrapping value, add keyboard handlers for drag a11y, fix useIsDesktop JSDoc, simplify export handler

## 0.28.2

### Patch Changes

- 825ad96: Add new utility modules for auth, browser, email, and request handling:

  - **auth.ts**: `parseUserMetadata()`, `getDisplayName()`, `generateRecoveryCodes()` for OAuth metadata parsing and recovery code generation
  - **browser.ts**: `generateDeviceFingerprint()` for collecting browser/device information
  - **email.ts**: `getEmailDomain()` for extracting domains from email addresses
  - **request.ts**: `getClientIP()`, `getGeolocationFromIP()`, `hashString()`, `generateSecureToken()` for server-side request handling

  All utilities include comprehensive TypeScript types and test coverage.

  **@caffeinebounce/ui**: Replaced local `formatDate` with shared utility in DataTableSummary
  **@caffeinebounce/identity**: Replaced local `formatDate` with shared utility in RecoverySection

- Updated dependencies [825ad96]
  - @caffeinebounce/shared-utils@0.4.0

## 0.28.1

### Patch Changes

- 9869cb0: Add comprehensive unit tests for profile-related components

  - ProfileSection: 21 tests covering rendering, edit mode, collapsible behavior
  - DisplayField/DisplayFieldGroup: 24 tests covering basic rendering, links, icons
  - InlineEditableText: 17 tests covering display/edit modes, save/cancel behavior

## 0.28.0

### Minor Changes

- Add DisplayField and DisplayFieldGroup components for read-only field display
- Add ProfileSection component for section headers with optional actions
- Add InlineEditable component family for click-to-edit fields:
  - InlineEditableText: Text/textarea with Enter to save, Escape to cancel
  - InlineEditableDate: Date picker integration with calendar popover
  - InlineEditableSelect: Generic type-safe dropdown select

## 0.27.0

### Minor Changes

- Add DisplayField and DisplayFieldGroup components
- Add ProfileSection component with card/simple variants

## 0.25.0

### Minor Changes

- 14f9f9e: Add SocialIcon and DeleteConfirmationDialog components

  **SocialIcon**: Reusable SVG icons for social media platforms

  - Supports 9 platforms: x, twitter, facebook, instagram, linkedin, pinterest, youtube, tiktok, github
  - Configurable size, optional href link wrapper, newTab support
  - Exports `socialPlatforms` array for iteration
  - Full accessibility with aria-label and title

  **DeleteConfirmationDialog**: Reusable confirmation dialog for destructive actions

  - Async onConfirm support with internal loading state management
  - Customizable title, description, and button labels
  - Danger and warning variants with appropriate styling
  - Accessible dialog implementation using Radix UI

## 0.24.1

### Patch Changes

- 7aa00bc: Fix RadioGroup dark mode styling and migrate Tailwind v4 class names

  - Improved RadioGroup border and focus ring styling for better dark mode visibility
  - Migrated deprecated `bg-gradient-to-*` classes to canonical `bg-linear-to-*` in CohortCard and ImpactSection
  - Added pre-commit hook script to detect deprecated Tailwind v4 class names

## 0.24.0

### Minor Changes

- 519457f: Enhanced useWizardForm hook with data restoration and error extraction helpers

  New utilities for multi-step wizard forms:

  - **createDataRestorationHandler()**: Handles TanStack Form data restoration with proper timing for unmounted fields
  - **extractZodErrors()**: Extracts human-readable error messages from Zod validation results with optional field filtering
  - **getStepErrors option**: Pass actual validation error messages instead of just missing field names

  Bug fixes:

  - Fixed `handleBack` to preserve `highestStepReached` (no longer resets progress when navigating backward)
  - Fixed `handleStepClick` to only update `highestStepReached` when navigating forward
  - Updated `getStepTooltip` to prefer `getStepErrors` for better error messages

- b191a12: UI package updates and new components

  **New Components:**

  - `CohortCard` - Card component for displaying cohort information
  - `BackLink` - Navigation component for back links
  - `IconButton` - Icon-only button variant

  **Layout Improvements:**

  - Enhanced `AdminPageLayout` with better structure
  - Updated `UserPageLayout` with improved responsive design
  - `RootLayout` and `AppLayout` refinements

  **Component Updates:**

  - `Button` - Added new variant support
  - `Tabs` - Enhanced styling and accessibility
  - `Sonner` - Improved toast notification styling
  - `Autocomplete` - Bug fixes
  - `SettingsTabs` - Simplified implementation
  - Data table components - Minor improvements

  **Hook Updates:**

  - `useWizardForm` - Enhanced form handling

### Patch Changes

- 3e45e2d: Fix FormWizard persistence: wait for ALL restored fields to propagate

  The `hasRestoredDataPropagated` check was incorrectly returning `true` when just ONE field matched, which could cause data loss when not all fields had propagated yet. Now it correctly waits for ALL non-empty restored fields to match before allowing saves to proceed.

## 0.23.1

### Patch Changes

- 2ac55e6: Remove background color from DataTable horizontal scrollbar track.

## 0.23.0

### Minor Changes

- c68a21a: DataTable: Standardize cell and header padding for consistent styling

  - Updated cell padding to use `px-2` horizontally to match header button padding
  - Compact density now uses `py-1` for better visual balance
  - Simple string headers are now wrapped with matching `px-2` padding and styled text
  - DataTableColumnHeader fallback (no actions) now includes proper `px-2` padding
  - This ensures DataTable is "droppable" with consistent formatting regardless of whether columns use DataTableColumnHeader or simple string headers

## 0.22.0

### Minor Changes

- 9b4db96: Add cursor-pointer to buttons, variant prop to SettingsTabs, and convert inline hints to tooltips

  **@caffeinebounce/ui:**

  - Added `cursor-pointer` and `disabled:cursor-not-allowed` to Button base styles
  - Added `variant` prop to SettingsTabs supporting "default" (pill) and "underline" styles

  **@caffeinebounce/identity:**

  - RecoverySection: Converted inline recovery email hint to tooltip with Info icon
  - DeleteAccountSection: Converted inline data retention description to tooltip with Info icon
  - DeleteAccountSection: Changed layout for horizontal alignment with right-aligned delete button

## 0.21.1

### Patch Changes

- 29d515e: Remove max-width constraint from Navbar and make BackgroundRippleEffect full-width on all screens. Navbar now extends to screen edges with responsive padding (px-4 md:px-8).
- 29d515e: Fix BackgroundRippleEffect to fill full viewport width on 4K monitors

  - Changed column calculation to use viewport width instead of container width
  - Grid now auto-calculates columns based on window.innerWidth with SSR fallback to 4K (3840px)
  - Added overflow handling in HeroSectionWithRipple wrapper
  - Removed fixed w-full class in favor of explicit 100vw width styling

## 0.21.0

### Minor Changes

- d9bc2e1: Fixes

### Patch Changes

- d9bc2e1: Remove max-width constraint from Navbar and make BackgroundRippleEffect full-width on all screens. Navbar now extends to screen edges with responsive padding (px-4 md:px-8).
- d9bc2e1: Fix BackgroundRippleEffect to fill full viewport width on 4K monitors

  - Changed column calculation to use viewport width instead of container width
  - Grid now auto-calculates columns based on window.innerWidth with SSR fallback to 4K (3840px)
  - Added overflow handling in HeroSectionWithRipple wrapper
  - Removed fixed w-full class in favor of explicit 100vw width styling

# @caffeinebounce/ui

## 0.20.0

### Minor Changes

- 5019ddf: # Cleanup EntitySwitcher

  Cleanup EntitySwitcher: remove avatarUrl and logoDarkUrl, use logoUrl only.

### Patch Changes

- 5019ddf: # Fix AppLayout Fixed Header

  Refactor AppLayout to use a fixed header and scrollable content area, ensuring the navbar remains fixed at the top.

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
