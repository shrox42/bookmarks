#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Please run this installer with sudo or as root."
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SYSTEMD_UNIT_NAME="bookmarks.service"
SYSTEMD_UNIT_PATH="/etc/systemd/system/${SYSTEMD_UNIT_NAME}"
BOOKMARKS_ENV_PATH="/opt/bookmarks/bookmarks.env"

command -v docker >/dev/null 2>&1 || { echo "Docker is required."; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "\"docker compose\" plugin is required."; exit 1; }
command -v rsync >/dev/null 2>&1 || { echo "rsync is required."; exit 1; }

install -d /opt/bookmarks

if [[ ! -f "${BOOKMARKS_ENV_PATH}" ]]; then
  install -m 644 "${REPO_ROOT}/deploy/environment/bookmarks.env" "${BOOKMARKS_ENV_PATH}"
  echo "Created ${BOOKMARKS_ENV_PATH} from template. Edit it if you need custom paths or ports."
fi

set -a
source "${BOOKMARKS_ENV_PATH}"
set +a

: "${BOOKMARKS_ROOT:?BOOKMARKS_ROOT is required in ${BOOKMARKS_ENV_PATH}}"
: "${BOOKMARKS_DATA_DIR:?BOOKMARKS_DATA_DIR is required in ${BOOKMARKS_ENV_PATH}}"
: "${COMPOSE_PROJECT_NAME:?COMPOSE_PROJECT_NAME is required in ${BOOKMARKS_ENV_PATH}}"

BOOKMARKS_APP_DIR="${BOOKMARKS_ROOT}/app"

install -d "${BOOKMARKS_APP_DIR}"
rsync -a --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.turbo' \
  "${REPO_ROOT}/" "${BOOKMARKS_APP_DIR}/"

install -d "${BOOKMARKS_DATA_DIR}"

VOLUME_NAME="${COMPOSE_PROJECT_NAME}_api-data"
if ! docker volume inspect "${VOLUME_NAME}" >/dev/null 2>&1; then
  docker volume create \
    --driver local \
    --opt type=none \
    --opt o=bind \
    --opt device="${BOOKMARKS_DATA_DIR}" \
    "${VOLUME_NAME}" >/dev/null
fi

install -Dm644 "${REPO_ROOT}/deploy/systemd/bookmarks.service" "${SYSTEMD_UNIT_PATH}"
systemctl daemon-reload
systemctl enable --now "${SYSTEMD_UNIT_NAME}"

echo "Bookmark Search service installed and started."
