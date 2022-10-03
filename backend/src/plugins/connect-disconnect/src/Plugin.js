const path = require('path');
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const BasePlugin = require('../../BasePlugin');
const meta = require('./meta');

const NOT_AUTHORIZED_ERROR_MESSAGE = `You don't have enough user rights to perform this operation`;
const USERNAME = process.env.CEDALO_MC_USERNAME || 'cedalo';
const PASSWORD = process.env.CEDALO_MC_PASSWORD || 'secret';
const CEDALO_MC_PROXY_BASE_PATH = process.env.CEDALO_MC_PROXY_BASE_PATH || '';

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super();
		this._meta = meta;
	}

	init(context) {
		const { requestHandlers } = context;
		this._context = context;
		requestHandlers.set('connectServerToBroker', this);
		requestHandlers.set('disconnectServerFromBroker', this);
	}

	async connectServerToBroker({ id }, user) {
		if (this._context.security.acl.isConnectionAuthorized(user, this._context.security.acl.atLeastAdmin, null, id)) {
			const connection = this._context.configManager.getConnection(id);
			try {
				await this._context.actions.handleConnectServerToBroker(connection);
			} catch (error) {
				throw error;
			}
			if (connection.status?.error) {
				throw new Error(connection.status?.error);
			} else {
				return this._context.configManager.connections;				
			}
		} else {
			throw new Error(NOT_AUTHORIZED_ERROR_MESSAGE);
		}
	}

	async disconnectServerFromBroker({ id }, user) {
		if (this._context.security.acl.isConnectionAuthorized(user, this._context.security.acl.atLeastAdmin, null, id)) {
			try {
				const connection = this._context.configManager.getConnection(id);
				await this._context.actions.handleDisconnectServerFromBroker(connection);
			} catch (error) {
				throw error;
			}
			return this._context.configManager.connections;
		} else {
			throw new Error(NOT_AUTHORIZED_ERROR_MESSAGE);
		}
	}

	get meta() {
		return this._meta;
	}
}