# syntax=docker/dockerfile:1
FROM node:alpine

WORKDIR /app

ENV JWT_KEY=eplanner_auth

COPY package.json .

RUN npm install --only=prod

COPY . . 

CMD ["npm", "start"]

