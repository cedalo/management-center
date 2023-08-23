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


const getSyncModes = () => SYNCMODES;

const getSyncModeLabel = (syncmode) => {
	const modeidx = syncmode === 'dynsec' ? 1 : 0;
	return SYNCMODES[modeidx].label;
};

const defaultNodeBroker = (nodeid) => concat(BROKER_PREFIX, nodeid);

const defaultNodeAddress = (nodeid) => concat(ADDRESS_PREFIX, nodeid);

const generateClusterDetails = async (client, clusters) => {
	const clusterDetails = {};
	// it's not ideal to make requests for every cluster, but that's what we currently have
	if (clusters && Array.isArray(clusters)) {
		for (const cluster of clusters) {
			clusterDetails[cluster.clustername] = await client.getCluster(cluster.clustername);
		}
	}
	
	return clusterDetails;
};


export {
	getSyncModes,
	getSyncModeLabel,
	defaultNodeBroker,
	defaultNodeAddress,
	generateClusterDetails,
};
