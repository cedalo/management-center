const CEDALO_MC_TOPIC_TREE_UPDATE_INTERVAL = process.env.CEDALO_MC_TOPIC_TREE_UPDATE_INTERVAL || 5000;

module.exports = class TopicTreeManager {

    constructor(brokerClient, connection, settingsManager, context) {
        this._context = context;
        this._brokerClient = brokerClient;
        this._connection = connection;
        this._topicTree = {
            _name: connection.name
        };
        this._settingsManager = settingsManager;
        this._context.eventEmitter?.on('settings-update', this.topicTreeEnableDisableCallback.bind(this));
        this._context.eventEmitter?.on('reconnect', this.topicTreeConnectReconnectCallback.bind(this)); // if topic tree reconnected
        this._context.eventEmitter?.on('connect', this.topicTreeConnectReconnectCallback.bind(this)); // if topic tree is enabled on startup we need to sub to all topics
        this._listeners = [];
    }

    get topicTree() {
        return this._topicTree;
    }

    subToAllTopics() {
        this._brokerClient.subscribe('#', (error) => {
            console.log(`Subscribed to all topics for '${this._topicTree._name}'`);
            if (error) {
              console.error(error);
            }
        });
    }

    topicTreeEnableDisableCallback(oldSettings, newSettings) {
        if (oldSettings.topicTreeEnabled && !newSettings.topicTreeEnabled) {
            this.stop();
		} else if (!oldSettings.topicTreeEnabled && newSettings.topicTreeEnabled) {
            this.subToAllTopics();
        }
    }

    topicTreeConnectReconnectCallback(connectionConfiguration) {
        if (connectionConfiguration.name === this._topicTree._name) { // if broker name the same
            if (this._settingsManager.settings.topicTreeEnabled) {
                this.subToAllTopics();
            }
        }
    }

    start() {
        let lastUpdatedTopicTree = Date.now();    
        
        this._brokerClient.on('message', (topic, message, packet) => {
            if (this._settingsManager.settings.topicTreeEnabled) {
                // in any case update the topic tree
                this._updateTopicTree(topic, message, packet);
                let now = Date.now();
                if (now - lastUpdatedTopicTree > CEDALO_MC_TOPIC_TREE_UPDATE_INTERVAL) {
                    lastUpdatedTopicTree = Date.now();
                    this._notifyListeners();
                }
            }
        });
    }

    addListener(listener) {
        this._listeners.push(listener);
    }

    _notifyListeners() {
        for (let i = 0; i < this._listeners.length; i++) {
            const callback = this._listeners[i];
            callback(this._topicTree, this._brokerClient, this._connection);
        }
    }

    stop() {
        this._brokerClient.unsubscribe('#', (error) => {
            console.log(`Unsubscribed from all topics for '${this._topicTree._name}'`);
            if (error) {
              console.error(error);
            }
        });
    }

    _updateTopicTree(topic, message, packet) {
        if (!this._topicTree._messagesCounter) {
            this._topicTree._messagesCounter = 0;
        }
        this._topicTree._messagesCounter += 1;
        const parts = topic.split('/');
        let current = this._topicTree;
        let newTopic = false;
        let partsAccumulator = '';
        parts.forEach((part, index) => {
            if (!current[part]) {
                // first time the topic was received
                partsAccumulator += part;
                current[part] = {
                    _name: part,
                    _topic: partsAccumulator,
                    _created: Date.now(),
                    _messagesCounter: 1,
                    _topicsCounter: 0
                };
                partsAccumulator += '/';
                newTopic = true;
            } else {
                // topic already existed in the topic tree
                current[part]._lastModified = Date.now();
                current[part]._messagesCounter += 1;
            }
            if (parts.length - 1 === index) {
                // last item is the node where the message should be saved
                current[part]._message = message.toString();
                current[part]._cmd = packet.cmd;
                current[part]._dup = packet.dup;
                current[part]._retain = packet.retain;
                current[part]._qos = packet.qos;
            }
            current = current[part];
        });

        current = this._topicTree;
        if (newTopic) {
            parts.forEach((part, index) => {
                if (index < parts.length - 1) { // all except the last one
                    current[part]._topicsCounter += 1;
                }
                current = current[part];
            });
        }
        return this._topicTree;
    }

}