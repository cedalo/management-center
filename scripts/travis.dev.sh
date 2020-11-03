#!/bin/bash

set -e

docker build --build-arg MOSQUITTO_UI_BUILD_DATE="$(date)" --build-arg MOSQUITTO_UI_BUILD_NUMBER="$(date '+%s')" -t cedalo/mosquitto-ui:dev .
docker push cedalo/mosquitto-ui:dev
