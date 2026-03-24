# Product Vision: shared-packages

> Reusable packages for Capital Collective projects

---

## Mission

**One-liner:** Provide consistent, high-quality UI components and utilities across
all Capital Collective applications.

**Why it matters:** Multiple apps (Compass, ZenBid, douglasebanks.com) share common
patterns. Centralizing these reduces duplication, ensures consistency, and accelerates
development across the portfolio.

---

## User Personas

### Primary: Internal Developer

- **Who:** Developer working on Compass, ZenBid, or other Capital Collective apps
- **Goals:** Ship features fast with consistent, polished UI; avoid reinventing patterns
- **Pain points:** Duplicated code, inconsistent styling, hunting for component APIs
- **Success looks like:** Import a component, it works, types are excellent, docs are clear

### Secondary: Future External Consumer

- **Who:** Developer in another org who might use these packages
- **Goals:** Reliable, well-documented components with predictable behavior
- **Pain points:** Breaking changes, poor documentation, opaque dependencies
- **Success looks like:** Stable semver, clear changelogs, no surprises

---

## Core User Journeys

### Journey 1: Add a UI Component to Compass

**Persona:** Internal Developer
**Goal:** Use a shared component in an app

1. Find the component in `@caffeinebounce/ui`
2. Import it with full TypeScript support
3. Use props with excellent autocomplete
4. Component renders correctly with minimal config
5. Styling integrates seamlessly with Tailwind v4

**Must work flawlessly.** This is the primary use case.

### Journey 2: Update Shared Packages in Consumer App

**Persona:** Internal Developer
**Goal:** Get latest shared-packages in Compass

1. Shared-packages publishes new version
2. Compass receives automated update PR
3. Review changes, verify lint/build/test pass
4. Merge PR
5. App has latest packages without breakage

**Must be low-friction.** Automated flow is critical.

### Journey 3: Add New Component to Shared Packages

**Persona:** Internal Developer
**Goal:** Create a reusable component

1. Create component in appropriate package
2. Export from package entry point
3. Write tests
4. Create changeset
5. PR merged, auto-published, consumers notified

**Must be straightforward.** Clear conventions, minimal ceremony.

---

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| `@caffeinebounce/ui` | UI primitives and blocks (Button, Card, Dialog, layouts) | Active |
| `@caffeinebounce/identity` | Auth components and handlers | Active |
| `@caffeinebounce/email` | Email templates and Resend client | Active |
| `@caffeinebounce/ai-assistant` | AI chat panel components | Active |
| `@caffeinebounce/logger` | Structured logging utilities | Active |
| `@caffeinebounce/shared-utils` | Common utilities | Active |
| `@caffeinebounce/commerce` | Checkout and Stripe helpers | Active |
| `@caffeinebounce/notifications` | Shared notification UI and hooks | Active |

---

## Design Principles

1. **Consistency over flexibility:** Opinionated defaults reduce decision fatigue
2. **Type safety is non-negotiable:** Strict TypeScript, no `any`, excellent inference
3. **Tree-shakeable by default:** No nested barrel exports that re-export other indexes
4. **Server-safe first:** Components work in RSC; client components explicitly marked
5. **Minimal dependencies:** Each package should be lean; avoid dependency sprawl

### Technical Standards

- [ ] All exports typed with no implicit `any`
- [ ] No nested barrel re-exports; main index imports directly from source
- [ ] `"use client"` directive only where necessary
- [ ] Peer dependencies for React, not bundled
- [ ] ESM-first with CJS fallback
- [ ] Vitest tests for critical paths

---

## Success Metrics

| Metric | Target | How to measure |
|--------|--------|----------------|
| Type coverage | 100% strict | `tsc --noEmit` passes |
| Bundle impact | < 50KB per component | Bundle analyzer |
| Update friction | < 5 min to merge | Time from PR to merge |
| Breaking changes | 0 unintentional | Changeset discipline |

---

## Non-Goals

Things we're explicitly NOT trying to do:

- Build a public component library for external orgs (yet)
- Support non-React frameworks
- Provide theme customization beyond Tailwind
- Maintain backwards compatibility indefinitely (internal use allows iteration)

---

*Last Updated: 2026-01-16*
