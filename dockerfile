
FROM node:lts-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY . .

ENV PORT 8700

EXPOSE $PORT

CMD yarn migration:run && yarn db:seed && yarn start:prod
