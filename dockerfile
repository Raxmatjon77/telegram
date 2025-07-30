FROM node:lts-alpine AS build

ENV NODE_ENV="development"

WORKDIR /app

COPY .editorconfig .editorconfig
COPY eslint.config.cjs eslint.config.cjs
COPY prettier.config.cjs prettier.config.cjs
COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY pnpm-workspace.yaml pnpm-workspace.yaml
COPY nest-cli.json nest-cli.json
COPY tsconfig.json tsconfig.json
COPY src src
COPY prisma prisma

RUN corepack enable pnpm
RUN pnpm config set store-dir .pnpm
RUN pnpm install --no-frozen-lockfile
RUN pnpm prisma generate
RUN pnpm eslint src/ --fix
RUN pnpm prettier src/ --write
RUN pnpm nest build
RUN pnpm prune --prod

FROM node:lts-alpine

ENV NODE_ENV="production"

USER node

WORKDIR /app

COPY --from=build --chown=node:node /app/dist dist
COPY --from=build --chown=node:node /app/prisma prisma
COPY --from=build --chown=node:node /app/node_modules node_modules
COPY --from=build --chown=node:node /app/package.json package.json
COPY --from=build --chown=node:node /app/pnpm-lock.yaml pnpm-lock.yaml
COPY --from=build --chown=node:node /app/pnpm-workspace.yaml pnpm-workspace.yaml

EXPOSE 3000

CMD ["npx prisma migrate deploy && node dist/main.js"]
