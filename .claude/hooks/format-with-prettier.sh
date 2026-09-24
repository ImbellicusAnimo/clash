#!/usr/bin/env bash
# PostToolUse hook: formats the file Claude just edited/wrote with prettier.
# The tool event arrives as JSON on stdin (requires jq). Never blocks: a
# formatting problem must not fail the edit itself.
file=$(jq -r '.tool_input.file_path // empty')
[ -n "$file" ] && [ -f "$file" ] || exit 0

if [ -x "$CLAUDE_PROJECT_DIR/node_modules/.bin/prettier" ]; then
  prettier="$CLAUDE_PROJECT_DIR/node_modules/.bin/prettier"
elif command -v prettier >/dev/null 2>&1; then
  prettier=prettier
else
  exit 0
fi

"$prettier" --write --ignore-unknown "$file" >/dev/null 2>&1
exit 0
