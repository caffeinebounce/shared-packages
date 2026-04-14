# Local CI on the Mac mini

Shared-packages can run PR, branch, and manual CI locally on the Mac mini without burning GitHub-hosted runner minutes.

## What it does

- polls GitHub for open PR heads plus configured branch heads
- schedules repo-owned CI lanes by event type
- runs one lane at a time from a clean git worktree
- reuses the base checkout's `node_modules` and `.yarn` when present
- stores logs and result metadata under `.local-ci/`
- posts separate commit statuses back to GitHub for each lane context

Default lane mapping:

- pull requests -> `pr-fast` -> `local-ci/pr-fast`
- configured branches (default `main`) -> `branch-full` -> `local-ci/branch-full`
- manual invocations -> `heavy-full` -> `local-ci/heavy-full`
- optional manual publish smoke -> `live-smoke` -> `local-ci/live-smoke`

## Lane contents

### `pr-fast`

1. `yarn lint`
2. `yarn typecheck`

### `branch-full`

1. everything in `pr-fast`
2. `yarn test`
3. `yarn build`
4. `yarn validate:packages`

### `heavy-full`

Runs everything in `branch-full`, then also runs:

5. `yarn workspaces foreach -A -t --if-present run test:coverage`

### `live-smoke`

Manual-only lane for release readiness smoke:

1. `yarn publish:check`

## Required local setup

1. Clone the repo on the Mac mini.
2. Bootstrap dependencies once in the base checkout:

   ```bash
   corepack enable
   corepack prepare yarn@4.12.0 --activate
   yarn install
   ```

3. Create `.local-ci/local-ci.env` from the tracked example:

   ```bash
   mkdir -p .local-ci
   cp config/local-ci.env.example .local-ci/local-ci.env
   ```

4. Edit `.local-ci/local-ci.env` for the Mac mini.

At minimum:

```bash
export LOCAL_CI_GITHUB_TOKEN=ghp_xxx
export LOCAL_CI_GITHUB_REPO=caffeinebounce/shared-packages
export LOCAL_CI_BRANCHES=main
export LOCAL_CI_PR_LANES=pr-fast
export LOCAL_CI_BRANCH_LANES=branch-full
export LOCAL_CI_MANUAL_LANES=heavy-full
export LOCAL_CI_POLL_INTERVAL=120
export LOCAL_CI_PR_LIMIT=20
```

### GitHub token scopes

Use a fine-grained token for the `caffeinebounce/shared-packages` repo with at least:

- Contents: Read
- Pull requests: Read
- Commit statuses: Read and write
- Packages: Read

## Manual runs

List supported lanes and contexts:

```bash
python3 scripts/local_ci_runner.py --list-lanes
```

Run one polling pass:

```bash
python3 scripts/local_ci_runner.py --repo . --state-dir .local-ci --once
```

Dry-run discovery without executing CI:

```bash
python3 scripts/local_ci_runner.py --repo . --state-dir .local-ci --once --dry-run
```

Force a specific ref/sha through the default manual lane (`heavy-full`):

```bash
python3 scripts/local_ci_runner.py \
  --repo . \
  --state-dir .local-ci \
  --once \
  --ref refs/heads/main \
  --sha "$(git rev-parse origin/main)" \
  --run-key manual-main \
  --description "manual main run"
```

Run any lane directly inside the current checkout:

```bash
bash ci/run_lane.sh --lane pr-fast --artifacts-dir .local-ci/manual-pr-fast
bash ci/run_lane.sh --lane branch-full --artifacts-dir .local-ci/manual-branch-full
bash ci/run_lane.sh --lane heavy-full --artifacts-dir .local-ci/manual-heavy-full
bash ci/run_lane.sh --lane live-smoke --artifacts-dir .local-ci/manual-live-smoke
```

## LaunchAgent install

Install or update the polling service:

```bash
scripts/install_local_ci_launchagent.sh
```

Useful commands after install:

```bash
launchctl print gui/$(id -u)/com.caffeinebounce.shared-packages.local-ci
launchctl kickstart -k gui/$(id -u)/com.caffeinebounce.shared-packages.local-ci
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.caffeinebounce.shared-packages.local-ci.plist
```

## Files and state

- env template: `config/local-ci.env.example`
- runner state: `.local-ci/state.json`
- per-run logs and artifacts: `.local-ci/runs/<run-id>/`
- temporary worktrees: `.local-ci/worktrees/`
- launchd logs: `.local-ci/launchd/`

## Rollout plan

1. Pull this branch on the Mac mini checkout.
2. Bootstrap `node_modules` once.
3. Create `.local-ci/local-ci.env` and add the GitHub token.
4. Run a smoke pass locally:

   ```bash
   python3 scripts/local_ci_runner.py --repo . --state-dir .local-ci --once --dry-run
   bash ci/run_lane.sh --lane pr-fast --artifacts-dir .local-ci/rollout-pr-fast
   ```

5. Install the LaunchAgent with `scripts/install_local_ci_launchagent.sh`.
6. Watch the first real run in `.local-ci/launchd/` and `.local-ci/runs/`.
7. If you want to cut over branch protection later, swap required checks to the local contexts.
