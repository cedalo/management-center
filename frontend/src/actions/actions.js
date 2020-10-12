import * as ActionTypes from '../constants/ActionTypes';

export function updateClient(update) {
    return {
        type: ActionTypes.UPDATE_CLIENT,
        update
    }
}

export function updateClients(update) {
    return {
        type: ActionTypes.UPDATE_CLIENTS,
        update
    }
}

export function updateGroup(update) {
    return {
        type: ActionTypes.UPDATE_GROUP,
        update
    }
}

export function updateGroups(update) {
    return {
        type: ActionTypes.UPDATE_GROUPS,
        update
    }
}

export function updateRole(update) {
    return {
        type: ActionTypes.UPDATE_ROLE,
        update
    }
}

export function updateRoles(update) {
    return {
        type: ActionTypes.UPDATE_ROLES,
        update
    }
}

export function updateBrokerConfigurations(update) {
    return {
        type: ActionTypes.UPDATE_BROKER_CONFIGURATIONS,
        update
    }
}

export function updateBrokerConnected(connected) {
    return {
        type: ActionTypes.UPDATE_BROKER_CONNECTED,
        connected
    }
}

export function updateBrokerConnections(update) {
    return {
        type: ActionTypes.UPDATE_BROKER_CONNECTIONS,
        update
    }
}


export function updateLicense(update) {
    return {
        type: ActionTypes.UPDATE_LICENSE,
        update
    }
}

export function updateSystemStatus(update) {
    return {
        type: ActionTypes.UPDATE_SYSTEM_STATUS,
        update
    }
}

export function updateTopicTree(update) {
    return {
        type: ActionTypes.UPDATE_TOPIC_TREE,
        update
    }
}

export function deletedClient(update) {
    return {
        type: ActionTypes.DELETED_USER,
        update
    }
}
