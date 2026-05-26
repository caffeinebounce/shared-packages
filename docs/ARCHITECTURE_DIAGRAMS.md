# Architecture And Release Flow

## Monorepo Layout

```mermaid
flowchart TB
  root["shared-packages"]
  js["packages/*"]
  native["swift/CaffeineNativeUI"]
  docs["docs"]
  scripts["scripts"]
  root --> js
  root --> native
  root --> docs
  root --> scripts
```

## Package Build Flow

```mermaid
flowchart LR
  src["TypeScript source"] --> tsup["tsup"]
  tsup --> dist["dist JS and DTS"]
  dist --> validate["validate package contracts"]
  validate --> pack["package tarball"]
  pack --> registry["GitHub Packages"]
```

Each package declares explicit `files` allowlists so publish output is limited
to built `dist` artifacts, package metadata, CSS where needed, and changelogs.
Source maps are disabled for public-readiness so package tarballs do not include
embedded source copies.

## Changeset Release Flow

```mermaid
flowchart TD
  change["Feature PR with package change"] --> changeset["changeset file"]
  changeset --> merge["merge feature PR"]
  merge --> version["Changesets version PR"]
  version --> release["merge version PR"]
  release --> publish["publish workflow"]
  publish --> packages["GitHub Packages"]
  publish --> notify["optional consumer notification"]
```

Consumer notification is optional and should be configured without documenting
private consumer operational details in this repository.

## Local Hook Flow

```mermaid
flowchart TD
  commit["developer commit"] --> hygiene["file hygiene"]
  hygiene --> biome["Biome format and lint"]
  biome --> types["TypeScript check"]
  types --> secrets["secrets detection"]
  secrets --> message["conventional commit"]
  message --> done["commit accepted"]
```

If a hook auto-fixes files, the hook re-stages the generated changes and retries
within the configured limit.

## Public-Readiness Boundary

```mermaid
flowchart LR
  repo["public source repository"] --> rights["MIT license"]
  repo --> workflows["read-only default workflow permissions"]
  repo --> codeql["public-only CodeQL workflow"]
  repo --> gitleaks["full-history secret scan"]
  packages["restricted packages"] --> allowlists["manifest files allowlists"]
  packages --> noMaps["no source maps in tarballs"]
```

The repository can be MIT-licensed while packages remain restricted on GitHub
Packages. That posture should stay explicit in manifests, workflow permissions,
and public documentation.
