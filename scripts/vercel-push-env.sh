#!/usr/bin/env bash
# Pushes .env.production into Vercel's Production environment variables, one call per line.
# Requires: `vercel login` and `vercel link` already done in this repo.
set -euo pipefail

ENV_FILE="${1:-.env.production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found." >&2
  exit 1
fi

while IFS='=' read -r key value; do
  # Skip blank lines and comments.
  [[ -z "$key" || "$key" == \#* ]] && continue

  # Strip surrounding quotes if present.
  value="${value%\"}"
  value="${value#\"}"

  if [[ "$value" == TODO_* ]]; then
    echo "Skipping $key — still has an unfilled TODO_ placeholder. Fill it in $ENV_FILE first." >&2
    continue
  fi

  echo "Pushing $key..."
  vercel env rm "$key" production --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | vercel env add "$key" production
done < "$ENV_FILE"

echo "Done. Run 'vercel env ls' to confirm what's set."
