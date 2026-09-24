#!/usr/bin/env bash
# PreToolUse safety hook: blocks reading/writing env files and key material.
# Reads the tool event as JSON on stdin (requires jq). Exit 2 = block.
input=$(cat)

targets=$(jq -r '[.tool_input.file_path, .tool_input.path, .tool_input.notebook_path,
                  .tool_input.pattern, .tool_input.command]
                 | map(select(. != null)) | .[]' <<<"$input")

# Template files are harmless
targets=$(sed -E 's/\.env\.(example|sample|template)//g' <<<"$targets")

sep='($|[[:space:]"'\''])'
pattern="(^|[/[:space:]\"'=])\.env(\.[A-Za-z0-9_-]+)?${sep}"
pattern+="|\.(pem|key|p12|pfx|jks)${sep}"
pattern+="|(^|/)id_(rsa|dsa|ecdsa|ed25519)${sep}"

if grep -Eq "$pattern" <<<"$targets"; then
  echo "Blockiert: Zugriff auf sensible Datei (.env / Schlüsselmaterial) ist nicht erlaubt." >&2
  exit 2
fi
exit 0
