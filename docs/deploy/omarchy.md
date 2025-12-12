# Omarchy Deployment Guide

This guide documents how to install, run, and maintain the Bookmark Search stack as a `systemd` service on Omarchy (Arch-based) hosts. The workflow keeps runtime containers lightweight: boot simply starts the Compose stack while database migrations run only when you trigger an update.

## Prerequisites
- A sudo-capable user on an Arch/Omarchy system with `systemd`
- Docker Engine + `docker compose` plugin
- `rsync` (for mirroring the repo into `/opt/bookmarks/app`)

## Directory Layout & Environment
The installer expects the following defaults (editable in `deploy/environment/bookmarks.env` before installation):

| Variable | Default | Purpose |
| --- | --- | --- |
| `BOOKMARKS_ROOT` | `/opt/bookmarks` | Parent directory for the deployment |
| `BOOKMARKS_DATA_DIR` | `/opt/bookmarks/data` | Host path bound to the SQLite data volume |
| `WEB_PORT` | `47474` | Host port exposed by the Nginx `web` container |
| `COMPOSE_PROJECT_NAME` | `bookmarks` | Compose project prefix (controls volume names) |

Copy the template into place (the installer does this automatically) and adjust the values if you need a different path or port:

```bash
sudo install -Dm644 deploy/environment/bookmarks.env /opt/bookmarks/bookmarks.env
sudoedit /opt/bookmarks/bookmarks.env
```

## Installation
Run the installer from the repo root:

```bash
sudo scripts/install-omarchy-service.sh
```

What the script does:
1. Verifies Docker + Compose + rsync are available.
2. Copies the repo into `${BOOKMARKS_ROOT}/app` (rsync keeps it idempotent).
3. Creates `${BOOKMARKS_DATA_DIR}` and pre-creates the named volume (`${COMPOSE_PROJECT_NAME}_api-data`) bound to that host directory so database files persist outside Docker.
4. Installs `/etc/systemd/system/bookmarks.service`, which sources `/opt/bookmarks/bookmarks.env` and runs `docker compose up -d` from `${BOOKMARKS_ROOT}/app`.
5. Enables and starts the service.

Check status/logs after install:

```bash
sudo systemctl status bookmarks.service
sudo journalctl -u bookmarks.service -f
```

## Daily Operation
- UI + `/api` proxy live at `http://localhost:${WEB_PORT}` (defaults to `47474`).
- The API container still listens on `4000` internally; external clients (SPA, browser extension) should use `http://localhost:${WEB_PORT}/api`.
- Data lives in `${BOOKMARKS_DATA_DIR}`; back it up like any other directory (e.g., `sudo tar -czf bookmarks-data.tgz -C ${BOOKMARKS_DATA_DIR} .`).

## Updating the Service
1. Pull the latest repo changes into your working tree (or let the update script do it for you if the deployment copy has a remote).
2. Run:

   ```bash
   sudo scripts/bookmarks-update.sh
   ```

   The script stops the unit, optionally runs `git pull` inside `${BOOKMARKS_ROOT}/app`, rebuilds images, runs migrations via `docker compose run --rm api node dist/migrate.js`, and restarts the service. Set `BOOKMARKS_SKIP_PULL=1` in `/opt/bookmarks/bookmarks.env` if you distribute updates another way (e.g., copying artifacts in).

## Troubleshooting Checklist
- `sudo systemctl status bookmarks.service` – confirm the unit is active.
- `sudo docker compose --env-file /opt/bookmarks/bookmarks.env -f ${BOOKMARKS_ROOT}/app/docker-compose.yml ps` – check container health.
- `sudo journalctl -u bookmarks.service -n 200 --no-pager` – view recent logs.
- `sudo docker compose --env-file /opt/bookmarks/bookmarks.env logs api` – inspect API errors.

If `docker compose` fails due to volume permissions, ensure `${BOOKMARKS_DATA_DIR}` is owned by the user Docker runs as (usually root) and exists before starting the service.

## Backup & Restore Tips
- Back up `${BOOKMARKS_DATA_DIR}` regularly; it contains the SQLite file mounted inside the API container.
- To restore, stop the service, replace the directory contents with your backup, and restart.
- For full disaster recovery, also keep a copy of `/opt/bookmarks/bookmarks.env` and `${BOOKMARKS_ROOT}/app` (or your Git remote).
