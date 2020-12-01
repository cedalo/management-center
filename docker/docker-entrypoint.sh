#!/bin/bash -e

NOCOLOR='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
ORANGE='\033[0;33m'
YELLOW='\033[1;33m'

echo -e "${GREEN}Starting Management Center for Eclipse Mosquitto${NOCOLOR}"

node start.js
