# syntax=docker/dockerfile:1
FROM node:alpine

WORKDIR /app

ENV JWT_KEY=eplanner_auth

ENV ENCRYPT_KEY=encrypt_personal_info

ENV VERIFY_KEY=verify_email_address

COPY package.json .

RUN npm install 

EXPOSE 80

COPY . . 

CMD ["npm", "start"]

