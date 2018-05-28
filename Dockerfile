FROM node:carbon
ARG PROFILE=beta
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY ./profiles/${PROFILE}/.env .
RUN rm -fr profiles
EXPOSE 3000
CMD [ "npm", "start" ]