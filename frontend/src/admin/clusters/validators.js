const getNodeIdsUniqueValidator = (nodes) => {
    const listOfNodeIds = nodes.map((node) => node.nodeid);

    const areNodeIdsUnique = () => {
        return new Set(listOfNodeIds).size === listOfNodeIds.length;
    };

    return areNodeIdsUnique;
};

const getPrivateAddressesPresentValidator = (nodes) => {
    const listOfNodeAddresses = nodes.map((node) => node.address);

    const arePrivateAddressesPresent = () => {
        return listOfNodeAddresses.every((el) => !!el);
    };

    return arePrivateAddressesPresent;
};

const getPrivateAddressesUniqueValidator = (nodes) => {
    const listOfNodeAddresses = nodes.map((node) => node.address);

    const arePrivateAddressesUnique = () => {
        return new Set(listOfNodeAddresses).size === listOfNodeAddresses.length;
    };

    return arePrivateAddressesUnique;
};

const getBrokersPresentValidator = (nodes) => {
    const listOfNodeBrokers = nodes.map((node) => node.broker);

    const areBrokersPresent = () => {
        return listOfNodeBrokers.every((el) => !!el);
    };

    return areBrokersPresent;
};

export {
    getNodeIdsUniqueValidator,
    getPrivateAddressesPresentValidator,
    getPrivateAddressesUniqueValidator,
    getBrokersPresentValidator,
};
