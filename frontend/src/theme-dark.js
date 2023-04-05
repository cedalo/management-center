import { red } from '@material-ui/core/colors';
import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
	palette: {
		type: 'dark',
		primary: {
			main: '#FD602E'
		},
		secondary: {
			main: '#7c88cc'
		},
		menuItem: {
			color: '#FD602E',
		},
		error: {
			main: red.A400
		},
		breadcrumbItem: {
			fontSize: '0.7rem',
			fontWeight: '500',
			textTransform: 'uppercase'
		},
		breadcrumbLink: {
			color: 'inherit',
			textDecoration: 'none',
			textTransform: 'uppercase',
			fontSize: '0.7rem',
			'&:hover': {
				textDecoration: 'underline'
			}
		}
	},
	overrides: {
		MuiCard: {
			root: {
				background: 'none',
			},
		},
		MuiAppBar: {
			colorPrimary: {
				backgroundColor: '#212121',
			},
		},
		MuiAutocomplete: {
			tagSizeSmall: {
				backgroundColor: '#FD602E',
				color: '#FFFFFF',
			},
			hasClearIcon: {
				color: 'rgba(255, 255, 255, 0.7)',
			},
			inputRoot: {
				'& .MuiAutocomplete-input': {
					minWidth: '5px'
				},
				minWidth: '5px'
			},
			option: {
				paddingTop: '0px',
				paddingLeft: '0px',
				paddingBottom: '0px',
				paddingRight: '0px'
			}
		}
	}
});

export default theme;
