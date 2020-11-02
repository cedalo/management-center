#!/bin/bash

set -e

docker build --build-arg MOSQUITTO_UI_BUILD_DATE="$(date)" --build-arg MOSQUITTO_UI_BUILD_NUMBER="$(date '+%s')" -t cedalo/mosquitto-ui:travis .
docker push cedalo/mosquitto-ui:travis
