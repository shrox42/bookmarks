#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

EXT_DIR="$ROOT_DIR/apps/extension"
DIST_DIR="$EXT_DIR/dist"
PUBLIC_DIR="$ROOT_DIR/apps/web/public/extension"
WEB_DIST_DIR="$ROOT_DIR/apps/web/dist/extension"

VERSION="$(node -p "require('./apps/extension/package.json').version")"
ZIP_BASENAME="bookmark-dropper-v${VERSION}"
ZIP_PATH="$PUBLIC_DIR/${ZIP_BASENAME}.zip"
MANIFEST_PATH="$PUBLIC_DIR/${ZIP_BASENAME}.json"
LATEST_MANIFEST_PATH="$PUBLIC_DIR/latest.json"

if [ "${SKIP_EXTENSION_BUILD:-0}" != "1" ]; then
  rm -rf "$DIST_DIR"
  pnpm --filter @bookmarks/extension build
fi

mkdir -p "$PUBLIC_DIR"
rm -f "$PUBLIC_DIR"/bookmark-dropper-v*.zip "$PUBLIC_DIR"/bookmark-dropper-v*.json "$LATEST_MANIFEST_PATH"

if [ ! -d "$DIST_DIR" ]; then
  echo "Extension dist directory not found at $DIST_DIR" >&2
  exit 1
fi

(
  cd "$DIST_DIR"
  pnpm exec bestzip "$ZIP_PATH" .
)

SHA256="$(node -e "const fs=require('node:fs');const crypto=require('node:crypto');const file=process.argv[1];const buf=fs.readFileSync(file);console.log(crypto.createHash('sha256').update(buf).digest('hex'))" "$ZIP_PATH")"
BUILD_METADATA="$(node -e "console.log(new Date().toISOString())")"

export VERSION ZIP_PATH SHA256 BUILD_METADATA MANIFEST_PATH LATEST_MANIFEST_PATH

node <<'NODE'
const fs = require('node:fs');
const path = require('node:path');

const data = {
  version: process.env.VERSION,
  fileName: path.basename(process.env.ZIP_PATH),
  sha256: process.env.SHA256,
  builtAt: process.env.BUILD_METADATA,
};

for (const target of [process.env.MANIFEST_PATH, process.env.LATEST_MANIFEST_PATH]) {
  fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n');
}
NODE

if [ -d "$ROOT_DIR/apps/web/dist" ]; then
  mkdir -p "$WEB_DIST_DIR"
  cp "$ZIP_PATH" "$WEB_DIST_DIR/"
  cp "$MANIFEST_PATH" "$WEB_DIST_DIR/"
  cp "$LATEST_MANIFEST_PATH" "$WEB_DIST_DIR/"
fi

echo "Created $ZIP_PATH and metadata."
