# Bookmark Search Workspace

## Prerequisites
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
- `apps/web` + `apps/extension` optionally honor `VITE_API_URL`; default is `/api` (web) and `http://localhost:4000` (extension/background).
- Never commit `.env` files. Update `.env.example` if new variables are required.

### Extension
1. Build the bundle:
   ```bash
   pnpm --filter @bookmarks/extension build
   ```
2. Load the output directory in Chrome via `chrome://extensions` → "Load unpacked".
3. Use the toolbar button to instant-save the active tab; the popup form can edit the title/URL before calling the API.

## Testing & Linting
```bash
pnpm lint
pnpm test
pnpm build
```

The API listens on port 4000, and the web app proxies `/api` requests to `localhost:4000` for local development.
