const path = require('path');
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const BasePlugin = require('../../BasePlugin');
const meta = require('./meta');

const USERNAME = process.env.CEDALO_MC_USERNAME || 'cedalo';
const PASSWORD = process.env.CEDALO_MC_PASSWORD || 'secret';

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super();
		this._meta = meta;
	}

	init(context) {
		const { actions, app, globalTopicTree, brokerManager } = context;

		app.use(passport.initialize());
		app.use(passport.session());
	
		passport.use(new LocalStrategy(
			// function of username, password, done(callback)
			(username, password, done) => {
				if (username === USERNAME && password === PASSWORD) {
					return done(null, {
						username
					});
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
			response.redirect('/login');
		}

		app.use(express.static(path.join(__dirname, '..', 'component')));

		app.get('/login', (request, response) => {
			response.sendFile(path.join(__dirname, '..', 'component', 'login.html'));
		});
	
		app.get('/logout', (request, response) => {
			request.logout();
			response.redirect('/login');
		});
	
		app.post('/auth', passport.authenticate('local', {
				successRedirect: '/',
				failureRedirect: '/login',
			}
		));

	}

	get meta() {
		return this._meta;
	}
}