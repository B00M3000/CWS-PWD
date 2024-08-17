FROM node:18-alpine AS base

RUN corepack enable pnpm && corepack install -g pnpm@latest-9

WORKDIR /app

COPY pnpm-lock.yaml .
RUN pnpm fetch

FROM base as build

COPY . .
RUN pnpm install -r --offline
RUN pnpm run build

FROM base as prod-deps

COPY package.json .
RUN pnpm install -r --offline --prod

FROM node:18-alpine

COPY package.json .

COPY --from=prod-deps /app/node_modules /node_modules
COPY --from=build /app/build .

ENV PORT=80
ENV BODY_SIZE_LIMIT=52428800

EXPOSE 80/tcp

CMD node -r dotenv/config .


