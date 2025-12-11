# Bookmark Search System

A pnpm-powered monorepo that ships the API, React SPA, Chromium extension, and shared packages required for the Bookmark Search experience shown in `/Mocks`.

## Packages

- `apps/api` – Express + SQLite backend with CRUD/search routes, validation via Zod, and Vitest coverage.
- `apps/web` – Vite + React + Tailwind/shadcn-inspired UI matching the mock, with React Query orchestration and optimistic UX.
- `apps/extension` – MV3 background worker + popup that talk to the API via the shared fetch client.
- `packages/shared` – Bookmark domain schema, fetch client, helper utilities, and shared UI primitives (Button/Input/Surface/etc.).

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create the SQLite database (generates `apps/api/data/bookmarks.db`):
   ```bash
   pnpm --filter @bookmarks/api migrate
   ```
   - Override `DATABASE_URL` with a `file:` path (or remote `libsql:` / Turso URL) if you need a custom location.
3. Run everything in development:
   ```bash
   pnpm dev
   ```
   - API → http://localhost:4000
   - Web client → http://localhost:5173 (proxies `/api`)
   - Extension → load `apps/extension/dist` as an unpacked extension after running `pnpm --filter @bookmarks/extension build`

## Quality Gates

```bash
pnpm lint   # ESLint across workspace
pnpm test   # Vitest suites (API routes + web hooks)
pnpm build  # Type-check + production builds for every target
```

Additional details (environment variables, extension packaging tips, and mock requirements) live in `docs/setup.md`. The day-by-day roadmap remains in `plan.md`; make sure to tick items there as milestones complete.
