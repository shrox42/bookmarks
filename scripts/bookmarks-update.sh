#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Please run this update script with sudo or as root."
  exit 1
fi

BOOKMARKS_ENV_PATH="/opt/bookmarks/bookmarks.env"
SYSTEMD_UNIT_NAME="bookmarks.service"

if [[ ! -f "${BOOKMARKS_ENV_PATH}" ]]; then
  echo "Missing ${BOOKMARKS_ENV_PATH}. Run scripts/install-omarchy-service.sh first."
  exit 1
fi

set -a
source "${BOOKMARKS_ENV_PATH}"
set +a

: "${BOOKMARKS_ROOT:?BOOKMARKS_ROOT must be set in ${BOOKMARKS_ENV_PATH}}"

BOOKMARKS_APP_DIR="${BOOKMARKS_ROOT}/app"

systemctl stop "${SYSTEMD_UNIT_NAME}"

if [[ "${BOOKMARKS_SKIP_PULL:-0}" != "1" ]]; then
  if [[ ! -d "${BOOKMARKS_APP_DIR}/.git" ]]; then
    echo "Missing git data in ${BOOKMARKS_APP_DIR}. Re-run the installer."
    exit 1
  fi

  git -C "${BOOKMARKS_APP_DIR}" fetch origin main || {
    echo "git fetch origin main failed. Resolve the issue and rerun."
    exit 1
  }

  git -C "${BOOKMARKS_APP_DIR}" checkout main >/dev/null 2>&1 || {
    echo "Unable to checkout main in ${BOOKMARKS_APP_DIR}."
    exit 1
  }

  git -C "${BOOKMARKS_APP_DIR}" reset --hard origin/main || {
    echo "git reset --hard origin/main failed. Resolve the issue and rerun."
    exit 1
  }
fi

pushd "${BOOKMARKS_APP_DIR}" >/dev/null
docker compose --env-file "${BOOKMARKS_ENV_PATH}" build
docker compose --env-file "${BOOKMARKS_ENV_PATH}" run --rm api node dist/migrate.js
popd >/dev/null

systemctl start "${SYSTEMD_UNIT_NAME}"

echo "Bookmark Search service updated and restarted."
