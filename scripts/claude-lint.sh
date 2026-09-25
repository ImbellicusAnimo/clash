#!/usr/bin/env bash
# "claude lint": lets Claude review the changes since this branch left main and
# stores the JSON answer in review.json (git-ignored).
#
# Notes:
# - `--tools "Read"` limits the built-in tools to Read, and
#   `--strict-mcp-config` (without any --mcp-config) drops all MCP servers.
#   Both are needed: `--tools` alone still leaves MCP tools available. The diff
#   is still untrusted input, so review the answer before acting on it.
# - Only tracked files are part of `git diff`; new, untracked files are not
#   reviewed until they are added (`git add -N <file>` is enough).
# - package-lock.json is left out: it is large and generated, so it only adds
#   cost. Dependency changes therefore need a look at package.json instead.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if ! git rev-parse --verify -q main >/dev/null; then
  echo "claude lint: no local branch 'main' to compare against." >&2
  exit 1
fi

# The merge-base is where this branch left main. Diffing against main's current
# tip instead would show newer commits on main as reverse changes. The diff
# still contains uncommitted edits.
base=$(git merge-base main HEAD) || {
  echo "claude lint: no common ancestor with main." >&2
  exit 1
}
pathspec=(-- . ':(exclude)package-lock.json')

if git diff --quiet "$base" "${pathspec[@]}"; then
  # Never leave a review of different code behind.
  rm -f review.json
  echo "claude lint: no changes compared to main, nothing to review." >&2
  exit 0
fi

# Written to a private temp file first, so a failed run never clobbers the last
# review and parallel runs do not collide.
tmp=$(mktemp "${TMPDIR:-/tmp}/claude-lint.XXXXXX")
trap 'rm -f "$tmp"' EXIT

git diff "$base" "${pathspec[@]}" | claude -p "list bugs and risks" \
  --output-format json --tools "Read" --strict-mcp-config \
  > "$tmp"
mv "$tmp" review.json

echo "claude lint: review written to review.json" >&2
