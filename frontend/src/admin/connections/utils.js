export const getChangedOrNewConnectionIds = (oldConnections, newConnections) => {
    const changedOrNewConnectionIds = [];
    newConnections.forEach((newConnection) => {
        const oldConnection = oldConnections.find((oldConnection) => oldConnection.id === newConnection.id);
        if (!oldConnection || oldConnection.status?.connected !== newConnection.status?.connected) {
            changedOrNewConnectionIds.push(newConnection.id);
        }
    });
    return changedOrNewConnectionIds;
};
