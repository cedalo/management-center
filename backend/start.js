const fs = require('fs');
const path = require('path');

if (!process.env.CEDALO_MC_BUILD_NUMBER && !process.env.TRAVIS_BUILD_NUMBER) {
    const buildNumberPath = path.resolve(__dirname, 'build-number.txt');
    if (fs.existsSync(buildNumberPath)) {
        const buildNumber = fs.readFileSync(buildNumberPath).toString().trim();
        process.env.CEDALO_MC_BUILD_NUMBER = buildNumber;
    }
}

const os = require('os');
const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const session = require('express-session');
const ejs = require('ejs'); //! don't remove this line, it's used for pkg to compile ejs into the executable
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');
const swaggerUi = require('swagger-ui-express');
const { Mutex } = require('async-mutex');
const mutex = new Mutex();

const QueuedEmitter2 = require('./src/utils/QueuedEmitter2');
const HTTPClient = require('./src/http/HTTPClient');
const BrokerManager = require('./src/broker/BrokerManager');
const NodeMosquittoClient = require('./src/client/NodeMosquittoClient');
const PluginManager = require('./src/plugins/PluginManager');
const UsageTracker = require('./src/usage/UsageTracker');
const InstallationManager = require('./src/usage/InstallationManager');
const ConfigManager = require('./src/config/ConfigManager');
const SettingsManager = require('./src/settings/SettingsManager');
const utilityFunctions = require('./src/utils/utils');
const { loadInstallation, generateSecret, embedIntoObject, safeJoin, isDirectoryAsync, existsAsync } = utilityFunctions;
const NotAuthorizedError = require('./src/errors/NotAuthorizedError');
const swaggerDocument = require('./swagger.js');
const Logger = require('./src/utils/Logger');
const contentTypeParser = require('./src/middleware/ContentTypeParser');
const License = require('./src/license/License');
const {
    unloadPluginAction,
    loadPluginAction,
    setPluginStatusAtNextStartupAction,
    testConnectionAction,
    createConnectionAction,
    modifyConnectionAction,
    getBrokerConnectionsAction,
    commandAction,
    connectToBrokerAction,
    disconnectFromBrokerAction,
    deleteConnectionAction,
    getConfigurationAction,
    getSettingsAction,
    updateSettingsAction,
    startupAction,
    shutdownAction,
    getPluginsAction,
} = require('./src/actions/actions');

console = new Logger(console, false);

const version = require('./src/utils/version');

const CEDALO_MC_PROXY_BASE_PATH = process.env.CEDALO_MC_PROXY_BASE_PATH || '';
const LOGIN_ENDPOINT = `${CEDALO_MC_PROXY_BASE_PATH || ''}/login`;
const CEDALO_MC_DEVELOPMENT_MODE = utilityFunctions.preprocessBoolEnvVariable(process.env.CEDALO_MC_DEVELOPMENT_MODE);
const CEDALO_MC_OFFLINE = process.env.CEDALO_MC_MODE === 'offline';
const CEDALO_MC_ENABLE_FULL_LOG = utilityFunctions.preprocessBoolEnvVariable(process.env.CEDALO_MC_ENABLE_FULL_LOG);
const CEDALO_MC_SHOW_FEEDBACK_FORM = utilityFunctions.preprocessBoolEnvVariable(
    process.env.CEDALO_MC_SHOW_FEEDBACK_FORM
);
const CEDALO_MC_SHOW_STREAMSHEETS = utilityFunctions.preprocessBoolEnvVariable(
    process.env.CEDALO_MC_SHOW_STREAMSHEETS || false
);
const CEDALO_MC_TREAT_USERNAMES_AS_CLIENT_IDS = utilityFunctions.preprocessBoolEnvVariable(
    process.env.CEDALO_MC_TREAT_USERNAMES_AS_CLIENT_IDS
);
const CEDALO_MC_USERNAME = process.env.CEDALO_MC_USERNAME;
const CEDALO_MC_SESSION_IDLE_TIMEOUT =
    process.env.CEDALO_MC_SESSION_IDLE_TIMEOUT &&
    parseInt(process.env.CEDALO_MC_SESSION_IDLE_TIMEOUT) !== -1 &&
    parseInt(process.env.CEDALO_MC_SESSION_IDLE_TIMEOUT);
const CEDALO_MC_SESSION_MAXAGE =
    process.env.CEDALO_MC_SESSION_MAXAGE &&
    parseInt(process.env.CEDALO_MC_SESSION_MAXAGE) !== -1 &&
    parseInt(process.env.CEDALO_MC_SESSION_MAXAGE);

const USAGE_TRACKER_INTERVAL = 1000 * 60 * 60;
const CEDALO_MC_LICENSE_CRON_TAB_STRING = process.env.CEDALO_MC_LICENSE_CRON_TAB_STRING || '*/10 * * * * *';

const MAX_TIMEOUT = 2147483647; // Maximum value for setTimeout (2^31-1 milliseconds)

function createLongTimeout(callback, delay) {
    if (delay > MAX_TIMEOUT) {
        return setTimeout(() => {
            createLongTimeout(callback, delay - MAX_TIMEOUT);
        }, MAX_TIMEOUT);
    } else {
        return setTimeout(callback, delay);
    }
}

console.log(`Mosquitto Management Center version ${version.version || 'unknown'}`);
console.log(`MMC is starting in ${process.env.CEDALO_MC_MODE === 'offline' ? 'offline' : 'online'} mode`);

// const LicenseManager = require("../src/LicenseManager");
const licenseMode = process.env['CEDALO_MC_LICENSE_MODE'];

// init env variables
let LicenseChecker;

switch (licenseMode) {
    case 'google':
        LicenseChecker = require('../../integrations/google/index.js');
        break;
    case 'ctrlx':
        LicenseChecker = require('../../integrations/ctrlx/src/HTTPLicenseChecker.js');
        break;
    default:
        LicenseChecker = require('./src/license/LicenseChecker');
}

const acl = require('./src/security/acl');
const TopicTreeManager = require('./src/topictree/TopicTreeManager');
const licenseContainer = require('./src/license/LicenseContainer');
const { AuthError } = require('./src/plugins/Errors');
// const NodeMosquittoProxyClient = require('../frontend/src/client/NodeMosquittoProxyClient');
// const licenseManager = new LicenseManager();
// await licenseManager.loadLicense();
// const license = licenseManager.getLicenseAsJSON();

let context = {
    licenseClass: License, // needed for custom license checkers which are responsible for loading the license, making initial validity check and can schedule subsequent checks
    // some license checkers need to generate this license, therefore they need this class (which is btw used by the default licenseChecker and its implementation lies next to the default
    // license checker in src/license folder)
    eventEmitter: new EventEmitter(),
    actionEmitter: new QueuedEmitter2({ wildcard: true, delimiter: '/' }),
    brokerManager: new BrokerManager(),
    requestHandlers: new Map(),
    httpClient: HTTPClient.getInstance(),
    licenseContainer,
    security: {
        acl: {
            ...acl,
        },
    },
    registerAction: ({ type, metainfo, isModifying, fn, filter = (x) => x }) => {
        context.actions[type] = { fn, filter, metainfo, isModifying };
    },
    runAction: (user, type, data, extendedContext = {}) => {
        const action = context.actions[type];
        if (action) {
            const { isModifying, metainfo } = action;

            let errorMessage;
            let pendingResult;
            let result;
            try {
                pendingResult = action.fn({ ...context, user, ...extendedContext }, data);
                return pendingResult;
            } catch (error) {
                errorMessage = error.message || 'Unknown error!';
                throw error;
            } finally {
                Promise.resolve(pendingResult)
                    .catch((error) => {
                        errorMessage = error.message || 'Unknown error!';
                    })
                    .then((r) => {
                        result = r;
                    })
                    .finally(() => {
                        const eventData = {
                            type,
                            metainfo,
                            isModifying,
                            user,
                            data: action.filter(data),
                            error: errorMessage,
                            // TODO: should this be here? should we filter it? Currently only required for user/login
                            result,
                        };
                        const eventName = `${errorMessage ? 'e' : isModifying ? 'w' : 'r'}/${type}`;
                        context.actionEmitter.emit(eventName, eventData, extendedContext);
                    });
            }
        } else {
            console.error(`Unknown action: "${type}"`);
            // throw new Error(`Unknown action: "${type}"`); // TODO: throw this error because it makes more sense. Not doing it know because we have released this version
        }
    },
    actions: {},
    callbacks: {},
};

const clearTopicTree = () => {
    if (context.actions['topictree-rest-api/deleteTopictree']) {
        context.runAction({ username: 'system' }, 'topictree-rest-api/deleteTopictree');
    }
};
const resourcesWatcher = () => {
    const BYTES_IN_GB = 1024 * 1024 * 1024;
    if (process.memoryUsage().rss > 1 * BYTES_IN_GB) {
        clearTopicTree();
    }
};
if (!process.env.CEDALO_MC_DISABLE_TOPIC_TREE_LIMIT) {
    const _intervalHanlder = setInterval(resourcesWatcher, 30_000);
}

const checker = new LicenseChecker(context);

context.registerAction(unloadPluginAction);
context.registerAction(loadPluginAction);
context.registerAction(setPluginStatusAtNextStartupAction);
context.registerAction(testConnectionAction);
context.registerAction(createConnectionAction);
context.registerAction(modifyConnectionAction);
context.registerAction(getBrokerConnectionsAction);
context.registerAction(commandAction);
context.registerAction(connectToBrokerAction);
context.registerAction(disconnectFromBrokerAction);
context.registerAction(deleteConnectionAction);
context.registerAction(getConfigurationAction);
context.registerAction(getSettingsAction);
context.registerAction(updateSettingsAction);
context.registerAction(startupAction);
context.registerAction(shutdownAction);
context.registerAction(getPluginsAction);

const noCache = (req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};

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
        message: 'Mosquitto Proxy: Timeout',
        requestId,
    });
};

const updateSystemTopics = (system, topic, message) => {
    const parts = topic.split('/');
    let current = system;
    parts.forEach((part, index) => {
        if (!current[part]) {
            current[part] = {};
        }
        if (index + 1 === parts.length) {
            current[part] = message.toString();
        }
        current = current[part];
    });
    return system;
};

const initConnections = (config) => {
    const connections = config.connections || [];
    if (process.env.CEDALO_MC_BROKER_NAME && process.env.CEDALO_MC_BROKER_URL) {
        let connection = connections.find((connection) => {
            return (
                connection.name === process.env.CEDALO_MC_BROKER_NAME &&
                connection.id === process.env.CEDALO_MC_BROKER_ID
            );
        });
        let duplicateConnection = connections.find((connection) => {
            return (
                connection.name === process.env.CEDALO_MC_BROKER_NAME ||
                connection.id === process.env.CEDALO_MC_BROKER_ID
            );
        });
        const connectionExists = !!connection;
        const duplicateConnectionExiists = !!duplicateConnection;

        if (!connectionExists && duplicateConnectionExiists) {
            console.error(
                'The connection specified with CEDALO_MC_BROKER_NAME and CEDALO_MC_BROKER_ID is inconsistent with one of the existing connection (name or id is duplicated). Connection will not be created. To amend this, please adjust your connection information (you have to specify both CEDALO_MC_BROKER_NAME and CEDALO_MC_BROKER_ID) and try again'
            );
            return connections;
        }

        if (!connectionExists) {
            // connection did not exist previously in configuration file
            connection = {
                name: process.env.CEDALO_MC_BROKER_NAME,
                url: process.env.CEDALO_MC_BROKER_URL,
                supportsRestart: process.env.CEDALO_MC_BROKER_SUPPORTS_RESTART === 'true' ? true : false,
                serviceName: process.env.CEDALO_MC_BROKER_SERVICE_NAME,
            };
            connection.id = process.env.CEDALO_MC_BROKER_ID || uuidv4();
            if (process.env.CEDALO_MC_BROKER_USERNAME && process.env.CEDALO_MC_BROKER_PASSWORD) {
                connection.credentials = {
                    username: process.env.CEDALO_MC_BROKER_USERNAME,
                    password: process.env.CEDALO_MC_BROKER_PASSWORD,
                    clientId: process.env.CEDALO_MC_BROKER_CLIENT_ID,
                };
            }
            connection.status = {
                connected: true,
                timestamp: Date.now(),
            };
            connections.push(connection);
        } else {
            // connection did exist previously in configuration file
            // configuration file needs to be updated from environment variables
            connection.url = process.env.CEDALO_MC_BROKER_URL;
            connection.supportsRestart = process.env.CEDALO_MC_BROKER_SUPPORTS_RESTART === 'true' ? true : false;
            connection.serviceName = process.env.CEDALO_MC_BROKER_SERVICE_NAME;
            if (process.env.CEDALO_MC_BROKER_USERNAME && process.env.CEDALO_MC_BROKER_PASSWORD) {
                connection.credentials = {
                    username: process.env.CEDALO_MC_BROKER_USERNAME,
                    password: process.env.CEDALO_MC_BROKER_PASSWORD,
                    clientId: process.env.CEDALO_MC_BROKER_CLIENT_ID,
                };
            }
        }
    }
    return connections;
};

const addStreamsheetsConfig = (config) => {
    if (!config.tools) {
        config.tools = {};
    }
    if (!config.tools.streamsheets) {
        config.tools.streamsheets = {};
    }
    if (!config.tools.streamsheets.instances) {
        config.tools.streamsheets.instances = [];
    }
    // id and url are required parameters
    if (process.env.CEDALO_STREAMSHEETS_ID && process.env.CEDALO_STREAMSHEETS_URL) {
        const exists = config.tools.streamsheets.instances.find(
            (instance) => instance.id === process.env.CEDALO_STREAMSHEETS_ID
        );
        if (!exists) {
            config.tools.streamsheets.instances.push({
                id: process.env.CEDALO_STREAMSHEETS_ID,
                name: process.env.CEDALO_STREAMSHEETS_NAME,
                description: process.env.CEDALO_STREAMSHEETS_DESCRIPTION,
                url: process.env.CEDALO_STREAMSHEETS_URL,
            });
        }
    }
};

const stopFunctions = [];

const eventify = function (array, callback) {
    array.push = function (element) {
        Array.prototype.push.call(array, element);
        callback(array, element);
    };
};

const controlElements = {
    serverStarted: false,
    stopSignalSent: false,
    stop: null,
    logger: console,
};
const stop = async () => {
    await context.runAction(null, 'shutdown', null, { stopFunctions, controlElements });
};
controlElements.stop = stop;

eventify(stopFunctions, async function (array, element) {
    // add callback to stopFunctions array, will be called on every push
    if (controlElements.stopSignalSent) {
        // user can send a stop signal while some async operations are still being handled and
        await element(); // and some stop fuinctions have not been added to the array.for example stop signal is sent while connecting a broker.
    } // in this case as soon as the broker connected, it's stop functions which disconnects it is added to the stopFunctions array
}); // and due to the callback it checks if stop signal has already been issued and gets executed immediately.

const sessionTimers = {};
const sessionWsReferences = {};

const resetIdleExpirationTimer = (sessionID, sessionStore) => {
    const ws = sessionWsReferences[sessionID];

    if (!ws) {
        return;
    }

    clearTimeout(sessionTimers[sessionID]);
    sessionTimers[sessionID] = createLongTimeout(() => {
        sessionStore.destroy(sessionID, (err) => {
            if (err) {
                console.error(`Failed to destroy session ${sessionID}:`, err);
            } else {
                ws.send(
                    JSON.stringify({
                        type: 'event',
                        event: {
                            type: 'sessions-destroyed',
                            payload: [sessionID],
                        },
                    })
                );
                ws.close();
            }
        });
    }, CEDALO_MC_SESSION_IDLE_TIMEOUT);
};

const init = async (licenseContainer) => {
    const installation = loadInstallation();
    const usageTracker = new UsageTracker({ license: licenseContainer, version, installation });
    const installationManager = new InstallationManager({ license: licenseContainer, version, installation });
    await installationManager.verifyLicense();
    const settingsManager = new SettingsManager(context);
    const pluginList = PluginManager.loadPluginList();
    const maxBrokerConnections = licenseContainer?.license?.maxBrokerConnections
        ? parseInt(licenseContainer.license.maxBrokerConnections)
        : 1;
    const configManager = new ConfigManager(maxBrokerConnections, pluginList);

    const loadConfig = () => {
        // const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, CEDALO_MC_PROXY_CONFIG)).toString());
        const config = configManager.config;
        return config;
    };

    const globalSystem = {};
    const globalTopicTree = {};
    const app = express();
    app.set('view engine', 'ejs');
    if (!CEDALO_MC_DEVELOPMENT_MODE) {
        app.set('env', 'production');
    }
    app.set('views', path.join(__dirname, 'views'));

    const sessionParser = session({
        resave: false,
        saveUninitialized: true,
        secret: process.env.CEDALO_MC_SESSION_SECRET || generateSecret(),
        cookie: process.env.CEDALO_MC_SESSION_MAXAGE ? { maxAge: CEDALO_MC_SESSION_MAXAGE } : undefined,
    });
    app.use(sessionParser);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(contentTypeParser);
    app.use(noCache);

    if (CEDALO_MC_SESSION_IDLE_TIMEOUT) {
        // Middleware to track and invalidate idle sessions
        app.use((request, response, next) => {
            if (!request.session) {
                return next();
            }

            if (request.session.lastActivity) {
                const now = Date.now();
                const idleTime = now - request.session.lastActivity;

                if (idleTime < CEDALO_MC_SESSION_IDLE_TIMEOUT) {
                    resetIdleExpirationTimer(request.sessionID, request.sessionStore);
                }
            }
            request.session.lastActivity = Date.now();

            next();
        });
    }

    // TODO: add error handling
    const config = loadConfig();
    addStreamsheetsConfig(config);
    config.parameters = {
        showFeedbackForm: CEDALO_MC_SHOW_FEEDBACK_FORM,
        showStreemsheets: CEDALO_MC_SHOW_STREAMSHEETS,
        rootUsername: CEDALO_MC_USERNAME,
        multipleConnectionsAllowed: false,
        ssoUsed: false,
        urlMappings: {
            CEDALO_MC_BROKER_CONNECTION_HOST_MAPPING: process.env.CEDALO_MC_BROKER_CONNECTION_HOST_MAPPING,
            CEDALO_MC_BROKER_CONNECTION_MQTT_EXISTS_MAPPING:
                process.env.CEDALO_MC_BROKER_CONNECTION_MQTT_EXISTS_MAPPING,
            CEDALO_MC_BROKER_CONNECTION_MQTTS_EXISTS_MAPPING:
                process.env.CEDALO_MC_BROKER_CONNECTION_MQTTS_EXISTS_MAPPING,
            CEDALO_MC_BROKER_CONNECTION_WS_EXISTS_MAPPING: process.env.CEDALO_MC_BROKER_CONNECTION_WS_EXISTS_MAPPING,
        },
        treatUsernamesAsClientIds: CEDALO_MC_TREAT_USERNAMES_AS_CLIENT_IDS,
        isPremium: !!licenseContainer.isValid,
        systemStatus: {}, // TODO: ideally it should be moved out of here since it's not a config parameter but a buffer with sys topic data
    };

    const wss = new WebSocket.Server({
        //   port: CEDALO_MC_PROXY_PORT,
        // server,
        noServer: true,
        verifyClient: (info, done) => {
            sessionParser(info.req, {}, () => {
                const user = info.req.session?.passport?.user;
                if (user) {
                    done(true);
                } else {
                    done(false);
                }
            });
        },
    });

    const connections = initConnections(config);

    config.connections = connections;

    const handleConnectServerToBroker = async (connection, user, oneshot = false) => {
        if (!oneshot) {
            oneshot = !!connection.status?.userControl;
        }
        const multipleConnectionsAllowed = context.config.parameters.multipleConnectionsAllowed;
        let release;
        if (!multipleConnectionsAllowed) {
            release = await mutex.acquire();
        }
        try {
            if (!multipleConnectionsAllowed) {
                try {
                    await handleDisconnectServerFromBroker(context.brokerManager.getBrokerConnection(), true); // in case multipleConnectionsAllowed is false, there will only be a single element in brokerManager's connection, so no need to pass name as parameter into getBrokerConnection
                } catch (error) {
                    console.error('Error while disconnecting brokers (multiple connections not allowed):', error);
                    throw error;
                }
            }

            const brokerClient = new NodeMosquittoClient({
                brokerName: connection.name,
                brokerId: connection.id,
                /* logger: console */
            });
            const topicTreeManager = new TopicTreeManager(brokerClient, connection, settingsManager, context);
            topicTreeManager.addListener((topicTree, brokerClient, connection) => {
                sendTopicTreeUpdate(topicTree, brokerClient);
            });

            const system = {
                _name: connection.name,
            };
            globalSystem[connection.name] = system;
            globalTopicTree[connection.name] = topicTreeManager.topicTree;
            console.log(`Connecting to "${connection.name}" on ${connection.url}`);
            const connectionConfiguration = config.connections?.find(
                (connectionToSearch) => connection.id === connectionToSearch.id
            );
            if (connectionConfiguration) {
                // TODO: handle disconnection
                connectionConfiguration.status = {
                    connected: false,
                    timestamp: Date.now(),
                };
                await configManager.saveConnection(connectionConfiguration, connection.id);
            }
            try {
                brokerClient.createConnectionHandler(connection.url, NodeMosquittoClient.createOptions(connection));

                brokerClient.on('message', (topic, message, packet) => {
                    if (topic.startsWith('$SYS')) {
                        updateSystemTopics(system, topic, message, packet);
                        config.parameters.systemStatus[system?._name] = system;
                        sendSystemStatusUpdate(system, brokerClient);
                    } else if (
                        // TODO: change topic
                        topic.startsWith('$CONTROL/dynamic-security/v1/response')
                    ) {
                        // TODO: this is already handle by the Mosquitto client
                        if (CEDALO_MC_ENABLE_FULL_LOG) {
                            console.log('topic');
                            console.log(topic);
                            console.log(message.toString());
                        }
                    } else if (topic.startsWith('$CONTROL')) {
                        // Nothing to do
                    }
                });

                brokerClient.on('error', (error) => {
                    // TODO: add proper error handling (errors should be sent to client)
                });
                brokerClient.on('information', (information) => {
                    // TODO: add proper (handling maybe reemit with context.eventEmitter)
                });

                brokerClient.on('connect', async () => {
                    if (brokerClient.connectCount === 1) {
                        context.eventEmitter.emit('connect', connectionConfiguration);

                        topicTreeManager.start();

                        connectionConfiguration.status.connected = true;
                        connectionConfiguration.status.timestamp = Date.now();
                        console.log(`Connected to '${connection.name}' at ${connection.url}`);

                        connectionConfiguration.status = {
                            connected: true,
                            timestamp: Date.now(),
                        };
                        await configManager.saveConnection(connectionConfiguration, connection.id);
                        sendConnectionsUpdate(brokerClient);

                        brokerClient.on('close', async () => {
                            context.eventEmitter.emit('close', connectionConfiguration);
                            connectionConfiguration.status = {
                                connected: false,
                                timestamp: Date.now(),
                                error: {
                                    errno: 1,
                                    code: 'ECONNCLOSED',
                                    syscall: 'on',
                                    interrupted: !brokerClient.disconnectedByUser, // interuppted means it was not a normal disconnect, not disconnected by user
                                },
                            };
                            // if (brokerClient.disconnectedByUser) {
                            // 	brokerClient.disconnectedByUser = false;
                            // }
                            sendConnectionsUpdate(brokerClient);
                            await configManager.saveConnection(connectionConfiguration, connection.id);

                            if (brokerClient.completeDisconnect.value) {
                                // context.handleDisconnectServerFromBroker(connection); // this will remove brokerClient from brokerManager
                                context.brokerManager.handleDeleteBrokerConnection(connection); // this will remove brokerClient from brokerManager
                                globalTopicTree[connection.name] = undefined;
                                globalSystem[connection.name] = undefined;
                            }
                        });
                    } else {
                        context.eventEmitter.emit('reconnect', connectionConfiguration); // reconnect exclusively in case of failure. In cases we disconnect user manually brokerClient and all it's listeners are actually deleted
                        connectionConfiguration.status = {
                            connected: true,
                            timestamp: Date.now(),
                            reconnect: true,
                        };
                        sendConnectionsUpdate(brokerClient);
                        configManager.saveConnection(connectionConfiguration, connection.id);
                    }
                });

                context.brokerManager.handleNewBrokerConnection(
                    connection,
                    brokerClient,
                    system,
                    topicTreeManager /*, proxyClient */
                );

                await brokerClient.connect({ oneshot });
            } catch (error) {
                // disconnect broker client
                console.error(
                    `Error when connecting "${connectionConfiguration.name}"("${connectionConfiguration.id}"):`
                );
                console.error(error);
                connectionConfiguration.status = {
                    connected: false,
                    timestamp: Date.now(),
                    error: error?.message || error,
                    userControl: oneshot ? true : undefined,
                };

                sendConnectionsUpdate(brokerClient);
                await configManager.saveConnection(connectionConfiguration, connection.id);
            } finally {
                stopFunctions.push(async () => {
                    await brokerClient.disconnect();
                    console.log(`Disconnected from '${connection.name}' at ${connection.url}`);
                });
            }

            let error;

            if (connectionConfiguration.status.error) {
                error = connectionConfiguration.status.error;
            }

            return error;
        } finally {
            if (!multipleConnectionsAllowed) {
                release();
            }
        }
    };

    const handleDisconnectServerFromBroker = async (connection, isNormalDisconnect) => {
        const client = context.brokerManager.getBrokerConnectionById(connection?.id);
        if (client) {
            await client.broker.disconnect(isNormalDisconnect);
        }
        // if (!connection.status) {
        // 	connection.status = {};
        // }

        // connection.status.connected = false;
        // connection.status.timestamp = Date.now();

        // await configManager.updateConnection(connection.id, connection);
    };

    const connectServerToAllBrokers = async () => {
        let connectedBrokersCount = 0;

        for (let i = 0; i < connections.length; i++) {
            if (i < maxBrokerConnections) {
                // preprocess connection to insert any external urls coming from env variables
                try {
                    configManager.validateConnection(connections[i]);
                } catch (error) {
                    console.error(
                        `Invalid connection found in the config file "${connections[i].name}"("${connections[i].id}"). Reason:`,
                        error.message
                    );
                    continue;
                }
                const connection = configManager.preprocessConnection(connections[i], true);
                await configManager.saveConnection(connection);

                const wasConnected = connection.status && connection.status.connected;
                const closedByUser =
                    connection.status &&
                    connection.status.error &&
                    typeof connection.status.error === 'object' &&
                    connection.status.error.code === 'ECONNCLOSED' &&
                    !connection.status.error.interrupted;
                const hadError = connection.status && connection.status.error && !closedByUser;

                if (wasConnected || hadError || connection.status === undefined) {
                    // Note that we don't connect in case broker was manually disconnected. We connect only in the three cases descirbed in if
                    if (context.config.parameters.multipleConnectionsAllowed || connectedBrokersCount < 1) {
                        handleConnectServerToBroker(connection);
                        connectedBrokersCount++;
                    } else {
                        connection.status = {
                            connected: false,
                            timestamp: Date.now(),
                            error: 'Error: Multiple connections not allowed (multiple-connections plugin not loaded)',
                        };
                        await configManager.saveConnection(connection);
                    }
                }
            }
        }
    };
    // console.log(`Starting Mosquitto proxy server at ${protocol}://${host}:${port}`); // no longer needed because it's moved into startup action

    const handleCommandMessage = async (message, client, user = {}) => {
        const { id, type, ...data } = message;
        return context.runAction(user, 'connection/command', data, { client });
    };

    // request name to request action name mapping, legacy
    context.requestHandlers.set('loadPlugin', 'plugin/load');
    context.requestHandlers.set('unloadPlugin', 'plugin/unload');
    context.requestHandlers.set('setPluginStatusAtNextStartup', 'plugin/setStatusNextStartup');
    context.requestHandlers.set('testConnection', 'connection/test');
    context.requestHandlers.set('createConnection', 'connection/create');
    context.requestHandlers.set('modifyConnection', 'connection/modify');
    context.requestHandlers.set('deleteConnection', 'connection/delete');
    context.requestHandlers.set('connectToBroker', 'connection/connect');
    context.requestHandlers.set('disconnectFromBroker', 'connection/disconnect');
    context.requestHandlers.set('getBrokerConnections', 'connection/list');
    context.requestHandlers.set('getBrokerConfigurations', 'config/get');
    context.requestHandlers.set('getSettings', 'settings/get');
    context.requestHandlers.set('updateSettings', 'settings/update');

    const handleRequestMessage = async (message, client, user = {}) => {
        const { request, type, id, ...data } = message;
        const brokerId = context.brokerManager.getBrokerConnectionByClient(client)?.connection?.id;

        if (!context.security.acl.noRestrictedRoles(user)) {
            throw new NotAuthorizedError();
        }
        const actionName = context.requestHandlers.get(request);
        if (actionName) {
            const result = await context.runAction(user, actionName, data, { client, brokerId });
            return result;
        } else {
            throw new Error(`Unsupported request: ${request}`);
        }
    };

    const handleClientMessage = async (message, client, user = {}) => {
        if (CEDALO_MC_ENABLE_FULL_LOG) {
            console.log(message);
        }

        if (!context.security.acl.noRestrictedRoles(user) && message.type === 'command') {
            // don't allow commands if not enough permissions
            const responseMessage = {
                type: 'response',
                command: message?.command?.command || 'response to ' + message.type,
                requestId: message.id,
                error: new NotAuthorizedError().message,
            };
            client.send(JSON.stringify(responseMessage));
        }

        switch (message.type) {
            case 'command': {
                // context.security.acl.noRestrictedRoles(user) throw new NotAuthorizedError();
                try {
                    const response = await handleCommandMessage(message, client, user);
                    const responseMessage = {
                        type: 'response',
                        command: message.command.command,
                        requestId: message.id,
                        ...response,
                    };
                    client.send(JSON.stringify(responseMessage));
                } catch (error) {
                    // console.error(error); // TODO: uncomment
                    const responseMessage = {
                        type: 'response',
                        command: message.command.command,
                        requestId: message.id,
                        error: error.message,
                    };
                    client.send(JSON.stringify(responseMessage));
                }
                break;
            }
            case 'request': {
                // context.security.acl.noRestrictedRoles(user)
                try {
                    const response = await handleRequestMessage(message, client, user);
                    const responseMessage = {
                        type: 'response',
                        requestId: message.id,
                        response,
                    };
                    client.send(JSON.stringify(responseMessage));
                } catch (error) {
                    // console.error(error); // TODO: uncomment
                    const responseMessage = {
                        type: 'response',
                        requestId: message.id,
                        error: error.message,
                    };
                    client.send(JSON.stringify(responseMessage));
                }
                break;
            }
            default:
                break;
        }
    };

    const createConnectionsUpdateWebsocketMessage = (message, stash) => {
        // we need to filter connections to make sure the user that is using socket connections only sees connections that he is allowed to see (user groups feature)
        const username = stash?.username;
        const connectionsToUpdate = message.event.payload;
        if (!username) {
            // if no user is associated with websocket connection we return nothing, I believe
            return;
        }
        const userAssociatedWithClient = stash?.request?.session?.passport?.user;

        if (!userAssociatedWithClient) {
            console.error('No user found when performing notifyWebSocketClients');
            return;
        }

        const filteredConnections = context.security.acl.filterAllowedConnections(
            connectionsToUpdate,
            userAssociatedWithClient.connections
        );
        return {
            ...message,
            event: {
                ...message.event,
                payload: filteredConnections,
            },
        };
    };

    const sendConnectionsUpdate = (brokerClient) => {
        const connections = context.configManager.connections; // context.brokerManager.getBrokerConnections(); brokerManager does not include connections that have been disconnected by the user before the start of the MMC
        let payload = connections;

        const messageObject = {
            type: 'event',
            event: {
                type: 'connections',
                payload,
            },
        };
        notifyWebSocketClients(messageObject, brokerClient); // for connection update action we don't even have to pass brokerClient, because connections update is applied to all clients. the passing of this argument is historical
    };
    context.callbacks.sendConnectionsUpdate = sendConnectionsUpdate;

    const sendSystemStatusUpdate = (system, brokerClient) => {
        const messageObject = {
            type: 'event',
            event: {
                type: 'system_status',
                payload: system,
            },
        };
        notifyWebSocketClients(messageObject, brokerClient);
    };

    const sendTopicTreeUpdate = (topicTree, brokerClient) => {
        const messageObject = {
            type: 'event',
            event: {
                type: 'topic_tree',
                payload: topicTree,
            },
        };
        notifyWebSocketClients(messageObject, brokerClient);
    };

    const notifyWebSocketClients = (message, brokerClient) => {
        wss.clients.forEach((client) => {
            if (message.event.type == 'connections') {
                // connections update is broadcasted to every client
                const filteredConnectionsMessage = createConnectionsUpdateWebsocketMessage(message, client.cedaloStash);
                client.send(JSON.stringify(filteredConnectionsMessage));
                return;
            }

            const broker = context.brokerManager.getBroker(client);
            if (broker === brokerClient) {
                // this WebSocket client is connected to this broker (this particular broker is selected)
                client.send(JSON.stringify(message));
            }
        });
    };

    const broadcastWebSocketMessage = (message) => {
        wss.clients.forEach((client) => {
            client.send(JSON.stringify(message));
        });
    };

    // TODO: handle disconnect of clients
    wss.on('connection', (ws, request) => {
        context.brokerManager.handleNewClientWebSocketConnection(ws);
        const user = request.session?.passport?.user;
        const sessionID = request.sessionID;
        const sessionStore = request.sessionStore;
        if (CEDALO_MC_SESSION_IDLE_TIMEOUT) {
            sessionWsReferences[sessionID] = ws;
            resetIdleExpirationTimer(sessionID, sessionStore);
        }
        // send license information
        ws.cedaloStash = {
            // the name of the property is cedaloStash to make any collision with ws object's internal arguments in the future version highly unlickly
            request,
            username: user?.username,
        }; // store request object in the websocket object itself. This is mainly done to access x-real-ip later on in audit trail plugin

        let sessionMaxAgeTimer;
        if (CEDALO_MC_SESSION_MAXAGE) {
            sessionMaxAgeTimer = createLongTimeout(() => {
                sessionStore.destroy(sessionID, (err) => {
                    if (err) {
                        console.error(`Failed to destroy session ${sessionID} on expire maxage:`, err);
                    } else {
                        ws.send(
                            JSON.stringify({
                                type: 'event',
                                event: {
                                    type: 'sessions-destroyed',
                                    payload: [sessionID],
                                },
                            })
                        );
                        ws.close();
                    }
                });
            }, CEDALO_MC_SESSION_MAXAGE);
        }

        ws.send(
            JSON.stringify({
                type: 'event',
                event: {
                    type: 'license',
                    payload: {
                        ...licenseContainer.license,
                        isValid: licenseContainer.isValid,
                        ...licenseContainer.integrations,
                    },
                },
            })
        );
        // send version information
        ws.send(
            JSON.stringify({
                type: 'event',
                event: {
                    type: 'version',
                    payload: version,
                },
            })
        );

        // TODO: figure out if the below is still relevant
        context.eventEmitter.on('user-updated', (updatedUser) => {
            if (updatedUser.username !== request.session?.passport?.user?.username) {
                return;
            }
            if (request.session?.passport?.user) {
                request.session.passport.user = { ...request.session.passport.user, updatedUser }; // sync user
                request.user = request.session.passport.user;
                context.preprocessUser(request, false); // reprocess user and generate valid connections properties
            }
        });

        ws.on('message', (message) => {
            try {
                const messageObject = JSON.parse(message);

                if (CEDALO_MC_SESSION_IDLE_TIMEOUT && messageObject.type != 'ping') {
                    resetIdleExpirationTimer(sessionID, sessionStore);
                }
                handleClientMessage(messageObject, ws, user);
            } catch (error) {
                console.error(error);
            }
        });
        ws.on('close', (message) => {
            context.brokerManager.handleCloseClientWebSocketConnection(ws);
            if (CEDALO_MC_SESSION_IDLE_TIMEOUT) {
                clearTimeout(sessionTimers[sessionID]);
                clearTimeout(sessionMaxAgeTimer);
                sessionWsReferences[sessionID] = undefined;
            }
        });
    });

    const router = express.Router();
    app.use(CEDALO_MC_PROXY_BASE_PATH, router);

    const preprocessUserFunctions = [];
    const preprocessUser = async (request) => {
        for (const preprocessUserFunction of preprocessUserFunctions) {
            try {
                await preprocessUserFunction(request);
            } catch (error) {
                console.error('Error during user processing:', error);
                throw error;
            }
        }
        return request;
    };

    context = {
        ...context,
        security: {
            ...context.security,
            handleSessionExpiredOrInvalidResponse(request, response, doRedirectOnFail) {
                if (!doRedirectOnFail) {
                    return response.status(401).send({
                        code: 'UNAUTHORIZED',
                        message: 'Unauthorized',
                        data: { session: !!request.session?.passport?.user },
                    });
                }
                return response.redirect(LOGIN_ENDPOINT);
            },
            isLoggedIn(request, response, next, doRedirectOnFail = false) {
                return next();
            },
        },
        configManager,
        pluginManager: new PluginManager(),
        app: app,
        settingsManager,
        usageTracker,
        server: null,
        router: router,
        config,
        globalSystem,
        globalTopicTree,
        licenseContainer,
        broadcastWebSocketMessage,
        sendTopicTreeUpdate,
        sendSystemStatusUpdate,
        loadConfig,
        handleConnectServerToBroker,
        handleDisconnectServerFromBroker,
        preprocessUser,
        middleware: {
            isPluginLoaded: (plugin) => (request, response, next) => {
                if (plugin.isLoaded()) {
                    return next();
                }
                response.status(404).send({ code: 'NOT_FOUND', message: 'Plugin not enabled' });
            },
            preprocessUser: async (request, _response, next) => {
                try {
                    await preprocessUser(request);
                } catch (error) {
                    return next(error);
                }

                return next();
            },
        },
        preprocessUserFunctions: preprocessUserFunctions,
        licenseCheckCallback:
            context.licenseCheckCallback ||
            (async (error, license) => {
                // this is a default licenseCheckCallback. Particular licenseCheckers might ignore this function altogether and instead set their own when calling schedule method.
                // in such cases the only parameter that can be levaraged is the crontab string (i.e. the frequency of executing the license check)
                // in principle, specific plugins can also override this callback through the context if need be and for example send a notification to the API about the invalid license and so on.
                if (error) {
                    licenseContainer.license = license;
                    licenseContainer.isValid = false;
                    const message = {
                        type: 'event',
                        event: {
                            type: 'license',
                            payload: {
                                ...licenseContainer.license,
                                isValid: licenseContainer.isValid,
                                integrations: {
                                    error: licenseContainer.integrations.error,
                                },
                            },
                        },
                    };
                    broadcastWebSocketMessage(message);
                } else {
                    licenseContainer.license = license;
                    licenseContainer.isValid = license.isValid;
                    const message = {
                        type: 'event',
                        event: {
                            type: 'license',
                            payload: {
                                ...licenseContainer.license,
                                isValid: licenseContainer.isValid,
                                integrations: {
                                    error: licenseContainer?.integrations?.error,
                                },
                            },
                        },
                    };
                    broadcastWebSocketMessage(message);
                }
            }),
        utils: { ...utilityFunctions },
    };

    context.pluginManager.init(config.plugins, context, swaggerDocument); //!!!!!!
    if (!configManager.plugins) {
        // in case we did not specify plugins in plugin.json and don't have them in config, we want to load all the plugins available
        configManager.plugins = context.requiredPluginIds.map((pluginId) => ({ id: pluginId }));
    }
    context.config.parameters.ssoUsed = !!context.pluginManager.plugins.find(
        (plugin) => plugin._meta.id.includes('-sso') && plugin._status.type === 'loaded'
    );
    context.config.parameters.multipleConnectionsAllowed = !!context.pluginManager.plugins.find(
        (plugin) => plugin._meta.id.includes('multiple-connections') && plugin._status.type === 'loaded'
    );

    const { host, port, protocol, hostIPs, server, httpPlainServer } = context.runAction(null, 'startup', null, {
        app,
        controlElements,
        config,
        wss,
    });

    // since context has already been passed to the plugins, we need to add variables to it one by one with out recreating the context object itself
    embedIntoObject(context, { host, port, protocol, hostIPs, server, httpPlainServer });

    // Swagger
    const theme = config.themes?.find((theme) => theme.id === 'custom');
    let options = {};
    if (theme?.light?.logo?.path) {
        options = {
            customCss: `.topbar-wrapper img { height: 30px; content: url(${theme.light.logo.path})}`,
        };
    }

    await connectServerToAllBrokers();

    router.use('/api/docs', swaggerUi.serve);
    router.get('/api/docs', context.security.isLoggedIn, swaggerUi.setup(swaggerDocument));
    router.get('/api/docs/export', context.security.isLoggedIn, (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        response.send(JSON.stringify(swaggerDocument, null, 4));
    });

    router.get('/api/version', context.security.isLoggedIn, (request, response) => {
        response.json(version);
    });

    router.get('/api/update', context.security.isLoggedIn, async (request, response) => {
        // const update = await HTTPClient.getInstance().get('https://api.cedalo.cloud/rest/request/mosquitto-ui/version');
        // response.json(update.data);
        response.json({});
    });

    router.get(
        '/api/config',
        context.security.isLoggedIn,
        context.security.acl.middleware.isAdmin,
        (request, response) => {
            response.json(config);
        }
    );

    router.get('/api/installation', context.security.isLoggedIn, (request, response) => {
        response.json(installation);
    });

    router.get('/api/settings', context.security.isLoggedIn, (request, response) => {
        response.json(settingsManager.settings);
    });

    router.get('/api/backend-parameters', context.security.isLoggedIn, (request, response) => {
        response.json(config.parameters);
    });

    router.get('/api/status-check', context.security.isLoggedIn, (request, response) => {
        return response.json({ status: 'healthy' });
    });

    if (!CEDALO_MC_OFFLINE) {
        const NEWSLETTER_URL = 'https://api.cedalo.cloud/rest/api/v1.0/newsletter/subscribe';
        router.get('/api/newsletter/subscribe', (request, response) => {
            response.status(200).send({
                newsletterEndpointAvailable: true,
            });
        });
        router.post('/api/newsletter/subscribe', (request, response) => {
            const user = request.body;
            HTTPClient.getInstance()
                .post(NEWSLETTER_URL, user)
                .then(() => {
                    response.status(200).json({
                        newsletter: true,
                    });
                })
                .catch((error) => {
                    console.error('Error when trying to subscribe for newsletter.');
                    console.error(error);
                });
        });
    } else {
        router.get('/api/newsletter/subscribe', (request, response) => {
            response.status(200).send({
                newsletterEndpointAvailable: false,
            });
        });
    }

    router.get('/api/config/tools/streamsheets', context.security.isLoggedIn, (request, response) => {
        if (config?.tools?.streamsheets) {
            response.json(config?.tools?.streamsheets);
        } else {
            response.json([]);
        }
    });

    router.get('/api/license', context.security.isLoggedIn, (request, response) => {
        response.json(licenseContainer.license);
    });

    router.get(
        '/api/plugins',
        context.security.isLoggedIn,
        context.security.acl.middleware.isAdmin,
        (request, response) => {
            plugins = context.runAction(request.user, 'plugin/list', null);
            response.json(plugins);
        }
    );

    router.get('/*.png', express.static(path.join(__dirname, 'public')));

    router.get(
        '/*',
        (request, response, next) => {
            const doRedirectOnFail = true;
            context.security.isLoggedIn(request, response, next, doRedirectOnFail);
        },
        async (request, response) => {
            let publicFilePath = safeJoin(__dirname, 'public', request.path);
            let mediaFilePath = safeJoin(__dirname, 'media', request.path);
            publicFilePath = publicFilePath.replace(CEDALO_MC_PROXY_BASE_PATH, '');
            mediaFilePath = mediaFilePath.replace(CEDALO_MC_PROXY_BASE_PATH, '');

            try {
                const potentialPaths = [
                    { path: publicFilePath, defaultFile: 'index.html' },
                    { path: mediaFilePath, defaultFile: 'index.html' },
                ];

                for (const potential of potentialPaths) {
                    const exists = fs.existsSync(potential.path); // unfortunately, existsAsync from utils doesn't work with pkg's virtual filesystem
                    if (exists) {
                        if (await isDirectoryAsync(potential.path)) {
                            return response.sendFile(path.join(potential.path, potential.defaultFile));
                        }
                        return response.sendFile(potential.path);
                    }
                }

                if (request.path.includes('/api/')) {
                    return response.status(404).send({ code: 'NOT_FOUND', message: 'Resource not found' });
                }

                return response.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
            } catch (err) {
                console.error('Error handling request:', err);
                return response.status(500).send({ code: 'INTERNAL_ERROR', message: 'Internal Server Error' });
            }
        }
    );

    router.use('/api/*', (error, request, response, next) => {
        if (error) {
            const errorObject = { code: error.code, message: error.message };
            if (error.longError) {
                errorObject.longError = error.longError;
            }

            switch (error.code) {
                case 'ACCEPTED':
                    return response.status(202).send({ ...errorObject, successful: true });
                case 'MULTI_STATUS':
                    return response.status(207).send({ ...errorObject, successful: true });
                case 'CONFLICT':
                    return response.status(409).send(errorObject);
                case 'INVALID':
                    return response.status(400).send(errorObject);
                case 'NOT_ALLOWED':
                    return response.status(403).send(errorObject);
                case 'NOT_FOUND':
                    return response.status(404).send(errorObject);
                case 'GONE':
                    return response.status(410).send(errorObject);
                case 'SOMETHING_WRONG': {
                    console.error(error);
                    return response.status(500).send(errorObject);
                }
                default: {
                    console.error(error);
                    return response
                        .status(500)
                        .send({ ...errorObject, code: 'INTERNAL_ERROR', message: 'An internal server error occurred' });
                }
            }
        } else {
            next();
        }
    });

    // TODO: this router is shadowed by the one on top, so it's probably safe to remove it
    router.use((error, request, response, next) => {
        if (error) {
            console.error(error.stack);
            response.status(500).send({ code: 'INTERNAL_ERROR', message: 'Something went wrong!' });
        } else {
            next();
        }
    });

    // server.listen(
    // 	{
    // 		host,
    // 		port
    // 	},
    // 	() => {
    // 		console.log(`Started Mosquitto proxy server at ${protocol}://${host}:${server.address().port}`);
    // 		controlElements.serverStarted = true;
    // 	}
    // );
    // server.on('upgrade', (request, socket, head) => {
    // 	wss.handleUpgrade(request, socket, head, (socket) => {
    // 		wss.emit('connection', socket, request);
    // 	});
    // });

    const intervalD = setInterval(() => {
        if (settingsManager.settings.allowTrackingUsageData) {
            const data = Object.values(globalSystem);
            usageTracker.send({
                data,
                os: {
                    arch: os.arch(),
                    cpus: os.cpus(),
                    platform: os.platform(),
                    release: os.release(),
                    version: os.version(),
                },
            });
        }
    }, USAGE_TRACKER_INTERVAL);

    if (context.licenseCheckCallback) {
        await checker.scheduleEvery(CEDALO_MC_LICENSE_CRON_TAB_STRING, context.licenseCheckCallback, context);
    }

    stopFunctions.push(() => context.server.close());
    stopFunctions.push(() => context.httpPlainServer?.close()); // plain server created to redirect http -> https in case https is used
    stopFunctions.push(() => {
        clearInterval(intervalD);
    });
    stopFunctions.push(() => checker.stop());
    stopFunctions.push(() => wss.close());
};

(async () => {
    await checker.check(async (error, license) => {
        if (error) {
            console.error(error);
            console.error('Encountered an unexpected error when processing the license. Terminating...');
            process.exit(-1);
        }
        licenseContainer.license = license;
        licenseContainer.isValid = license.isValid;
        try {
            if (license.plan) {
                console.log(`Found ${`${license.plan.toUpperCase()}`} plan license.`);
            }
            await init(licenseContainer);
        } catch (error) {
            console.log('Error encountered');
            console.log('Attempting graceful shutdown');

            if (error.message === 'Exit') {
            } else {
                console.error(error);
            }

            await controlElements.stop();
            setTimeout(() => {
                // TODO: fix this quick hack which allows us to write shutdown event to syslog and not exit before it
                process.exit(1);
            }, 1000);
        }
    });

    process.on('SIGTERM', async () => {
        // TODO: stop does not release all the resources. App still hangs for some reason
        console.log('SIGTERM received. Terminating...');
        await controlElements.stop();
        setTimeout(() => {
            // TODO: fix this quick hack which allows us to write shutdown event to syslog and not exit before it
            process.exit(0);
        }, 1000);
    });
    process.on('SIGINT', async () => {
        console.log('SIGNINT received. Terminating...');
        await controlElements.stop(); // TODO: fix this quick hack which allows us to write shutdown event to syslog and not exit before it
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    });
})();

module.exports = controlElements;
