const BROKER_PREFIX = undefined; // process.env.CEDALO_MC_DEV_CLUSTER_NODE_BROKER_PREFIX;
const ADDRESS_PREFIX = undefined; // process.env.CEDALO_MC_DEV_CLUSTER_NODE_ADDRESS_PREFIX;
const concat = (prefix, suffix) => (prefix ? `${prefix}${suffix}` : undefined);

const SYNCMODES = Object.freeze([
	{
		label: 'Full Sync',
		value: 'full'
	},
	{
		label: 'Dynamic Security Sync',
		value: 'dynsec'
	}
]);

module.exports = {
	getSyncModes: () => SYNCMODES,
	getSyncModeLabel: (syncmode) => {
		const modeidx = syncmode === 'dynsec' ? 1 : 0;
		return SYNCMODES[modeidx].label;
	},
	defaultNodeBroker: (nodeid) => concat(BROKER_PREFIX, nodeid),
	defaultNodeAddress: (nodeid) => concat(ADDRESS_PREFIX, nodeid)
};
