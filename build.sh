#!/bin/sh -e
yarn workspace @cedalo/mosquitto-ui-frontend run build
docker build --build-arg MOSQUITTO_UI_BUILD_DATE="$(date)" --build-arg MOSQUITTO_UI_BUILD_NUMBER="$(date '+%s')" -t cedalo/mosquitto-ui:dev .
