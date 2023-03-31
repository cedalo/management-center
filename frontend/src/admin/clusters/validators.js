
const getNodeIdsUniqueValidator = (nodes) => {
    const listOfNodeIds = nodes.map(node => node.nodeId);
    
    const areNodeIdsUnique = () => {
        return (new Set(listOfNodeIds)).size === listOfNodeIds.length;
    };

    return areNodeIdsUnique;
};


const getPrivateAddressesPresentValidator = (nodes) => {
    const listOfNodeAddresses = nodes.map(node => node.address);

    const arePrivateAddressesPresent = () => {
        return listOfNodeAddresses.every(el => !!el === true);
    };

    return arePrivateAddressesPresent;
};


const getBrokersPresentValidator = (nodes) => {
    const listOfNodeBrokers = nodes.map(node => node.broker);

    const areBrokersPresent = () => {
        return listOfNodeBrokers.every(el => !!el === true);
    };

    return areBrokersPresent;
};


export {
    getNodeIdsUniqueValidator,
    getPrivateAddressesPresentValidator,
    getBrokersPresentValidator,
};