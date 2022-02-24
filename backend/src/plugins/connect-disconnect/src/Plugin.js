const path = require('path');
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const BasePlugin = require('../../BasePlugin');
const meta = require('./meta');

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
		if (this._context.security.acl.isAdmin(user)) {
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
			throw new NotAuthorizedError();
		}
	}

	async disconnectServerFromBroker({ id }, user) {
		if (this._context.security.acl.isAdmin(user)) {
			try {
				const connection = this._context.configManager.getConnection(id);
				await this._context.actions.handleDisconnectServerFromBroker(connection);
			} catch (error) {
				throw error;
			}
			return this._context.configManager.connections;
		} else {
			throw new NotAuthorizedError();
		}
	}

	get meta() {
		return this._meta;
	}
}