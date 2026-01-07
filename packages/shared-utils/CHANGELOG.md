# @caffeinebounce/shared-utils

## 0.2.0

### Minor Changes

- 9e96f8a: Create new @caffeinebounce/shared-utils package

  This new package contains shared utility functions extracted from Compass to reduce code duplication across projects:

  **Formatters** (`@caffeinebounce/shared-utils/formatters`)

  - `formatDate` - Format dates with customizable options
  - `formatDateTime` - Format dates with time
  - `formatPhoneNumber` - Format US phone numbers
  - `formatCurrency` - Format numbers as currency
  - `formatPercentage` - Format numbers as percentages
  - `formatNumber` - Format numbers with locale-aware separators

  **String utilities** (`@caffeinebounce/shared-utils/string`)

  - `getInitials` - Extract initials from names
  - `ensureAbsoluteUrl` - Add https:// to URLs missing protocol
  - `truncate` - Truncate text with ellipsis
  - `slugify` - Convert text to URL-safe slugs
  - `capitalize` - Capitalize first letter
  - `pluralize` - Pluralize words based on count

  **Image utilities** (`@caffeinebounce/shared-utils/image`)

  - `compressImage` - Compress images using Canvas API (returns base64)
  - `compressImageAsFile` - Compress images (returns File object)
  - `getImageDimensions` - Get image dimensions from File

  All utilities handle null/undefined gracefully with sensible defaults.

## 0.1.0

### Minor Changes

- Initial release with formatting, string, and image utilities
