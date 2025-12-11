# Bookmark Search System – Implementation Plan

## Workspace & Tooling
- [x] Initialize pnpm workspace (`pnpm-workspace.yaml`) covering `apps/*` and `packages/*`; root `package.json` defines scripts (`dev`, `build`, `lint`, `test`) that delegate via `pnpm --filter`.
- [x] Add shared configs: `tsconfig.base.json`, ESLint/Prettier, Tailwind base styles, `.editorconfig`, `.npmrc` (enforce pnpm) and `.gitignore`.
- [x] Create `packages/shared` with Bookmark domain types (zod schema + TypeScript interfaces), reusable fetch client, short-url helper, and shared UI primitives exported for web + extension.

## Backend API (`apps/api`)
- [x] Scaffold Express + TypeScript project (Node 20+) using pnpm workspace deps.
- [x] Wire SQLite via Drizzle ORM + libSQL client (`apps/api/src/schema.ts`, `db.ts`) with migration utility; define `bookmarks` table mirroring the model.
- [x] Implement services for CRUD + upsert-by-URL; ensure timestamps auto-update and URLs remain unique.
- [x] Routes:
  - [x] `GET /bookmarks` – list, optional pagination.
  - [x] `GET /bookmarks/search?q=` – leverage SQL `LIKE` + optional Fuse.js fallback for fuzzy matches.
  - [x] `POST /bookmarks` – create/update by URL.
  - [x] `PUT /bookmarks/:id` – update fields.
  - [x] `DELETE /bookmarks/:id` – remove entry.
- [x] Middleware: CORS (allow SPA origin + extension), JSON parsing, structured logging, centralized error handler.
- [x] Scripts: `pnpm --filter api dev` (tsx watch), `build` (tsc emit), `start` (node dist). Add Vitest + supertest coverage for services/routes.

## Web App (`apps/web`)
- [x] Bootstrap React + Vite + TypeScript; integrate Tailwind, shadcn/ui (CLI), lucide-react icons, and shared UI primitives.
- [x] Establish global data layer (React Query or Zustand) interfacing with shared API client; handle optimistic updates for mutations.
- [ ] Views:
  - [x] **Search (default)**: loads bookmarks on mount, fuzzy client search (Fuse.js) on title+URL, keyboard navigation (custom hook) and Enter to `window.open`.
  - [x] **Add Bookmark**: form with validation (zod + react-hook-form), success toast, returns to Search, refresh data.
  - [x] **Manage Bookmarks**: table/list of entries with inline edit modal (Title/URL) and delete confirmation using shadcn dialog; all actions keyboard accessible.
- [x] Provide navigation controls to switch views plus prominent “Add”/“Manage” buttons; ensure focus management per requirements.
- [x] Configure Vite dev server proxy to API (`/api` → `http://localhost:<api-port>`); set build script output for deployment.
- [x] Add Vitest + React Testing Library for critical hooks/components (search filtering, form validation).

## Browser Extension (`apps/extension`)
- [x] Create MV3 manifest targeting Chromium/Edge (`action`, `permissions: ["tabs"]`, `host_permissions` for API, `background.service_worker` entry).
- [x] Bundle background worker + popup via Vite (separate config) consuming shared Bookmark client/types.
- [x] Background flow: on toolbar click, fetch active tab info (`chrome.tabs.query`), POST to API, show badge or notification for success/error.
- [x] Popup UI (React + Tailwind/shadcn):
  - [x] Prefill title/URL from active tab data via `chrome.runtime.sendMessage`.
  - [x] Allow title edits, call API via shared client, show toast feedback.
- [x] Provide build script that outputs packaged extension (zip instructions optional) and a `dev` script with `pnpm --filter extension dev` for watch reload.

## Quality, Docs & Ops
- [x] Root scripts orchestrate concurrent dev (`pnpm dev` running API + web + extension watchers via `tsx`/`vite` + `concurrently` or `turbo`).
- [x] Implement ESLint + Prettier workspace-wide; ensure CI-ready commands (lint/test/build) succeed.
- [x] Document setup & usage in `README.md`/`docs` (pnpm install, running individual apps, building extension, SQLite file location).
- [x] Add `.gitignore` entries (`node_modules`, `dist`, `data/*.db`, etc.) and note pnpm requirements (Node 20 LTS).
