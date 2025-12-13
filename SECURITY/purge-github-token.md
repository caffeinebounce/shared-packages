# Purging a leaked GitHub token from git history

This document provides a safe, repeatable set of steps for removing a GitHub personal access token (PAT) from git history. It is intentionally conservative — the procedure rewrites git history and requires a forced push. Only do this after rotating the leaked token.

⚠️ IMPORTANT: Rewriting git history is destructive. Coordinate with your team and ensure everyone agrees to a force push and knows how to reset their local clones.

## Steps — summary

1. Revoke the leaked token and create a new one (rotate immediately).
2. Backup your repo (mirror clone):

```bash
git clone --mirror /path/to/repo /path/to/repo-backup.git
```

3. Use `git filter-repo` to replace the token in the repository history.

4. Push rewritten history to remote (force push) and revoke the old PAT on GitHub if not already.

5. Communicate to your team and instruct them to re-clone or reset local branches.

---

## Recommended approach (using git filter-repo)

`git-filter-repo` is fast and modern, and GitHub recommends the tool for rewriting git history.

1. Ensure you have `git-filter-repo` installed. On macOS using Homebrew:

```bash
brew install git-filter-repo
```

2. Make a mirrored clone of the repository (this is the one we'll rewrite):

```bash
git clone --mirror https://github.com/owner/repo.git repo.git
cd repo.git
```

3. Create `replacements.txt` containing the token mapping. Replace the placeholder `ghp_OLD_TOKEN` with the actual leaked token string. Do NOT commit `replacements.txt` in your normal commit history — this is temporary for the rewrite operation.

```
# replacements.txt
ghp_OLD_TOKEN==>GITHUB_TOKEN_REDACTED
```

4. Run `git filter-repo` with the replacement file:

```bash
git filter-repo --replace-text replacements.txt
```

5. Cleanup: remove the local copy of `replacements.txt` and any temporary backup dirs.

6. Push the rewritten history back to GitHub (force push):

```bash
# Push everything
git push --force --all origin
git push --force --tags origin
```

7. In the repository root, remove any remaining traces of the token in the current branch if present (for example, in `.yarnrc.yml` — we've already done that for this repo):

```bash
# Make sure working tree is clean first
git checkout main
# If any files still contain secrets, update them and commit the change normally
# Example: ensure .yarnrc.yml now references ${GITHUB_TOKEN}
```

8. Communicate to your team and provide push coordination instructions (see the section below).

---

## Alternative approach (using BFG Repo-Cleaner)

1. Install BFG:

```bash
brew install bfg
```

2. Create a mirrored clone of the repository and run BFG:

```bash
git clone --mirror https://github.com/owner/repo.git
bfg --replace-text <(printf 'ghp_OLD_TOKEN==>GITHUB_TOKEN_REDACTED') repo.git
cd repo.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force --all
git push --force --tags
```

---

## Post-purge checklist and communication

- [ ] Confirm the old token is revoked on GitHub and replaced by a new one.
- [ ] Force push should be coordinated. The person handling the force push should:
  - Inform the team
  - Make the push
  - Have a rollback plan (mirror backup) in case of issues

### For team members: Recovering after a force push

1. If you have work to keep, create a bundle or a patch from your current branch.
2. Fetch the updated remote and reset your branches (clean rebase is easiest if you shared changes):

```bash
git fetch origin
# For main branch
git checkout main
git reset --hard origin/main  # WARNING: this will discard local commits not pushed
```

3. For feature branches, you may want to rebase them onto the updated main:

```bash
git checkout feature-branch
git rebase origin/main
# Or re-apply patches
```

---

## Notes

- This is a powerful, destructive operation. If you want me to run the purge, I can prepare the `replacements.txt` (with the exact token) and run the commands in a mirrored clone; but I will not push the changes without your explicit approval.
- If you do not want to include the token in the replacement file on disk, you can instead use in-memory replacements with `git filter-repo` by piping them in or using process substitution as shown above.
- After a history rewrite for a leaked PAT, the highest-priority action is to revoke and rotate the token; rewriting git history is only secondarily important.

---

If you'd like me to prepare the `replacements.txt` file containing the exact token and run the rewrite in a mirrored clone, say the word and confirm the token was rotated, and I will proceed (I will NOT push the changes unless you explicitly ask for the force push step).