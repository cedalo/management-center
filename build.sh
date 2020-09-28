cd frontend && yarn build
cd ..
docker build . -t cedalo/mosquitto-ui