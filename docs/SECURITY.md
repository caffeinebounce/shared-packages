# Security Policy

This policy covers security reporting and maintenance for the
`caffeinebounce/shared-packages` monorepo.

The repository contains shared TypeScript packages published under the
`@caffeinebounce/*` scope, plus the `CaffeineNativeUI` Swift package. These
packages are consumed by production applications, so vulnerability reports
should be handled privately until a fix is available.

## Supported Surfaces

Security reports may apply to:

- Published `@caffeinebounce/*` package code and package entry points
- Shared Swift package code under `swift/`
- Build, test, release, and publishing workflows
- Package metadata that affects consumer install, runtime, or type safety
- Documentation or examples that would lead consumers to deploy insecure
  configurations

Issues that are specific to one consuming application usually belong in that
application's repository unless the root cause is in a shared package.

## Reporting a Vulnerability

Do not open a public GitHub issue for suspected vulnerabilities.

Report privately through GitHub's private vulnerability reporting for this
repository. If that is unavailable, contact a repository maintainer directly
and include `SECURITY` in the subject.

Include as much of the following as possible:

- Affected package, version, branch, or commit
- Clear reproduction steps or a proof of concept
- Expected and actual impact
- Whether the issue is already public or actively exploited
- Any known mitigations or temporary workarounds

Please do not access, modify, exfiltrate, or destroy data that does not belong
to you while validating a report.

## What to Report

Examples of reportable vulnerabilities include:

- Authentication, authorization, or session handling flaws in shared identity
  code
- Cross-site scripting, injection, or unsafe rendering behavior in shared UI
  components
- Secret exposure in package code, published artifacts, examples, or workflows
- Supply-chain risks in release automation, package exports, or dependency
  configuration
- Unsafe defaults that materially weaken consumer application security

The following usually do not require private security handling:

- General hardening suggestions without a concrete exploit path
- Dependency bumps with no known exploitable impact on this repository
- Documentation clarity issues that do not introduce unsafe behavior
- Vulnerabilities that only apply to a consumer application's own configuration

When in doubt, report privately and the maintainers will route it.

## Maintainer Response

Maintainers will triage reports based on severity, exploitability, affected
packages, and consumer exposure.

Expected handling:

1. Acknowledge the report within a reasonable timeframe.
2. Reproduce and scope the issue.
3. Prepare a fix, mitigation, or documented risk decision.
4. Release patched packages when published artifacts are affected.
5. Publicly disclose enough detail for consumers to understand impact and
   update safely after the fix is available.

Critical or actively exploited issues should be prioritized ahead of normal
feature work.

## Disclosure

Security details should remain private until maintainers have had time to
investigate and prepare a fix. After remediation, the repository may publish a
GitHub Security Advisory, release notes, or other public notes depending on the
scope and severity.

Reporters may be credited if they want attribution.

## Security Maintenance

The repository uses automated checks to reduce security regressions, including
dependency review, CodeQL, package contract validation, tests, type checks, and
secret scanning hooks.

Maintainers should:

- Keep release automation and package exports reviewable and least-privileged.
- Avoid publishing secrets, local configuration, or test credentials.
- Prefer secure defaults in shared packages and document required consumer
  configuration.
- Treat changes to auth, checkout, notification, publishing, and package
  boundary code as higher risk.
- Add regression tests or package smoke coverage when fixing security-relevant
  behavior.

Package-specific hardening guidance can live in separate implementation docs.
This file should stay focused on the overarching reporting and response policy.
