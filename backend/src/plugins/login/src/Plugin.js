const path = require('path');
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const BasePlugin = require('../../BasePlugin');
const meta = require('./meta');
const swagger = require('./swagger')

const USERNAME = process.env.CEDALO_MC_USERNAME || 'cedalo';
const PASSWORD = process.env.CEDALO_MC_PASSWORD || 'secret';
const CEDALO_MC_PROXY_BASE_PATH = process.env.CEDALO_MC_PROXY_BASE_PATH || '';

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super();
		this._meta = meta;
		this._swagger = swagger;
	}

	init(context) {
		const { actions, app, globalTopicTree, brokerManager, router } = context;

		// app.use(passport.initialize());
		// app.use(passport.session());
	

		router.use(passport.initialize());
		router.use(passport.session());
	
		passport.use(new LocalStrategy(
			// function of username, password, done(callback)
			(username, password, done) => {
				if (username === USERNAME && password === PASSWORD) {
					return done(null, {
						username,
						roles: ['admin']
					});
				}
				const valid = (username === USERNAME && password === PASSWORD) || context.security?.usersManager?.checkUser(username, password);
				if (valid) {
					let user = false;
					let message = undefined;
					if (context.security.usersManagerEnabled) {
						user = context.security.usersManager.getUser(username);
					} else {
						message = {message: 'UserManagement disabled'};
					}
					return done(null, user, message);
				} else {
					return done(null, false, { message: 'Invalid credentials' });
				}
			}
		));
	
		passport.serializeUser(function(user, done) {
			done(null, user);
		});
		
		passport.deserializeUser(function(user, done) {
			done(null, user);
		});

		router.use(context.middleware.preprocessUser);

		context.security.isLoggedIn = (request, response, next) => {
			if (request.isAuthenticated()) {
				return next();
			}

			response.redirect(303, `${CEDALO_MC_PROXY_BASE_PATH}/login`);
		}

		router.use(express.static(path.join(__dirname, '..', 'component')));

		router.get('/login', (request, response) => {
			response.sendFile(path.join(__dirname, '..', 'component', 'login.html'));
		});

		router.get('/logout', (request, response) => {
			request.logout(function(error) {
				if (error) {
					return next(error);
				}
				response.redirect('/login');
			});
		});
	
		router.post('/auth', passport.authenticate('local', {
				successRedirect: `${CEDALO_MC_PROXY_BASE_PATH}/`,
				failureRedirect: `${CEDALO_MC_PROXY_BASE_PATH}/login?error=authentication-failed`,
			}
		));

	}

	get meta() {
		return this._meta;
	}
}