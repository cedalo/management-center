const path = require('path');
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const BasePlugin = require('../../BasePlugin');
const meta = require('./meta');
const swagger = require('./swagger');
const { createActions } = require('./actions');
const { hasSession } = require('../../../utils/utils');


const CEDALO_MC_PROXY_BASE_PATH = process.env.CEDALO_MC_PROXY_BASE_PATH || '';

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super(meta);
		this._swagger = swagger;
	}

	init(context) {
		const { router, registerAction } = context;

		const { loginAction, logoutAction } = createActions(this);

		registerAction(loginAction);
		registerAction(logoutAction);

		// app.use(passport.initialize());
		// app.use(passport.session());

		router.use(passport.initialize());
		router.use(passport.session());

		passport.use(
			new LocalStrategy(
				// function of username, password, done(callback)
				async (username, password, done) => {
					try {
						const user = await context.runAction(null, 'user/login', { username, password });
						done(null, user);
					} catch (error) {
						done(null, false, error);
					}
				}
			)
		);

		passport.serializeUser(function (user, done) {
			done(null, user);
		});

		passport.deserializeUser(function (user, done) {
			done(null, user);
		});

		router.use(context.middleware.preprocessUser);

		context.security.isLoggedIn = (request, response, next) => {
			if (request.isAuthenticated()) {
				return next();
			}

			response.redirect(303, `${CEDALO_MC_PROXY_BASE_PATH}/login`);
		};

		router.use(express.static(path.join(__dirname, '..', 'component')));

		router.get('/login', (request, response) => {
			response.sendFile(path.join(__dirname, '..', 'component', 'login.html'));
		});

		router.get('/logout', (request, response) => {
			const { user } = request;
			request.logout(function (error) {
				if (error) {
					return next(error);
				}
				context.runAction(user, 'user/logout', { username: user?.username });
				response.redirect('/login');
			});
		});

		router.get(
			'/validate-session',
			(request, response) => {
				return response.send(hasSession(request) ? { valid: true } : { valid: false });
				// return hasSession(request) ? next() : response.redirect(303, `${CEDALO_MC_PROXY_BASE_PATH}/login`);
			}
		);
	
		router.post('/auth', (request, response, next) => {
			passport.authenticate('local', (error, user, info) => {
				if (error) {
					return next(error);
				}
				if (!user) {
					if (!request.query.json) {
						return response.redirect(`${CEDALO_MC_PROXY_BASE_PATH}/login?error=authentication-failed`);
					} else {
						return response.status(401).send({ code: 'UNAUTHORIZED', message: 'Unauthorized'});
						
					}
				} else {
					request.login(user, function (error_) {
						if (error_) {
							return next(error_);
						}
						if (!request.query.json) {
							return response.redirect(`${CEDALO_MC_PROXY_BASE_PATH}/`);
						} else {
							return response.status(200).send({ code: 'SUCCESS', message: 'Authorized', successful: true});
						}
					});
				}
			})(request, response, next);
		});

		// router.post('/auth', passport.authenticate('local', {
		// 		successRedirect: `${CEDALO_MC_PROXY_BASE_PATH}/`,
		// 		failureRedirect : `${CEDALO_MC_PROXY_BASE_PATH}/login?error=authentication-failed`,
		// 	}
		// ));
	}
};
