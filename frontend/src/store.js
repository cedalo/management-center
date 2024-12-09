/* eslint-disable */
import { createStore, combineReducers } from 'redux';
import brokerConfigurationsReducer from './reducers/brokerConfigurationsReducer';
import brokerConnectionsReducer from './reducers/brokerConnectionsReducer';
import proxyConnectionReducer from './reducers/proxyConnectionReducer';
import groupsReducer from './reducers/groupsReducer';
import licenseReducer from './reducers/licenseReducer';
import versionsReducer from './reducers/versionsReducer';
import rolesReducer from './reducers/rolesReducer';
import streamsReducer from './reducers/streamsReducer';
import systemStatusReducer from './reducers/systemStatusReducer';
import topicTreeReducer from './reducers/topicTreeReducer';
import clientsReducer from './reducers/clientsReducer';
import userProfileReducer from './reducers/userProfileReducer';
import settingsReducer from './reducers/settingsReducer';
import brokerLicenseReducer from './reducers/brokerLicenseReducer';
import testsReducer from './reducers/testsReducer';
import applicationTokensReducer from './reducers/applicationTokensReducer';
import backendParametersReducer from './reducers/backendParametersReducer';
import loadingReducer from './reducers/loadingReducer';

import userGroupsReducer from './admin/users/reducers/userGroupsReducer';
import userRolesReducer from './admin/users/reducers/userRolesReducer';
import usersReducer from './admin/users/reducers/usersReducer';
import clustersReducer from './admin/clusters/reducers/clustersReducer';
import inspectClientsReducer from './admin/inspect/reducers/inspectClientsReducer';
// import bridgesReducer from './admin/cloud/reducers/bridgesReducer';

const store = createStore(
    combineReducers({
        brokerConfigurations: brokerConfigurationsReducer,
        brokerConnections: brokerConnectionsReducer,
        proxyConnection: proxyConnectionReducer,
        groups: groupsReducer,
        userGroups: userGroupsReducer,
        license: licenseReducer,
        version: versionsReducer,
        roles: rolesReducer,
        settings: settingsReducer,
        streams: streamsReducer,
        systemStatus: systemStatusReducer,
        topicTree: topicTreeReducer,
        clients: clientsReducer,
        userRoles: userRolesReducer,
        userProfile: userProfileReducer,
        users: usersReducer,
        clusters: clustersReducer,
        inspectClients: inspectClientsReducer,
        brokerLicense: brokerLicenseReducer,
        tests: testsReducer,
        tokens: applicationTokensReducer,
        loading: loadingReducer,
        backendParameters: backendParametersReducer,
        // bridges: bridgesReducer
    })
);

export default store;
