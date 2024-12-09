const os = require('os');

const CEDALO_HOST_NAME = process.env.CEDALO_HOST_NAME;

const toAddress = ({ address }) => address;
const isPublicIP =
    (ipFamily) =>
    ({ family, internal }) =>
        family === ipFamily && !internal;

module.exports = {
    // in case we are running inside a docker container, default hostname will be container's hostname not actual hostname. Thath's why in such cases we have to pass it as an env var to docker-compose environment secion
    hostname: CEDALO_HOST_NAME || os.hostname(),
    hostIPs: {
        // get all external v4 ip addresses and v6 addresses as arrays
        v4: Object.values(os.networkInterfaces()).flat().filter(isPublicIP('IPv4')).map(toAddress),
        v6: Object.values(os.networkInterfaces()).flat().filter(isPublicIP('IPv6')).map(toAddress),
    },
};
