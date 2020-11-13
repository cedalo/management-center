FROM node:14.15.0-alpine
LABEL maintainer="philip.ackermann@cedalo.com"

ARG MOSQUITTO_UI_BUILD_DATE
ENV MOSQUITTO_UI_BUILD_DATE=${MOSQUITTO_UI_BUILD_DATE}
ARG MOSQUITTO_UI_BUILD_NUMBER
ENV MOSQUITTO_UI_BUILD_NUMBER=${MOSQUITTO_UI_BUILD_NUMBER}
ENV MOSQUITTO_UI_PROXY_CONFIG_DIR=/mosquitto-ui/config/config.json
# RUN apk --no-cache add g++ make bash curl gnupg 

WORKDIR /mosquitto-ui

COPY backend/package.json .
COPY yarn.lock .
RUN yarn install --prod --frozen-lockfile

COPY backend .
COPY frontend/build public
COPY docker/config.json ./config/
COPY docker/docker-entrypoint.sh .

VOLUME /mosquitto-ui/config

EXPOSE 8088

CMD [ "sh", "docker-entrypoint.sh" ]
