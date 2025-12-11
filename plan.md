# Bookmark Search System – Implementation Plan

## Workspace & Tooling
- [ ] Initialize pnpm workspace (`pnpm-workspace.yaml`) covering `apps/*` and `packages/*`; root `package.json` defines scripts (`dev`, `build`, `lint`, `test`) that delegate via `pnpm --filter`.
- [ ] Add shared configs: `tsconfig.base.json`, ESLint/Prettier, Tailwind base styles, `.editorconfig`, `.npmrc` (enforce pnpm) and `.gitignore`.
- [ ] Create `packages/shared` with Bookmark domain types (zod schema + TypeScript interfaces), reusable fetch client, short-url helper, and shared UI primitives exported for web + extension.

## Backend API (`apps/api`)
- [ ] Scaffold Express + TypeScript project (Node 20) using pnpm workspace deps.
- [ ] Set up SQLite (`data/bookmarks.db`, gitignored) with migration utility (drizzle-kit or custom script); define `bookmarks` table mirroring the model.
- [ ] Implement services for CRUD + upsert-by-URL; ensure timestamps auto-update and URLs remain unique.
- [ ] Routes:
  - [ ] `GET /bookmarks` – list, optional pagination.
  - [ ] `GET /bookmarks/search?q=` – leverage SQL `LIKE` + optional Fuse.js fallback for fuzzy matches.
  - [ ] `POST /bookmarks` – create/update by URL.
  - [ ] `PUT /bookmarks/:id` – update fields.
  - [ ] `DELETE /bookmarks/:id` – remove entry.
- [ ] Middleware: CORS (allow SPA origin + extension), JSON parsing, structured logging, centralized error handler.
- [ ] Scripts: `pnpm --filter api dev` (tsx watch), `build` (tsc emit), `start` (node dist). Add Vitest + supertest coverage for services/routes.

## Web App (`apps/web`)
- [ ] Bootstrap React + Vite + TypeScript; integrate Tailwind, shadcn/ui (CLI), lucide-react icons, and shared UI primitives.
- [ ] Establish global data layer (React Query or Zustand) interfacing with shared API client; handle optimistic updates for mutations.
- [ ] Views:
  - [ ] **Search (default)**: loads bookmarks on mount, fuzzy client search (Fuse.js) on title+URL, keyboard navigation (custom hook) and Enter to `window.open`.
  - [ ] **Add Bookmark**: form with validation (zod + react-hook-form), success toast, returns to Search, refresh data.
  - [ ] **Manage Bookmarks**: table/list of entries with inline edit modal (Title/URL) and delete confirmation using shadcn dialog; all actions keyboard accessible.
- [ ] Provide navigation controls to switch views plus prominent “Add”/“Manage” buttons; ensure focus management per requirements.
- [ ] Configure Vite dev server proxy to API (`/api` → `http://localhost:<api-port>`); set build script output for deployment.
- [ ] Add Vitest + React Testing Library for critical hooks/components (search filtering, form validation).

## Browser Extension (`apps/extension`)
- [ ] Create MV3 manifest targeting Chromium/Edge (`action`, `permissions: ["tabs"]`, `host_permissions` for API, `background.service_worker` entry).
- [ ] Bundle background worker + popup via Vite (separate config) consuming shared Bookmark client/types.
- [ ] Background flow: on toolbar click, fetch active tab info (`chrome.tabs.query`), POST to API, show badge or notification for success/error.
- [ ] Popup UI (React + Tailwind/shadcn):
  - [ ] Prefill title/URL from active tab data via `chrome.runtime.sendMessage`.
  - [ ] Allow title edits, call API via shared client, show toast feedback.
- [ ] Provide build script that outputs packaged extension (zip instructions optional) and a `dev` script with `pnpm --filter extension dev` for watch reload.

## Quality, Docs & Ops
- [ ] Root scripts orchestrate concurrent dev (`pnpm dev` running API + web + extension watchers via `tsx`/`vite` + `concurrently` or `turbo`).
- [ ] Implement ESLint + Prettier workspace-wide; ensure CI-ready commands (lint/test/build) succeed.
- [ ] Document setup & usage in `README.md`/`docs` (pnpm install, running individual apps, building extension, SQLite file location).
- [ ] Add `.gitignore` entries (`node_modules`, `dist`, `data/*.db`, etc.) and note pnpm requirements (Node 20 LTS).
