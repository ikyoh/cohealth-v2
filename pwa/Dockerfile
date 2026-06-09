#syntax=docker/dockerfile:1


# Versions
FROM node:22 AS node_upstream


# Base stage for dev and build
FROM node_upstream AS base

WORKDIR /srv/app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && \
	corepack prepare pnpm@9.1.3 --activate && \
	pnpm config set store-dir /.pnpm-store --global

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Delete the following line in case you want to enable telemetry during dev and build.
ENV NEXT_TELEMETRY_DISABLED 1


# Development image
FROM base as dev

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME localhost

CMD ["sh", "-c", "rm -rf .next/*; pnpm install --frozen-lockfile --child-concurrency=1 --network-concurrency=4; pnpm dev"]


FROM base AS builder

COPY --link package.json pnpm-lock.yaml ./

RUN pnpm fetch

# Puis copie le reste du code
COPY --link . .

RUN pnpm install --frozen-lockfile --offline && \
	pnpm run build

# Production image, copy all the files and run next
FROM node_upstream AS prod

WORKDIR /srv/app

ENV NODE_ENV production
# Delete the following line in case you want to enable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --gid 1001 nodejs && \
	adduser --uid 1001 --ingroup nodejs --disabled-password --gecos "" nextjs

COPY --from=builder --link /srv/app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next; \
	chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --link --chown=1001:1001 /srv/app/.next/standalone ./
COPY --from=builder --link --chown=1001:1001 /srv/app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
