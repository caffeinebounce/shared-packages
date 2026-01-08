---
"@caffeinebounce/ui": minor
---

Add SocialIcon and DeleteConfirmationDialog components

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
