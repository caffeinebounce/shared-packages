# Product Vision: shared-packages

> MIT-licensed shared packages for @caffeinebounce applications

---

## Mission

**One-liner:** Provide consistent, high-quality UI components and utilities
across applications that consume the `@caffeinebounce/*` package scope.

**Why it matters:** Multiple applications share common interface, auth,
messaging, logging, and utility patterns. Centralizing these reduces
duplication, improves consistency, and accelerates development.

---

## User Personas

### Primary: Maintainer

- **Who:** Developer maintaining packages or consuming them from an application
- **Goals:** Ship features fast with consistent, polished UI; avoid reinventing patterns
- **Pain points:** Duplicated code, inconsistent styling, hunting for component APIs
- **Success looks like:** Import a component, it works, types are excellent, docs are clear

### Secondary: External Reader

- **Who:** Developer reviewing the MIT-licensed repository or evaluating package behavior
- **Goals:** Understand the package surface, release process, and support boundary
- **Pain points:** Breaking changes, poor documentation, opaque dependencies
- **Success looks like:** Clear MIT license, stable semver, clear changelogs, no surprises

---

## Core User Journeys

### Journey 1: Add A UI Component To A Consumer App

**Persona:** Maintainer
**Goal:** Use a shared component in an app

1. Find the component in `@caffeinebounce/ui`
2. Import it with full TypeScript support
3. Use props with excellent autocomplete
4. Component renders correctly with minimal config
5. Styling integrates seamlessly with Tailwind v4

**Must work flawlessly.** This is the primary use case.

### Journey 2: Update Shared Packages In A Consumer App

**Persona:** Maintainer
**Goal:** Get the latest shared packages into a consumer repository

1. Shared-packages publishes new version
2. Consumer receives or manually creates an update PR
3. Review changes, verify lint/build/test pass
4. Merge PR
5. App has latest packages without breakage

**Must be low-friction.** Automated flow is critical.

### Journey 3: Add New Component to Shared Packages

**Persona:** Maintainer
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

- Build a general-purpose public component library for external organizations
- Support non-React frameworks
- Provide theme customization beyond Tailwind
- Maintain backwards compatibility indefinitely

---

*Last Updated: 2026-01-16*
