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
command -v tar >/dev/null 2>&1 || { echo "tar is required."; exit 1; }
command -v cp >/dev/null 2>&1 || { echo "cp is required."; exit 1; }

if [[ ! -d "${REPO_ROOT}/.git" ]]; then
  echo "This installer must run from a git working tree."
  exit 1
fi

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

TMP_SYNC_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "${TMP_SYNC_DIR}"
}
trap cleanup EXIT

tar -C "${REPO_ROOT}" -cf - \
  --exclude='./node_modules' \
  --exclude='./.turbo' \
  --exclude='./.pnpm-store' \
  . | tar -C "${TMP_SYNC_DIR}" -xf -

rm -rf "${BOOKMARKS_APP_DIR}"
install -d "${BOOKMARKS_APP_DIR}"
cp -a "${TMP_SYNC_DIR}/." "${BOOKMARKS_APP_DIR}/"

trap - EXIT
rm -rf "${TMP_SYNC_DIR}"

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
