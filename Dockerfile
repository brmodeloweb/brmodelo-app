FROM node:26-alpine

WORKDIR /usr/src/app

COPY pnpm-lock.yaml package.json ./

RUN --mount=type=cache,target=/root/.pnpm --mount=type=cache,target=/root/.cache corepack enable && corepack prepare pnpm@latest --activate && pnpm install

COPY . .

EXPOSE 9000

CMD ["pnpm", "run:fe"]
