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
		MuiAppBar: {
			colorPrimary: {
				backgroundColor: '#212121',
			},
		}
	}
});

export default theme;
