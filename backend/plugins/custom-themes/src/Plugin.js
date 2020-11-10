const BasePlugin = require('../../base/src/BasePlugin');

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
		this._meta = {
			"id": "cedalo_custom_themes",
			"name": "Cedalo Custom Themes",
			"version":"1.0",
			"description":"Customize themes",
			"feature": "Custom Themes"
		}
	}

	init(context) {

	}

	load(context) {
		const { actions, app, licenseContainer } = context;
		app.get('/api/theme', (request, response) => {
			const themes = actions.loadConfig().themes;
			if (licenseContainer.license.isValid) {
				response.json(themes.find((theme) => theme.id === 'custom'));
			} else {
				response.json(defaultTheme);
			}
		});
	}

	get meta() {
		return this._meta;
	}
}
