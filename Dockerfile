FROM node:18.18.0-alpine

ENV PORT 3000

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

ADD . /app/

EXPOSE 3000

CMD ["node", "server.js"]