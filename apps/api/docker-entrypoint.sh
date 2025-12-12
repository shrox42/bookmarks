#!/bin/sh
set -eu
set -o pipefail 2>/dev/null || true

echo "Running database migrations..."
node dist/migrate.js

echo "Starting API server..."
exec node dist/server.js
