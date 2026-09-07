FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY services/api ./services/api
RUN pnpm install --filter @echoflow/api... --frozen-lockfile=false

FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY --from=deps /app /app
COPY packages ./packages
COPY services/api ./services/api
RUN pnpm --filter @echoflow/types build && pnpm --filter @echoflow/api build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/services/api/dist ./dist
COPY --from=build /app/services/api/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/api/node_modules ./node_modules_local
EXPOSE 4000
CMD ["node", "dist/main.js"]
