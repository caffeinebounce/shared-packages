# Scanning git history for leaked tokens

Before performing any history rewrite operations, it's helpful to identify all commits/branches that contain the leakage.

Replace the placeholder `ghp_OLD_TOKEN` with the actual token string you LEAKED and run the following commands locally in your repository.

## Quick scan for the token in current tree

```bash
# Search in the working tree
git grep -n "ghp_OLD_TOKEN" || echo "No matches in current working tree"
```

## Search in the commit history

```bash
# Show commits which introduce or remove this string (git pickaxe)
git log --all -S "ghp_OLD_TOKEN" --pretty=format:'%h %an %ad %s' --date=short

# List the commits alone
git log --all -S "ghp_OLD_TOKEN" --pretty=format:'%H'
```

## Grep all revisions (brute force — slower)

```bash
# This can be slow on large repos but finds the token across all commits
for commit in $(git rev-list --all); do
  git grep -n "ghp_OLD_TOKEN" $commit || true
done
```

## Notes
- Replace the token in the commands with the real string when you run them locally.
- If the token appears in tags, branches, or old releases, plan to rewrite those refs too.
- After you've verified which commits contain the token, use `git filter-repo` to rewrite history as described in the `SECURITY/purge-github-token.md` document.

If you'd like, I can prepare the replacements file with the exact token and run the filter-repo steps in a mirrored clone; just confirm the token rotation and give me the go-ahead for the rewrite (I won't force-push without your explicit approval).