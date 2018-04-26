FROM node:carbon
ARG STAGE=beta
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY ./rocks/${STAGE}/.env .
RUN rm -fr rocks
EXPOSE 3000
CMD [ "npm", "start" ]