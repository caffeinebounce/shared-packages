---
"@caffeinebounce/identity": patch
"@caffeinebounce/ai-assistant": patch
---

Fix: Replace workspace:* with npm version for @caffeinebounce/ui dependency

The workspace:* protocol doesn't work for consumers who install these packages from npm/GitHub Packages since they don't have a local workspace with @caffeinebounce/ui. This caused "workspace not found" errors when installing in consuming projects like Compass.
