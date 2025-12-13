# Bookmark Search Workspace

## Docker Quickstart
- Install Docker Desktop (or Docker Engine + Compose).
- Build + run the containers:
  ```bash
  docker compose up --build
  ```
  - Web SPA + `/api`: http://localhost:14747 (Nginx proxies `/api` to the API container)
- Host port conflicts? export `WEB_PORT` before `docker compose up` (default is 14747).
- Rebuild a single service after code changes:
  ```bash
  docker compose build api   # or web
  docker compose up
  ```
- Persistent SQLite data lives in the `api-data` named volume (`file:/data/bookmarks.db`). Reset it with `docker compose down -v`.

## Prerequisites (pnpm workflow)
- Node.js 20 or newer (project is tested on Node 25 via pnpm)
- pnpm 10+

## Installation
```bash
pnpm install
```

## Development
Run every app in watch mode:
```bash
pnpm dev
```

Individual apps:
```bash
pnpm --filter @bookmarks/api dev
pnpm --filter @bookmarks/web dev
pnpm --filter @bookmarks/extension dev
```

### Database
- SQLite file lives at `apps/api/data/bookmarks.db` (gitignored).
- Initialize/repair the schema with:
  ```bash
  pnpm --filter @bookmarks/api migrate
  ```
- Override the location by exporting `DATABASE_URL` before running the API or tests.

### Environment Variables
- `apps/web` + `apps/extension` optionally honor `VITE_API_URL`; default is `/api` (web) and `http://localhost:14747/api` (extension/background when using Docker). The extension reads `VITE_WEB_URL` (default `http://localhost:14747/`, falling back to `VITE_WEB_APP_URL` for compatibility) for its new-tab redirect target and `VITE_ENABLE_NEW_TAB_REDIRECT` (`true` by default) to disable that behavior during development.
- Never commit `.env` files. Update `.env.example` if new variables are required.

### Extension
1. Build the bundle:
   ```bash
   pnpm --filter @bookmarks/extension build
   ```
2. Load the output directory in Chrome via `chrome://extensions` → "Load unpacked".
3. Use the toolbar button to instant-save the active tab; the popup form can edit the title/URL before calling the API.

Blank `chrome://newtab` tabs automatically redirect to the Bookmark SPA at `VITE_WEB_URL` (defaults to `http://localhost:14747/`). To keep Chrome's stock new tab page in development, export `VITE_ENABLE_NEW_TAB_REDIRECT=false` before running `pnpm --filter @bookmarks/extension dev` or building, or point `VITE_WEB_URL` at a different environment.

## Testing & Linting
```bash
pnpm lint
pnpm test
pnpm build
```

The API container still listens on port 4000 internally for both Docker and local dev; the Dockerized web app exposes `http://localhost:14747` and proxies `/api` to `api:4000`, while the Vite dev server proxies `/api` to `localhost:4000`.
