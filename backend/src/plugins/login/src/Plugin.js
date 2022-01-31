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
					const user = context.security.usersManager.getUser(username);
					return done(null, user);
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

		context.security.isLoggedIn = (request, response, next) => {
			if (request.isAuthenticated()) {
				return next();
			}
			response.redirect(`${CEDALO_MC_PROXY_BASE_PATH}/login`);
		}

		router.use(express.static(path.join(__dirname, '..', 'component')));

		router.get('/login', (request, response) => {
			response.sendFile(path.join(__dirname, '..', 'component', 'login.html'));
		});
	
		router.get('/logout', (request, response) => {
			request.logout();
			response.redirect('/login');
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