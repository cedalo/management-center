const { v1: uuid } = require('uuid');
const axios = require('axios');

const createError = (code, message) => ({
    code,
    message,
});

const API_LICENSE = 'cedalo/license';
const API_INSPECT = 'cedalo/inspect';
const API_DYNAMIC_SECURITY = 'dynamic-security';
const API_STREAMS_PROCESSING = 'stream-processing';
const API_HIGH_AVAILABILITY = 'cedalo/ha';
const ERROR_MESSAGE_USER_MANAGEMENT_NOT_AUTHORIZED = 'You are not authorized to access the user management';
const ERROR_MESSAGE_API_NOT_FOUND = 'API not found. Note that this is a premium feature';
const NOT_AUTHORIZED_MESSAGE = 'Not authorized';
const LOGIN_ENDPOINT = '/login?error=session-expired';

class APIError extends Error {
    constructor(title, message, longError) {
        super(message);
        this.name = 'APIError';
        this.title = title;
        if (longError) {
            this.longError = longError;
        }
    }
}

class NotAuthorizedError extends APIError {
    constructor(errorMessage) {
        super('Not authorized', errorMessage || ERROR_MESSAGE_USER_MANAGEMENT_NOT_AUTHORIZED);
        this.name = 'NotAuthorizedError';
    }
}

class APINotFoundError extends APIError {
    constructor() {
        super('API not found', ERROR_MESSAGE_API_NOT_FOUND);
        this.name = 'APINotFoundError';
    }
}

axios.interceptors.response.use(
    (response) => response, // if the response is successful, just return it
    (error) => {
        const sessionExpired =
            error.response &&
            error.response.status === 401 &&
            error.response?.data?.code === 'UNAUTHORIZED' &&
            !error.response?.data?.data?.session;

        if (sessionExpired) {
            // replace this with your login route
            console.error('Session expired or invalid');
            window.location.href = (process.env.PUBLIC_URL || '') + LOGIN_ENDPOINT;
            return Promise.reject('Session expired or invalid');
        }

        return Promise.reject(error);
    }
);

// TODO: merge with method deletePendingRequest()
const deletePendingRequest = (requestId, requests) => {
    const request = requests.get(requestId);
    if (request) {
        clearTimeout(request.timeoutId);
        requests.delete(requestId);
    }
    return request;
};
const timeoutHandler = (requestId, requests) => {
    const { reject } = deletePendingRequest(requestId, requests);
    reject({
        message: 'BaseMosquittoProxyClient: Timeout',
        requestId,
    });
};

const createID = () => uuid();

// TODO: refactor error handling!
module.exports = class BaseMosquittoProxyClient {
    constructor(
        { name, logger, defaultListener } = {},
        { socketEndpointURL, httpEndpointURL } = {},
        headers = undefined,
        version = undefined
    ) {
        if (!version) {
            version = 1;
        }
        this.name = name || 'Default Base Mosquitto Proxy Client';
        this._logger = logger || {
            log() {},
            info() {},
            warn() {},
            debug() {},
            error() {},
        };
        const acceptHeader = { Accept: `application/json;version=${version}` };
        this._headers = headers ? { headers: { ...acceptHeader, ...headers } } : { headers: acceptHeader };
        this._socketEndpointURL = socketEndpointURL;
        this._httpEndpointURL = httpEndpointURL;
        this._eventHandler = (event) => this.logger.info(event);
        this._closeHandler = () => this.logger.info('Close Mosquitto Proxy Client');
        this._eventListeners = new Map();
        this._isConnected = false;
        this._requests = new Map();
        // TODO: make timeout configurable
        // request timeout in ms:
        this._timeout = 11000;
    }

    setHeaders(headers) {
        this._headers = { headers };
    }

    // eslint-disable-next-line consistent-return
    async connect({ socketEndpointURL, httpEndpointURL } = {}, sid = undefined) {
        if (this._isConnected || this._isConnecting) {
            return Promise.resolve({});
        }
        this._isConnecting = true;
        // TODO: handle default values
        this._socketEndpointURL = socketEndpointURL || this._socketEndpointURL;
        this._httpEndpointURL = httpEndpointURL || this._httpEndpointURL;
        try {
            const ws = await this._connectSocketServer(`${this._socketEndpointURL}?authToken=${this._token}`, sid);
            this._ws = ws;
            this._isConnected = true;
            this._keepAlive();
        } catch (error) {
            this._isConnected = false;
            this.logger.error(error);
            throw error;
        }
    }

    async reconnect() {
        this.logger.debug('Reconnect.');
        const socketEndpointURL = this._socketEndpointURL;
        const httpEndpointURL = this._httpEndpointURL;
        this.connect({ socketEndpointURL, httpEndpointURL });
    }

    async disconnect() {
        if (this._ws) {
            this._ws.close();
            this._cancelKeepAlive();
            this._isConnected = false;
            this._isConnecting = false;
        }
        return Promise.resolve();
    }

    async resetConnection() {
        await this.disconnect();
        return this.reconnect();
    }

    _keepAlive() {
        const interval = 8000;
        if (this._ws && this._ws.readyState === this._ws.OPEN) {
            this._ws.send(
                JSON.stringify({
                    type: 'ping',
                    interval,
                })
            );
        }
        this._timerId = setTimeout(this._keepAlive.bind(this), interval);
    }

    _cancelKeepAlive() {
        if (this._timerId) {
            clearTimeout(this._timerId);
        }
    }

    get logger() {
        return this._logger;
    }

    /**
     * ******************************************************************************************
     * Methods for plugin management
     * ******************************************************************************************
     */

    async unloadPlugin(pluginId) {
        return this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'unloadPlugin',
            pluginId,
        });
    }

    async loadPlugin(pluginId) {
        return this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'loadPlugin',
            pluginId,
        });
    }

    async setPluginStatusAtNextStartup(pluginId, nextStatus) {
        return this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'setPluginStatusAtNextStartup',
            pluginId,
            nextStatus,
        });
    }

    async getBackendParameters() {
        try {
            const url = `${this._httpEndpointURL}/api/backend-parameters`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError(NOT_AUTHORIZED_MESSAGE);
            }
        }
    }

    /**
     * ******************************************************************************************
     * Methods for user management
     * ******************************************************************************************
     */
    async validateSession() {
        try {
            const url = `${this._httpEndpointURL}/validate-session`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            return { valid: false };
        }
    }

    async getUser(username) {
        try {
            const url = `${this._httpEndpointURL}/api/user-management/users/${username}`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async getUserProfile() {
        try {
            const url = `${this._httpEndpointURL}/api/profile`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            throw new NotAuthorizedError();
        }
    }

    async listUserRoles() {
        try {
            const url = `${this._httpEndpointURL}/api/user-management/roles`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async updateUserRoles(user, roles) {
        try {
            const url = `${this._httpEndpointURL}/api/user-management/users/${user.username}`;
            const response = await axios.put(
                url,
                {
                    roles,
                },
                this._headers
            );
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else if (error?.response?.status === 400) {
                throw new APIError('400', error.response.data?.message || 'Invalid request');
            } else if (error?.response?.status === 500) {
                throw new APIError('500', error.response.data || 'Invalid request');
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async listUsers() {
        try {
            const url = `${this._httpEndpointURL}/api/user-management/users`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async createUser(username, password, roles = []) {
        try {
            const user = {
                username,
                password,
                roles,
            };
            const url = `${this._httpEndpointURL}/api/user-management/users`;
            const response = await axios.post(url, user, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else if (error?.response?.status === 400) {
                throw new APIError('Bad request', error.response.data?.message || error.message);
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async deleteUser(username) {
        try {
            const url = `${this._httpEndpointURL}/api/user-management/users/${username}`;
            const response = await axios.delete(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async updateUser(user) {
        try {
            const url = `${this._httpEndpointURL}/api/user-management/users/${user.username}`;
            const response = await axios.put(url, user, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else if (error?.response?.status === 400) {
                throw new APIError('400', error.response.data?.message || 'Invalid request');
            } else if (error?.response?.status === 500) {
                throw new APIError('500', error.response.data || 'Invalid request');
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async updateUserProfile(user) {
        try {
            const url = `${this._httpEndpointURL}/api/profile`;
            const response = await axios.put(url, user, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async getUserGroup(groupname) {
        try {
            const url = `${this._httpEndpointURL}/api/user-management/groups/${groupname}`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async listUserGroupsOfUser(username) {
        try {
            const url = `${this._httpEndpointURL}/api/user-management/groups/user/${username}`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async listUserGroups() {
        try {
            const url = `${this._httpEndpointURL}/api/user-management/groups`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async createUserGroup(name, role, description = '', users = [], connections = []) {
        try {
            const group = {
                name,
                description,
                role,
                users,
                connections,
            };
            const url = `${this._httpEndpointURL}/api/user-management/groups`;
            const response = await axios.post(url, group, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    // async checkTLSEnabled() {
    // 	try {
    // 		const url = `${this._httpEndpointURL}/api/user-management/groups/${groupname}`;
    // 		const response = await axios.get(url, this._headers);
    // 		return response.data;
    // 	} catch (error) {
    // 		if (error?.response?.status === 404) {
    // 			throw new APINotFoundError();
    // 		} else {
    // 			throw new NotAuthorizedError();
    // 		}
    // 	}
    // }

    async listUserGroupsOfUser(username) {
        try {
            const url = `${this._httpEndpointURL}/api/user-management/groups/user/${username}`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async listUserGroups() {
        try {
            const url = `${this._httpEndpointURL}/api/user-management/groups`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async createUserGroup(name, role, description = '', users = [], connections = []) {
        try {
            const group = {
                name,
                description,
                role,
                users,
                connections,
            };
            const url = `${this._httpEndpointURL}/api/user-management/groups`;
            const response = await axios.post(url, group, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async deleteUserGroup(groupname) {
        try {
            const url = `${this._httpEndpointURL}/api/user-management/groups/${groupname}`;
            const response = await axios.delete(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else if (error?.response?.status === 409) {
                throw new Error(error?.response?.data || 'Conflict');
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async updateUserGroup(group) {
        try {
            const url = `${this._httpEndpointURL}/api/user-management/groups/${group.name}`;
            const response = await axios.put(url, group, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else if (error?.response?.status === 409) {
                throw new Error(error?.response?.data || 'Conflict');
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    /**
     * ******************************************************************************************
     * Methods for TLS plugin
     * ******************************************************************************************
     */

    async checkTLSEnabled() {
        try {
            const url = `${this._httpEndpointURL}/api/tls/ping`;
            const response = await axios.get(url);
            return response.data?.pong;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError(NOT_AUTHORIZED_MESSAGE);
            }
        }
    }

    /**
     * ******************************************************************************************
     * Methods for connections
     * ******************************************************************************************
     */

    async getConnections() {
        try {
            const url = `${this._httpEndpointURL}/api/connections`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError(NOT_AUTHORIZED_MESSAGE);
            }
        }
    }

    /**
     * ******************************************************************************************
     * Methods for certificate management
     * ******************************************************************************************
     */
    async doApiRequest(request, ...args) {
        try {
            const { data, status } = await request(...args, this._headers);
            return { data, status };
        } catch (error) {
            this.logger.error(error);
            switch (error.response?.status) {
                case 400:
                    throw new APIError('400', error.response.data.message || 'Invalid request');
                case 404:
                    throw new APINotFoundError();
                case 500:
                    throw new APIError(
                        '500',
                        error.response.data.message || 'Server failed to handle request!',
                        error.response.data.longError
                    );
                default:
                    throw new NotAuthorizedError(NOT_AUTHORIZED_MESSAGE);
            }
        }
    }
    async getListeners(brokerId) {
        const url = `${this._httpEndpointURL}/api/cert-management/listeners/${brokerId}`;
        return this.doApiRequest(axios.get, url);
    }
    async getCertificates() {
        const url = `${this._httpEndpointURL}/api/cert-management/certs`;
        return this.doApiRequest(axios.get, url);
    }
    async getCertificateInfo(cert) {
        const url = `${this._httpEndpointURL}/api/cert-management/info/${cert.id}`;
        return this.doApiRequest(axios.post, url, { cert });
    }
    async addCertificate(cert) {
        const url = `${this._httpEndpointURL}/api/cert-management/certs`;
        return this.doApiRequest(axios.post, url, { cert });
    }
    async updateCertificate(cert) {
        const url = `${this._httpEndpointURL}/api/cert-management/certs/${cert.id}`;
        return this.doApiRequest(axios.put, url, { cert });
    }
    async deleteCertificate(id, force) {
        const url = `${this._httpEndpointURL}/api/cert-management/certs/${id}`;
        return this.doApiRequest(axios.delete, url, { data: { force } });
    }
    async deployCertificate(cert, connection, listeners) {
        const url = `${this._httpEndpointURL}/api/cert-management/deploy/${cert.id}`;
        return this.doApiRequest(axios.put, url, { brokerId: connection.id, listeners });
    }

    /**
     * ******************************************************************************************
     * Methods for general health checks
     * ******************************************************************************************
     */

    async checkServerStatus() {
        try {
            const url = `${this._httpEndpointURL}/api/status-check`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new APIError('Could not connect');
            }
        }
    }

    /**
     * ******************************************************************************************
     * Methods for application token management
     * ******************************************************************************************
     */

    async listApplicationTokens() {
        try {
            const url = `${this._httpEndpointURL}/api/tokens`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError(NOT_AUTHORIZED_MESSAGE);
            }
        }
    }

    async getApplicationToken(tokenHash) {
        try {
            const url = `${this._httpEndpointURL}/api/tokens/${tokenHash}`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError(NOT_AUTHORIZED_MESSAGE);
            }
        }
    }

    async createApplicationToken(name, role, validUntil) {
        try {
            const tokenPayload = {
                name,
                role,
                validUntil,
            };
            const url = `${this._httpEndpointURL}/api/tokens`;
            const response = await axios.post(url, tokenPayload, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError(NOT_AUTHORIZED_MESSAGE);
            }
        }
    }

    async deleteApplicationToken(tokenHash) {
        try {
            const url = `${this._httpEndpointURL}/api/tokens/${tokenHash}`;
            const response = await axios.delete(url, this._headers);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError(NOT_AUTHORIZED_MESSAGE);
            }
        }
    }

    /**
     * ******************************************************************************************
     * Methods for topic tree management
     * ******************************************************************************************
     */

    async clearTopicTreeCache() {
        try {
            const url = `${this._httpEndpointURL}/api/system/topictree`;
            const response = await axios.delete(url, this._options);
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    async checkTopictreeRestEnabled() {
        try {
            const url = `${this._httpEndpointURL}/api/system/topictree/ping`;
            const response = await axios.get(url, this._options);
            return response.data?.pong;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }

    /**
     * ******************************************************************************************
     * Methods for cluster management
     * ******************************************************************************************
     */

    async createCluster(clusterConfiguration, timeout = this._timeout) {
        const response = await this.sendRequest(
            {
                id: createID(),
                type: 'request',
                request: 'cluster-management/createCluster',
                clusterConfiguration,
            },
            timeout
        );
        return response.response;
    }

    async listClusters(timeout = this._timeout) {
        const response = await this.sendRequest(
            {
                id: createID(),
                type: 'request',
                request: 'cluster-management/getClusters',
            },
            timeout
        );
        return response.response;
    }

    async getCluster(clustername, numberOfNodes) {
        const timeout = numberOfNodes ? numberOfNodes * 20000 : 20000;
        const response = await this.sendRequest(
            {
                id: createID(),
                type: 'request',
                request: 'cluster-management/getCluster',
                clustername,
            },
            timeout
        );
        return response.response;
    }

    async checkClusterHealthStatus(clustername) {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'cluster-management/checkClusterHealthStatus',
            clustername,
        });
        return response.response;
    }

    async modifyCluster(cluster) {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'cluster-management/modifyCluster',
            cluster,
        });
        return response.response;
    }

    async deleteCluster(clustername) {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'cluster-management/deleteCluster',
            clustername,
        });
        return response.response;
    }

    async deleteClusterConfiguration(clustername) {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'cluster-management/deleteClusterConfiguration',
            clustername,
        });
        return response.response;
    }

    async deleteAllClusters() {
        const response = await this.sendRequest(
            {
                id: createID(),
                type: 'request',
                request: 'cluster-management/deleteAllClusters',
            },
            20000
        );
        return response.response;
    }

    async joinCluster(clustername, node) {
        const response = await this.sendRequest(
            {
                id: createID(),
                type: 'request',
                request: 'cluster-management/joinCluster',
                clustername,
                node,
            },
            20000
        );
        return response.response;
    }

    async leaveCluster(clustername, brokerId) {
        const response = await this.sendRequest(
            {
                id: createID(),
                type: 'request',
                request: 'cluster-management/leaveCluster',
                clustername,
                brokerId,
            },
            20000
        );
        return response.response;
    }

    /**
     * ******************************************************************************************
     * Methods for handling multiple broker connections
     * ******************************************************************************************
     */

    async connectServerToBroker(connectionId, oneshot = false) {
        return this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'connectServerToBroker',
            connectionId,
            oneshot,
        });
    }

    async disconnectServerFromBroker(connectionId) {
        return this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'disconnectServerFromBroker',
            connectionId,
        });
    }

    async connectToBroker(brokerName) {
        return await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'connectToBroker',
            brokerName,
        });
    }

    async disconnectFromBroker(brokerName) {
        return this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'disconnectFromBroker',
            brokerName,
        });
    }

    async getBrokerConnections() {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'getBrokerConnections',
        });
        return response.response;
    }

    async getBrokerConfigurations() {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'getBrokerConfigurations',
        });
        return response.response;
    }

    async getSettings() {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'getSettings',
        });
        return response.response;
    }

    async updateSettings(settings) {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'updateSettings',
            settings,
        });
        return response.response;
    }

    /**
     * ******************************************************************************************
     * Methods for role management
     * ******************************************************************************************
     */

    // TODO: check deprecated methods

    // // TODO: should include client as parameter
    // async setClientPolicy(policyName) {
    // 	return this.sendCommand({
    // 		command: 'setClientPolicy',
    // 		policyName
    // 	}, API_DYNAMIC_SECURITY);
    // }

    // // TODO: should include client group as parameter
    // async setGroupPolicy(policyName) {
    // 	return this.sendCommand({
    // 		command: 'setGroupPolicy',
    // 		policyName
    // 	}, API_DYNAMIC_SECURITY);
    // }

    // async setClientDefaultPolicy(policyName) {
    // 	return this.sendCommand({
    // 		command: 'setClientDefaultPolicy',
    // 		policyName
    // 	}, API_DYNAMIC_SECURITY);
    // }

    // async setGroupDefaultPolicy(policyName) {
    // 	return this.sendCommand({
    // 		command: 'setGroupDefaultPolicy',
    // 		policyName
    // 	}, API_DYNAMIC_SECURITY);
    // }

    // async addPolicyFeature(policyName, featureName) {
    // 	return this.sendCommand({
    // 		command: 'addPolicyFeature',
    // 		policyName,
    // 		featureName
    // 	}, API_DYNAMIC_SECURITY);
    // }

    // async removePolicyFeature(policyName, featureName) {
    // 	return this.sendCommand({
    // 		command: 'removePolicyFeature',
    // 		policyName,
    // 		featureName
    // 	}, API_DYNAMIC_SECURITY);
    // }

    // async addTopicAccessControlPublishWrite(policyName, topicFilter, maxQos = 2, allowRetain = true, maxPayloadSize = 1000, allow = false) {
    // 	return this.sendCommand({
    // 		command: 'addTopicAccessControl',
    // 		type: 'publish-write',
    // 		policyName,
    // 		topicFilter,
    // 		maxQos,
    // 		allowRetain,
    // 		maxPayloadSize,
    // 		allow
    // 	}, API_DYNAMIC_SECURITY);
    // }

    // async addTopicAccessControlPublishRead(policyName, topicFilter) {
    // 	return this.sendCommand({
    // 		command: 'addTopicAccessControl',
    // 		type: 'publish-read',
    // 		policyName,
    // 		topicFilter
    // 	}, API_DYNAMIC_SECURITY);
    // }

    // async addTopicAccessControlSubscribe(policyName, topicFilter, maxQos = 2, allow = true) {
    // 	return this.sendCommand({
    // 		command: 'addTopicAccessControl',
    // 		type: 'subscribe-',
    // 		policyName,
    // 		topicFilter,
    // 		maxQos,
    // 		allow
    // 	}, API_DYNAMIC_SECURITY);
    // }

    // async addTopicAccessControlSubscribeFixed(policyName, topicFilter, maxQos = 2, allow = true) {
    // 	return this.sendCommand({
    // 		command: 'addTopicAccessControl',
    // 		type: 'subscribe-fixed',
    // 		policyName,
    // 		topicFilter,
    // 		maxQos,
    // 		allow
    // 	}, API_DYNAMIC_SECURITY);
    // }

    /**
     * ******************************************************************************************
     * Methods for client and client group management
     * ******************************************************************************************
     */

    async createClient(username, password, clientid, rolename = '', textname, textdescription) {
        return this.sendCommand(
            {
                command: 'createClient',
                username,
                password,
                clientid,
                rolename,
                textname,
                textdescription,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async modifyClient({ username, password, clientid, textname, textdescription, groups, roles }) {
        return this.sendCommand(
            {
                command: 'modifyClient',
                username,
                password,
                clientid,
                textname,
                textdescription,
                groups,
                roles,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async deleteClient(username) {
        return this.sendCommand(
            {
                command: 'deleteClient',
                username,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async addClientRole(username, rolename) {
        return this.sendCommand(
            {
                command: 'addClientRole',
                username,
                rolename,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async removeClientRole(username, rolename) {
        return this.sendCommand(
            {
                command: 'removeClientRole',
                username,
                rolename,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async setClientPassword(username, password) {
        return this.sendCommand(
            {
                command: 'setClientPassword',
                username,
                password,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async createGroup(groupname, rolename = '', textname, textdescription) {
        return this.sendCommand(
            {
                command: 'createGroup',
                groupname,
                rolename,
                textname,
                textdescription,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async modifyGroup({ groupname, textname, textdescription, clients, roles }) {
        return this.sendCommand(
            {
                command: 'modifyGroup',
                groupname,
                textname,
                textdescription,
                clients,
                roles,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async getAnonymousGroup() {
        const data = await this.sendCommand(
            {
                command: 'getAnonymousGroup',
            },
            API_DYNAMIC_SECURITY
        );
        return data?.group;
    }

    async setAnonymousGroup(groupname) {
        return this.sendCommand(
            {
                command: 'setAnonymousGroup',
                groupname,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async addGroupRole(groupname, rolename, priority) {
        return this.sendCommand(
            {
                command: 'addGroupRole',
                groupname,
                rolename,
                priority,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async removeGroupRole(groupname, rolename) {
        return this.sendCommand(
            {
                command: 'removeGroupRole',
                groupname,
                rolename,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async addGroupClient(username, groupname, priority) {
        return this.sendCommand(
            {
                command: 'addGroupClient',
                username,
                groupname,
                priority,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async removeGroupClient(username, groupname) {
        return this.sendCommand(
            {
                command: 'removeGroupClient',
                username,
                groupname,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async clientHasRole(username, rolename) {
        if (username === '') {
            return false;
        }
        const client = await this.getClient(username);
        const hasRole = !!client.roles.find((role) => role.rolename === rolename);
        return hasRole;
    }

    async getClient(username) {
        const data = await this.sendCommand(
            {
                command: 'getClient',
                username,
            },
            API_DYNAMIC_SECURITY
        );
        return data?.client;
    }

    async listClients(verbose = true, count = -1, offset = 0, timeout = this._timeout) {
        const data = await this.sendCommand(
            {
                command: 'listClients',
                verbose,
                count,
                offset,
            },
            API_DYNAMIC_SECURITY,
            createID(),
            timeout
        );
        return data;
    }

    async getGroup(groupname) {
        const data = await this.sendCommand(
            {
                command: 'getGroup',
                groupname,
            },
            API_DYNAMIC_SECURITY
        );
        return data?.group;
    }

    async listGroups(verbose = true, count = -1, offset = 0, timeout = this._timeout) {
        const data = await this.sendCommand(
            {
                command: 'listGroups',
                verbose,
                count,
                offset,
            },
            API_DYNAMIC_SECURITY,
            createID(),
            timeout
        );
        return data;
    }

    async listGroupClients(group) {
        return this.sendCommand(
            {
                command: 'listGroupClients',
                group,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async disableClient(username) {
        return this.sendCommand(
            {
                command: 'disableClient',
                username,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async enableClient(username) {
        return this.sendCommand(
            {
                command: 'enableClient',
                username,
            },
            API_DYNAMIC_SECURITY
        );
    }

    /**
     * ******************************************************************************************
     * Methods for role management
     * ******************************************************************************************
     */

    async createRole(rolename, textname, textdescription) {
        return this.sendCommand(
            {
                command: 'createRole',
                rolename,
                textname,
                textdescription,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async modifyRole({ rolename, textname, textdescription }) {
        return this.sendCommand(
            {
                command: 'modifyRole',
                rolename,
                textname,
                textdescription,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async deleteRole(rolename) {
        return this.sendCommand(
            {
                command: 'deleteRole',
                rolename,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async getRole(rolename) {
        const rolesResponse = await this.listRoles();
        const fetchedRole = rolesResponse.roles.find((role) => role.rolename === rolename);
        // TODO: activate when implemented at Mosquitto
        // return this.sendCommand({
        // 	command: 'getRole',
        // 	rolename,
        // }, API_DYNAMIC_SECURITY);
        return fetchedRole;
    }

    async listRoles(verbose = true, count = -1, offset = 0, timeout = this._timeout) {
        const data = await this.sendCommand(
            {
                command: 'listRoles',
                verbose,
                count,
                offset,
            },
            API_DYNAMIC_SECURITY,
            createID(),
            timeout
        );
        return data;
    }

    async addRoleACL(rolename, { acltype, priority, topic, allow }) {
        return this.sendCommand(
            {
                command: 'addRoleACL',
                rolename,
                acltype,
                priority,
                topic,
                allow,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async removeRoleACL(rolename, { acltype, topic }) {
        return this.sendCommand(
            {
                command: 'removeRoleACL',
                rolename,
                acltype,
                topic,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async setDefaultACLAccess(acls) {
        return this.sendCommand(
            {
                command: 'setDefaultACLAccess',
                acls,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async getDefaultACLAccess() {
        return this.sendCommand(
            {
                command: 'getDefaultACLAccess',
            },
            API_DYNAMIC_SECURITY
        );
    }

    /**
     * ******************************************************************************************
     * Additional methods not specified in the Mosquitto API
     * ******************************************************************************************
     */

    async restartBroker(connectionName, serviceName) {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'restartBroker',
            connectionName,
            serviceName,
        });
        return response?.response;
    }

    async listTestCollections(timeout = this._timeout) {
        const response = await this.sendRequest(
            {
                id: createID(),
                type: 'request',
                request: 'listTestCollections',
            },
            timeout
        );
        return response?.response;
    }

    async listTests(testCollectionId) {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'listTests',
            testCollectionId,
        });
        return response?.response;
    }

    async runTest(testCollectionId, testId) {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'runTest',
            testCollectionId,
            testId,
        });
        return response?.response;
    }

    async runTestCollection(testCollectionId) {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'runTestCollection',
            testCollectionId,
        });
        return response?.response;
    }

    // async exportTestCollection(testCollectionId) {
    // 	const response = await this.sendRequest({
    // 		id: createID(),
    // 		type: 'request',
    // 		request: 'exportTestCollection',
    // 		testCollectionId
    // 	});
    // 	return response?.response;
    // }

    async exportTestCollection(testCollectionId) {
        try {
            const url = `${this._httpEndpointURL}/api/mqtt-testing/testcollections/${testCollectionId}`;
            const response = await axios.get(url, this._headers);
            return response.data;
        } catch (error) {
            throw new NotAuthorizedError()();
        }
    }

    async getTestCollection(testCollectionId) {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'getTestCollection',
            testCollectionId,
        });
        return response?.response;
    }

    async getTest(testCollectionId, testId) {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'getTest',
            testCollectionId,
            testId,
        });
        return response?.response;
    }

    async sendTestRequest(request) {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'sendTestRequest',
            data: request,
        });
        return response?.response;
    }

    async listPlugins() {
        return this.sendCommand({
            command: 'listPlugins',
        });
    }

    async testConnection(connection) {
        const response = await this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'testConnection',
            connection,
        });
        return response?.response;
    }

    async createConnection(connection) {
        return this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'createConnection',
            connection,
        });
    }

    async modifyConnection(oldConnectionId, connection) {
        return this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'modifyConnection',
            oldConnectionId,
            connection,
        });
    }

    async deleteConnection(connectionId) {
        return this.sendRequest({
            id: createID(),
            type: 'request',
            request: 'deleteConnection',
            connectionId,
        });
    }

    async updateClientGroups(client, groupnames = []) {
        if (!groupnames) {
            groupnames = [];
        }
        const clientGroupnames = client.groups.map((group) => group.groupname);
        const groupsToRemove = clientGroupnames.filter((groupname) => !groupnames.includes(groupname));
        const groupsToAdd = groupnames.filter((groupname) => !clientGroupnames.includes(groupname));
        for (const groupToRemove of groupsToRemove) {
            await this.removeGroupClient(client.username, groupToRemove);
        }
        for (const groupToAdd of groupsToAdd) {
            await this.addGroupClient(client.username, groupToAdd);
        }
    }

    async updateClientRoles(client, rolenames = []) {
        if (!rolenames) {
            rolenames = [];
        }
        if (client.roles) {
            const clientRolenames = client.roles.map((role) => role.rolename);
            const rolesToRemove = clientRolenames.filter((rolename) => !rolenames.includes(rolename));
            const rolesToAdd = rolenames.filter((rolename) => !clientRolenames.includes(rolename));
            for (const roleToRemove of rolesToRemove) {
                await this.removeClientRole(client.username, roleToRemove);
            }
            for (const roleToAdd of rolesToAdd) {
                await this.addClientRole(client.username, roleToAdd);
            }
        }
    }

    async updateGroupClients(group, usernames = []) {
        if (!usernames) {
            usernames = [];
        }
        const groupusernames = group.clients.map((client) => client.username);
        const clientsToRemove = groupusernames.filter((username) => !usernames.includes(username));
        const clientsToAdd = usernames.filter((username) => !groupusernames.includes(username));
        for (const clientToRemove of clientsToRemove) {
            await this.removeGroupClient(clientToRemove, group.groupname);
        }
        for (const clientToAdd of clientsToAdd) {
            await this.addGroupClient(clientToAdd, group.groupname);
        }
    }

    async updateGroupRoles(group, rolenames = []) {
        if (!rolenames) {
            rolenames = [];
        }
        if (group.roles) {
            const groupRolenames = group.roles.map((role) => role.rolename);
            const rolesToRemove = groupRolenames.filter((rolename) => !rolenames.includes(rolename));
            const rolesToAdd = rolenames.filter((rolename) => !groupRolenames.includes(rolename));
            for (const roleToRemove of rolesToRemove) {
                await this.removeGroupRole(group.groupname, roleToRemove);
            }
            for (const roleToAdd of rolesToAdd) {
                await this.addGroupRole(group.groupname, roleToAdd);
            }
        }
    }

    async getClientCount() {
        const clientsResponse = await this.listClients();
        return clientsResponse.totalCount;
    }

    async getGroupCount() {
        const groupsResponse = await this.listGroups();
        return groupsResponse.groups.totalCount;
    }

    async addClientToGroups(username, groups, priority) {
        if (groups) {
            for (const group of groups) {
                await this.addGroupClient(username, group, priority);
            }
        }
    }

    async deleteGroup(groupname) {
        return this.sendCommand(
            {
                command: 'deleteGroup',
                groupname,
            },
            API_DYNAMIC_SECURITY
        );
    }

    async deleteAllClients() {
        const clientsResponse = await this.listClients();
        for (const client of clientsResponse.clients) {
            await this.deleteClient(client.username);
        }
    }

    async deleteAllGroups() {
        const groupsResponse = await this.listGroups();
        for (const group of groupsResponse.groups) {
            await this.deleteGroup(group.groupname);
        }
    }

    async deleteAll() {
        await this.deleteAllClients();
        await this.deleteAllGroups();
    }

    on(event, listener) {
        let listeners = this._eventListeners.get(event);
        if (!listeners) {
            listeners = [];
            this._eventListeners.set(event, listeners);
        }
        listeners.push(listener);
    }

    /**
     * ******************************************************************************************
     * Methods for license management
     * ******************************************************************************************
     */
    async getLicenseInformation(timeout = this._timeout) {
        const data = await this.sendCommand(
            {
                command: 'getLicenseInformation',
            },
            API_LICENSE,
            createID(),
            timeout
        );
        return data;
    }

    /**
     * ******************************************************************************************
     * Methods for stream processing
     * ******************************************************************************************
     */

    async listStreams(verbose = true, timeout = this._timeout) {
        const data = await this.sendCommand(
            {
                command: 'listStreams',
                verbose,
            },
            API_STREAMS_PROCESSING,
            createID(),
            timeout
        );
        return data?.streams;
    }

    async getStream(streamname) {
        const data = await this.sendCommand(
            {
                command: 'getStream',
                streamname,
            },
            API_STREAMS_PROCESSING
        );
        return data?.stream;
    }

    async deleteStream(streamname) {
        return this.sendCommand(
            {
                command: 'deleteStream',
                streamname,
            },
            API_STREAMS_PROCESSING
        );
    }

    async enableStream(streamname) {
        return this.sendCommand(
            {
                command: 'enableStream',
                streamname,
            },
            API_STREAMS_PROCESSING
        );
    }

    async disableStream(streamname) {
        return this.sendCommand(
            {
                command: 'disableStream',
                streamname,
            },
            API_STREAMS_PROCESSING
        );
    }

    async clearStreamMessages(streamname) {
        return this.sendCommand(
            {
                command: 'clearStreamMessages',
                streamname,
            },
            API_STREAMS_PROCESSING
        );
    }

    async getStreamMessageCount(streamname) {
        return this.sendCommand(
            {
                command: 'getStreamMessageCount',
                streamname,
            },
            API_STREAMS_PROCESSING
        );
    }

    async processStream(streamname, process) {
        return this.sendCommand(
            {
                command: 'modifyStream',
                streamname,
                process,
            },
            API_STREAMS_PROCESSING
        );
    }

    async persistStream(streamname, persist) {
        return this.sendCommand(
            {
                command: 'modifyStream',
                streamname,
                persist,
            },
            API_STREAMS_PROCESSING
        );
    }

    async modifyStream({
        streamname,
        sourcetopic,
        targettopic,
        targetqos,
        ttl,
        key,
        query,
        active,
        persist,
        process,
        textname,
        textdescription,
    }) {
        return this.sendCommand(
            {
                command: 'modifyStream',
                replace: true,
                streamname,
                sourcetopic,
                targettopic,
                targetqos,
                ttl,
                key,
                query,
                active,
                persist,
                process,
                textname,
                textdescription,
            },
            API_STREAMS_PROCESSING
        );
        // TODO: use native command when implemented
        // return this.sendCommand(
        // 	{
        // 		command: 'modifyStream',
        // 		streamname,
        // 		sourceTopic,
        // 		targetTopic,
        // 		targetQoS,
        // 		ttl,
        // 		query,
        // 		active,
        // 		persist,
        // 		process
        // 	},
        // 	API_STREAMS_PROCESSING
        // );
    }

    async replayStream({ streamname, replayTopic, gte, lte, reverse, limit, speed }) {
        return this.sendCommand(
            {
                command: 'replayStream',
                streamname,
                replayTopic,
                gte,
                lte,
                reverse,
                limit,
                speed,
            },
            API_STREAMS_PROCESSING
        );
    }

    async createStream({
        streamname,
        sourceTopic,
        targetTopic,
        targetQoS,
        ttl,
        key,
        query,
        textname,
        textdescription,
    }) {
        return this.sendCommand(
            {
                command: 'createStream',
                streamname,
                sourceTopic,
                targetTopic,
                targetqos: typeof targetQoS === 'string' ? parseInt(targetQoS) : targetQoS,
                ttl: typeof ttl === 'string' ? parseInt(ttl) : ttl,
                key,
                query,
                textname,
                textdescription,
            },
            API_STREAMS_PROCESSING
        );
    }

    off(event, listener) {
        const listeners = this._eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    set eventHandler(eventHandler) {
        this._eventHandler = eventHandler;
    }

    get eventHandler() {
        return this._eventHandler;
    }

    set closeHandler(closeHandler) {
        this._closeHandler = closeHandler;
    }

    get closeHandler() {
        return this._closeHandler;
    }

    async sendCommand(command, api, id = createID(), timeout = this._timeout) {
        const response = await this.sendRequest(
            {
                id,
                api,
                type: 'command',
                command,
            },
            timeout
        );
        return response.data;
    }

    async sendRequest(request, timeout = this._timeout) {
        /* eslint-disable */
        this.logger.debug('Sending request to Mosquitto proxy', request);
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => timeoutHandler(request.id, this._requests), timeout);
            this._requests.set(request.id, {
                resolve,
                reject,
                timeoutId,
                request,
            });
            return new Promise((resolve /* , reject */) => {
                this._ws.send(JSON.stringify(request));
                resolve();
            }).catch((error) => {
                this.logger.error('Sending request to Mosquitto proxy', request);
                this.logger.error(
                    `Error while communicating with Mosquitto proxy while executing request '${request}'`,
                    error
                );
                throw error;
            });
        });
        /* eslint-enable */
    }

    // abstract method to be overwritten in subclass
    _connectSocketServer() {
        return Promise.reject(new Error('No implementation of abstract method _connectSocketServer() in subclass.'));
    }

    _handleSocketMessage(message) {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'response') {
            const request = deletePendingRequest(parsedMessage.requestId, this._requests);
            if (request) {
                if (parsedMessage.type === 'response') {
                    this.logger.debug('Got response from Mosquitto proxy', parsedMessage);
                    if (parsedMessage.error) {
                        request.reject(parsedMessage.error);
                    } else {
                        request.resolve(parsedMessage);
                    }
                } else {
                    request.reject(parsedMessage);
                }
            }
        } else if (parsedMessage.type === 'event') {
            this._handleEvent(parsedMessage.event);
        }
    }

    _handleEvent(event) {
        const listeners = this._eventListeners.get(event.type);
        if (listeners) {
            listeners.forEach((listener) => listener(event));
        }
    }

    _handleOpenedSocketConnection() {
        this.logger.info(`Client '${this.name}' connected`);
        return Promise.resolve(this);
    }

    _handleSocketClose(event) {
        this._isConnected = false;
        this._isConnecting = false;
        this.logger.info('Websocket closed');
        this.closeHandler(event);
        this._handleEvent({
            type: 'disconnected',
        });
        // this.reconnect();
    }

    _handleSocketError(event) {
        this.logger.info('Websocket error', event);
    }

    /**
     * ******************************************************************************************
     * Methods for inspect
     * ******************************************************************************************
     */

    async inspectGetClient(clientid) {
        const data = await this.sendCommand(
            {
                command: 'getClient',
                clientid,
            },
            API_INSPECT
        );
        return data;
    }

    async inspectListClients(verbose = true, timeout = this._timeout) {
        const data = await this.sendCommand(
            {
                command: 'listClients',
                verbose,
                count: -1,
                offset: 0,
            },
            API_INSPECT,
            createID(),
            timeout
        );
        return data?.clients;
    }

    /**
     * ******************************************************************************************
     * Methods for client control
     * ******************************************************************************************
     */

    async disconnectClient(clientId) {
        const response = await this.sendRequest({
            id: createID(),
            command: 'disconnectClient',
            type: 'request',
            request: 'disconnectClient',
            clientId,
        });
        return response.response;
    }

    async checkClientControlEnabled() {
        try {
            const url = `${this._httpEndpointURL}/api/client-control/ping`;
            const response = await axios.get(url, this._headers);
            return response.data?.pong;
        } catch (error) {
            if (error?.response?.status === 404) {
                throw new APINotFoundError();
            } else {
                throw new NotAuthorizedError();
            }
        }
    }
};
