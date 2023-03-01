import {
	updateAnonymousGroup,
	updateGroups,
	updateGroupsAll,
	updateRoles,
	updateRolesAll,
	updateClients,
	updateClientsAll,
	updateBrokerConfigurations,
	updateBrokerConnected,
	updateBrokerConnections,
	updateDefaultACLAccess,
	updateSettings,
	updateStreams,
	updateSystemStatus,
	updateTopicTree,
	updateEditDefaultClient,
	updateFeatures,
	updateBrokerLicenseInformation
} from '../../actions/actions';

import {
	updateInspectClients
} from '../../admin/inspect/actions/actions';


export const handleConnectionChange = async (dispatch, client, newConnectionName, currentConnectionName, setConnection, connected) => {
    dispatch(updateBrokerLicenseInformation(null));
    dispatch(updateInspectClients([]));
    dispatch(updateClients([]));
    dispatch(updateClientsAll([]));
    dispatch(updateGroups([]));
    dispatch(updateGroupsAll([]));
    dispatch(updateRoles([]));
    dispatch(updateRolesAll([]));
    dispatch(updateStreams([]));
    dispatch(updateSystemStatus({}));

    await client.disconnectFromBroker(currentConnectionName);
    dispatch(updateBrokerConnected(false, newConnectionName));
    if (newConnectionName && newConnectionName !== '') {
        try {
            await client.connectToBroker(newConnectionName);
            dispatch(updateBrokerConnected(true, newConnectionName));
        } catch (error) {
            dispatch(updateBrokerConnected(false, newConnectionName));
            return;
        }
        const settings = await client.getSettings();
        dispatch(updateSettings(settings));
        const brokerConnections = await client.getBrokerConnections();
        dispatch(updateBrokerConnections(brokerConnections));
        const brokerConfigurations = await client.getBrokerConfigurations();
        dispatch(updateBrokerConfigurations(brokerConfigurations));
    
        if (setConnection) {
            setConnection(newConnectionName);
        }
        try {
            console.log('Loading dynamic security');
            const clients = await client.listClients(true, 10, 0);
            dispatch(updateClients(clients));
            const clientsAll = await client.listClients(false);
            dispatch(updateClientsAll(clientsAll));
            const groups = await client.listGroups(true, 10, 0);
            dispatch(updateGroups(groups));
            const groupsAll = await client.listGroups(false);
            dispatch(updateGroupsAll(groupsAll));
            const anonymousGroup = await client.getAnonymousGroup();
            dispatch(updateAnonymousGroup(anonymousGroup));
            const roles = await client.listRoles(true, 10, 0);
            dispatch(updateRoles(roles));
            const rolesAll = await client.listRoles(false);
            dispatch(updateRolesAll(rolesAll));

            const defaultACLAccess = await client.getDefaultACLAccess();
            dispatch(updateDefaultACLAccess(defaultACLAccess));
            dispatch(updateFeatures({
                feature: 'dynamicsecurity',
                status: 'ok'
            }));
        } catch (error) {
            console.error('Error loading dynamic security');
            console.error(error);
            dispatch(updateFeatures({
                feature: 'dynamicsecurity',
                status: error
            }));
        }
        try {
            const licenseInformation = await client.getLicenseInformation();
            dispatch(updateBrokerLicenseInformation(licenseInformation));
        } catch (error) {
            console.error('Error loading license information');
            console.error(error);
            dispatch(updateBrokerLicenseInformation({}));
        }
        try {
            console.log('Loading inspection');
            const inspectClients = await client.inspectListClients();
            dispatch(updateInspectClients(inspectClients));
            dispatch(updateFeatures({
                feature: 'inspect',
                status: 'ok'
            }));
        } catch (error) {
            console.error('Error loading inspection');
            console.error(error);
            dispatch(updateFeatures({
                feature: 'inspect',
                status: error
            }));
        }
        try {
            console.log('Loading streams');
            const streams = await client.listStreams();
            dispatch(updateStreams(streams));
            dispatch(updateFeatures({
                feature: 'streamprocessing',
                status: 'ok'
            }));
        } catch (error) {
            console.error('Error loading streams');
            console.error(error);
            dispatch(updateFeatures({
                feature: 'streamprocessing',
                status: error
            }));
        }
        // const plugins = await client.listPlugins();
        // dispatch(updatePlugins(plugins));
    } else {
    }
};