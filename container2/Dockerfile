FROM node:alpine

WORKDIR /app1

COPY package.json package.json

RUN npm install

COPY . .

EXPOSE 6000

CMD [ "npm","start" ]