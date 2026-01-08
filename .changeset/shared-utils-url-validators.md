---
"@caffeinebounce/shared-utils": minor
---

Add social media URL and handle validators

New features:
- `createSocialUrlSchema()` - Factory function to create platform-specific URL validators
- `createSocialHandleSchema()` - Factory function to create platform-specific handle validators
- `createUrlSchema()` - Generic URL validator factory

Pre-built validators for URLs:
- `linkedinUrlSchema` - LinkedIn URLs (supports subdomains)
- `facebookUrlSchema` - Facebook URLs (including fb.com)
- `pinterestUrlSchema` - Pinterest URLs
- `xUrlSchema` - X/Twitter URLs (supports both x.com and twitter.com)
- `youtubeUrlSchema` - YouTube URLs (including youtu.be)
- `tiktokUrlSchema` - TikTok URLs
- `websiteUrlSchema` - Generic website URLs

Pre-built validators for handles:
- `instagramHandleSchema` - Instagram handles (max 30 chars)
- `xHandleSchema` - X/Twitter handles (max 15 chars)
- `tiktokHandleSchema` - TikTok handles (max 24 chars)

All validators:
- Accept URLs with or without protocol prefix
- Handle empty strings gracefully (for optional fields)
- Return helpful error messages with examples
