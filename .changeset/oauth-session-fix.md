---
"@caffeinebounce/identity": patch
---

Fix OAuth button styling and session issues:
- Keep consistent button structure with icon + text during OAuth redirect
- Show loading spinner in place of OAuth provider icon with "Redirecting..." text
- Clear stale PKCE code verifiers from localStorage before OAuth flow to prevent "invalid sign in session" errors
