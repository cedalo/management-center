export const toClusterConnectionEntries = (clusterDetails) => {
    const clusterConnections = {};
    // clusterDetails is a dict of cluternames and their details
    // clusterConnections is a dict of brokernames and their respective clusternodes
    clusterDetails && Object.keys(clusterDetails).forEach((clustername) => {
        const clusterDetail = clusterDetails[clustername];

        clusterDetail?.nodes.forEach((node) => {
            clusterConnections[node.broker] = { clustername, isLeader: node.leader };
        });
    });

    return clusterConnections;
};


export const allClustersHaveLeaders = (clusterDetails) => {
	for (const clusterName in clusterDetails) {
		const cluster = clusterDetails[clusterName];
		if (!cluster.nodes.some(node => node.leader)) { // if none have preperty leeader set to true
			return false;
		}
	}
	return true;
};