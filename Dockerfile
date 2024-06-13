FROM ubuntu:20.04
LABEL maintainer="philip.ackermann@cedalo.com"
# Avoiding user interaction with tzdata
ENV DEBIAN_FRONTEND=noninteractive

ARG CEDALO_MC_BUILD_DATE
ENV CEDALO_MC_BUILD_DATE=${CEDALO_MC_BUILD_DATE}
ARG CEDALO_MC_BUILD_NUMBER
ENV CEDALO_MC_BUILD_NUMBER=${CEDALO_MC_BUILD_NUMBER}
ENV CEDALO_MC_PROXY_CONFIG=/management-center/config/config.json
ENV CEDALO_MC_PROXY_HOST=0.0.0.0
ARG CEDALO_MC_PROXY_BASE_PATH
ENV CEDALO_MC_PROXY_BASE_PATH=${CEDALO_MC_PROXY_BASE_PATH}


# Update the package repository and install necessary packages
RUN apt-get update && apt-get install -y \
    curl \
    xz-utils \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js v16
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs


WORKDIR /management-center

COPY backend backend
RUN cd backend && yarn install --prod --frozen-lockfile

COPY frontend/build backend/public
COPY docker/config.json ./config/
COPY docker/docker-entrypoint.sh backend

WORKDIR /management-center/backend

VOLUME /management-center/config

EXPOSE 8088

CMD [ "sh", "docker-entrypoint.sh" ]
