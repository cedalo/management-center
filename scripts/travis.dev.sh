#!/bin/bash

set -e

docker build --build-arg CEDALO_MC_BUILD_DATE="$(date)" --build-arg CEDALO_MC_BUILD_NUMBER="$(date '+%s')" -t cedalo/mosquitto-ui:dev .
docker push cedalo/mosquitto-ui:dev
