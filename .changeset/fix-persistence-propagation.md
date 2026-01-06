---
"@caffeinebounce/ui": patch
---

Fix FormWizard persistence: wait for ALL restored fields to propagate

The `hasRestoredDataPropagated` check was incorrectly returning `true` when just ONE field matched, which could cause data loss when not all fields had propagated yet. Now it correctly waits for ALL non-empty restored fields to match before allowing saves to proceed.
