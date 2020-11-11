const BasePlugin = require('../../base/src/BasePlugin');
const meta = require('./meta');

const defaultTheme = {
	id: 'cedalo',
	name: 'Cedalo AG',
	light: {
		logo: {
			path: '/logo.png'
		},
		palette: {
			primary: {
				main: '#556cd6'
			},
			secondary: {
				main: '#19857b'
			}
		}
	},
	dark: {
		logo: {
			path: '/logo.png'
		},
		palette: {
			primary: {
				main: 'rgb(16, 30, 38)'
			},
			secondary: {
				main: '#ffc107'
			},
			text: {
				primary: 'rgb(156, 215, 247)'
			},
			background: {
				default: 'rgb(6, 31, 47)',
				paper: 'rgb(16, 30, 38)'
			}
		}
	}
	// "dark": {
	// 	"palette": {
	// 		"primary": {
	// 			"main": "#556cd6"
	// 		},
	// 		"secondary": {
	// 			"main": "#33c9dc"
	// 		}
	// 	}
	// }
};

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super();
		this._meta = meta;
	}

	init(context) {
		this._context = context;
		const { app } = this._context;
		app.get('/api/theme', (request, response) => {
			const { actions, licenseContainer } = this._context;
			if (this.isLoaded()) {
				const themes = actions.loadConfig().themes;
				if (licenseContainer.license.isValid) {
					response.json(themes.find((theme) => theme.id === 'custom'));
				} else {
					response.json(defaultTheme);
				}
			} else {
				response.status(404).send('Plugin not enabled');
			}
		});
	}

	get meta() {
		return this._meta;
	}
}
