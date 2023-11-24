# syntax=docker/dockerfile:1
FROM node:alpine

WORKDIR /app

ENV JWT_KEY=eplanner_auth

# ENCRYPT_KEY must be 256 bits (32 bytes) long
ENV ENCRYPT_KEY=a6d597de8e9486cbcb79852775523593da8dcc918bb66c772ac1973235725055

ENV VERIFY_KEY=verify_email_address

ENV AWS_REGION=us-east-1

ENV AWS_SES_ACCESS_KEY_ID=AKIAXXHEB7HTY5IHPWXE

ENV AWS_SES_SEC_KEY=DDi81ZKImAZ3qBIFRwa09HvFHxsOB/IkzhIWRZoT

ENV AWS_SES_SENDER=wujianghao0706@gmail.com

ENV DOMAIN=http://localhost/

COPY package.json .

RUN npm install 

EXPOSE 80

COPY . . 

CMD ["npm", "start"]

