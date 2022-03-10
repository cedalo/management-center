FROM node:14.15.0-alpine
LABEL maintainer="philip.ackermann@cedalo.com"

ARG CEDALO_MC_BUILD_DATE
ENV CEDALO_MC_BUILD_DATE=${CEDALO_MC_BUILD_DATE}
ARG CEDALO_MC_BUILD_NUMBER
ENV CEDALO_MC_BUILD_NUMBER=${CEDALO_MC_BUILD_NUMBER}
ENV CEDALO_MC_PROXY_CONFIG=/management-center/config/config.json
ENV CEDALO_MC_PROXY_HOST=0.0.0.0
# RUN apk --no-cache add g++ make bash curl gnupg 

WORKDIR /management-center

COPY backend/package.json .
COPY yarn.lock .
RUN yarn install --prod --frozen-lockfile

COPY backend .
COPY frontend/build public
COPY docker/config.json ./config/
COPY docker/docker-entrypoint.sh .

VOLUME /management-center/config

EXPOSE 8088

CMD [ "sh", "docker-entrypoint.sh" ]
