#!/usr/bin/env bash
# Consumer smoke test: pack the module, install it as a real dependency in a temp
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP" "$ROOT"/systeminformation-*.tgz; }
trap cleanup EXIT

cd "$ROOT"
npm run build >/dev/null
npm pack >/dev/null
TARBALL="$(ls -t "$ROOT"/systeminformation-*.tgz | head -1)"

cp test/consumer.mjs test/ci-run.cjs "$TMP/"
cd "$TMP"
npm init -y >/dev/null
npm install "$TARBALL" >/dev/null

fail=0
run() { # $1 = label, rest = command
  local label="$1"; shift
  echo "=== $label ==="
  if "$@" consumer.mjs; then :; else fail=1; fi
  echo
}

run node node
command -v bun  >/dev/null && run bun  bun  || echo "=== bun: skipped (not installed) ==="
command -v deno >/dev/null && run deno deno run -A --node-modules-dir=manual || echo "=== deno: skipped (not installed) ==="

exit $fail
