FROM node:16-alpine
RUN mkdir -p /usr/src/app
ENV APP_PATH /usr/src/app
COPY package.json $APP_PATH
WORKDIR $APP_PATH
RUN yarn install
COPY . $APP_PATH
# expose port 3000 for server and 9000 for webpack-dev-server
EXPOSE 3000 9000
# run start:frontend and start:dev in parallel
CMD ["yarn", "start:frontend", "start:dev"]
