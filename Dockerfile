FROM node:16-alpine

WORKDIR /usr/src/app

COPY yarn.lock package.json .

RUN --mount=type=cache,target=/root/.yarn --mount=type=cache,target=/root/.cache YARN_CACHE_FOLDER=/root/.yarn yarn install

COPY . .

# expose port 3000 for server and 9000 for webpack-dev-server
EXPOSE 3000 9000

# run start:frontend and start:dev in parallel
CMD ["yarn", "start:frontend", "start:dev"]
