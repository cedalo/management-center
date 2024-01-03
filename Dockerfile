FROM node:16-alpine
LABEL maintainer="philip.ackermann@cedalo.com"

ARG CEDALO_MC_BUILD_DATE
ENV CEDALO_MC_BUILD_DATE=${CEDALO_MC_BUILD_DATE}
ARG CEDALO_MC_BUILD_NUMBER
ENV CEDALO_MC_BUILD_NUMBER=${CEDALO_MC_BUILD_NUMBER}
ENV CEDALO_MC_PROXY_CONFIG=/management-center/config/config.json
ENV CEDALO_MC_PROXY_HOST=0.0.0.0

WORKDIR /management-center

COPY backend backend
RUN cd backend && yarn install --prod --frozen-lockfile

COPY frontend/build backend/public
COPY docker/config.json ./config/
COPY docker/docker-entrypoint.sh backend

VOLUME /management-center/config

EXPOSE 8088

CMD [ "sh", "docker-entrypoint.sh" ]
