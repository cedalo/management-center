

const getBrokerById = (brokerConnections, id) => brokerConnections.find(brokerConnection => brokerConnection.id === id);

export {
    getBrokerById
}