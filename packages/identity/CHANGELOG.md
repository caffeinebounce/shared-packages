# @caffeinebounce/identity

## 0.3.1

### Patch Changes

- 29d515e: Fix: Replace workspace:\* with npm version for @caffeinebounce/ui dependency

  The workspace:\* protocol doesn't work for consumers who install these packages from npm/GitHub Packages since they don't have a local workspace with @caffeinebounce/ui. This caused "workspace not found" errors when installing in consuming projects like Compass.

- Updated dependencies [29d515e]
- Updated dependencies [29d515e]
  - @caffeinebounce/ui@0.21.1

## 0.3.0

### Minor Changes

- d9bc2e1: Fixes

### Patch Changes

- Updated dependencies [d9bc2e1]
- Updated dependencies [d9bc2e1]
- Updated dependencies [d9bc2e1]
  - @caffeinebounce/ui@0.21.0

## 0.2.6

### Patch Changes

- 1db65fa: Fix auth redirects to use NEXT_PUBLIC_SITE_URL

  - ForgotPasswordForm: use callback route with PKCE flow for password reset
  - SigninForm: use production site URL for OAuth redirects
  - SignupForm: use production site URL for OAuth and email verification
  - Add 'callback' link to AuthLinks type for PKCE code exchange routing

  This ensures auth redirects work correctly in production environments.

## 0.2.5

### Patch Changes

- Updated dependencies [5019ddf]
- Updated dependencies [5019ddf]
  - @caffeinebounce/ui@1.0.0

## 0.2.4

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.17.0

## 0.2.3

### Patch Changes

- Updated dependencies
- Updated dependencies [643fdb6]
- Updated dependencies [3b2e926]
- Updated dependencies [898eda5]
  - @caffeinebounce/ui@0.16.0

## 0.2.2

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.15.2

## 0.2.1

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.15.1

## 0.2.0

### Minor Changes

- Email verification fix

## 0.1.14

### Patch Changes

- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
- Updated dependencies [92f0a7a]
  - @caffeinebounce/ui@0.15.0

## 0.1.13

### Patch Changes

- Updated dependencies [5d4a257]
  - @caffeinebounce/ui@0.14.1

## 0.1.12

### Patch Changes

- Updated dependencies [fa443a8]
  - @caffeinebounce/ui@0.14.0

## 0.1.11

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.13.0

## 0.1.10

### Patch Changes

- df90d1c: Upgrade dependencies and align versions.
- Updated dependencies [965b44c]
- Updated dependencies
- Updated dependencies [df90d1c]
  - @caffeinebounce/ui@0.12.0

## 0.1.9

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.11.0

## 0.1.8

### Patch Changes

- Updated dependencies [bc310ab]
- Updated dependencies [bc310ab]
  - @caffeinebounce/ui@0.10.0

## 0.1.7

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.9.14

## 0.1.6

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.9.13

## 0.1.5

### Patch Changes

- Export MFAConfirmDialog component

## 0.1.4

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.4.0

## 0.1.3

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.3.0

## 0.1.2

### Patch Changes

- Updated dependencies
  - @caffeinebounce/ui@0.2.0
