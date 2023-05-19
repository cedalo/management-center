const os = require('os');

const toAddress = ({ address }) => address;
const isPublicIP = (ipFamily) => ({ family, internal }) => family === ipFamily && !internal;

module.exports = {
	hostname: os.hostname(),
	hostIPs: {
		v4: Object.values(os.networkInterfaces()).flat().filter(isPublicIP('IPv4')).map(toAddress),
		v6: Object.values(os.networkInterfaces()).flat().filter(isPublicIP('IPv6')).map(toAddress)
	}
};
