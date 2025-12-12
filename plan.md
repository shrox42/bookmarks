# Easy Local Deployment Plan

## Goal
Enable any contributor to run the Bookmark Search system locally using only Docker/Docker Compose (no Node.js or pnpm on the host) by introducing containerized builds for the API and web SPA plus documentation.

## Deliverables
- Workspace-level `.dockerignore` to shrink build context.
- Multi-stage `Dockerfile` that installs workspace deps once and emits runtime-ready artifacts for API and web.
- API entrypoint script that runs migrations before launching the server.
- Nginx config (or equivalent) that serves the built SPA and proxies `/api` traffic to the API container.
- `docker-compose.yml` orchestrating API + web services with a named volume for the SQLite database.
- Documentation updates (`README.md`, `docs/setup.md`) covering Docker prerequisites and usage instructions.

## Work Items
1. **Audit build outputs**
   - Confirm `pnpm -r build` creates `apps/api/dist` + `apps/web/dist` and that shared packages ship compiled code suitable for runtime copying.
2. **Author `.dockerignore`**
   - Ignore `node_modules`, `apps/*/dist`, `apps/api/data`, `pnpm-store`, log files, and other non-essential artifacts.
3. **Implement multi-stage Dockerfile**
   - Base stage: `node:20-alpine`, enable Corepack/pnpm, copy lock/workspace manifests.
   - Builder: copy repo, run `pnpm install --frozen-lockfile` and `pnpm -r build`.
   - Use `pnpm deploy --filter ...` (or manual copy) to emit slim runtime bundles for API and web.
   - Runtime stages: `api-runtime` copies API bundle, `web-runtime` copies web dist plus static server binary/config.
4. **Add API entrypoint script**
   - Script ensures `node dist/migrate.js` executes before `node dist/server.js` inside the container; mark executable.
5. **Create web server config**
   - Provide Nginx (or similar) config with SPA fallback and `/api` proxy to `http://api:4000`.
6. **Write docker-compose.yml**
   - Define `api` (port 4000, volume mount for `apps/api/data`) and `web` (port 5173→80) services referencing Dockerfile targets.
   - Declare named volume `api-data` for persistent SQLite storage.
   - Ensure service dependency so web waits for API.
7. **Document workflow**
   - Update `README.md` + `docs/setup.md` with Docker requirement, `docker compose up --build`, rebuilding instructions, and how to reset persisted data.
8. **Validate**
   - Run `docker compose build` and `docker compose up`, verify API reachable at `http://localhost:4000/bookmarks` and SPA at `http://localhost:5173`, including `/api` proxy behavior.

## Risks & Mitigations
- **Cold build time**: Keep contexts slim via `.dockerignore` and pnpm deploy to reduce image size.
- **File permission on entrypoint**: Set executable bit during build (`chmod +x`).
- **Hot reload expectations**: Document that Docker flow targets “easy deploy,” while pnpm dev remains best for rapid iteration.
