# syntax=docker/dockerfile:1

FROM node:12.18.1
ENV NODE_ENV=development

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn

COPY . .

CMD [ "node", "server/index.js" ]
