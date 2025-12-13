# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
RUN apk add --no-cache libc6-compat \
  && corepack enable \
  && corepack prepare pnpm@10.19.0 --activate

FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @bookmarks/shared build \
  && pnpm --filter @bookmarks/api build \
  && pnpm --filter @bookmarks/web build \
  && pnpm --filter @bookmarks/extension build
RUN SKIP_EXTENSION_BUILD=1 ./scripts/package-extension.sh
RUN pnpm deploy --legacy --filter @bookmarks/api --prod /app/out/api \
  && chmod +x /app/out/api/docker-entrypoint.sh
RUN mkdir -p /app/out/web \
  && cp -R apps/web/dist/. /app/out/web/

FROM node:20-alpine AS api-runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
RUN apk add --no-cache libc6-compat
COPY --from=builder /app/out/api .
EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]

FROM nginx:1.27-alpine AS web-runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out/web /usr/share/nginx/html
