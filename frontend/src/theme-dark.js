import { red } from '@mui/material/colors';
import { createTheme, adaptV4Theme } from '@mui/material/styles';

const theme = createTheme(adaptV4Theme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#556cd6'
			//   main: '#00695f',
			//   main: '#ffc107',
			//   main: 'rgb(44, 19, 56)',
		},
		secondary: {
			main: '#7c88cc'
			//   main: '#009688',
			//   main: '#ffcd38',
		},
		menuItem: {
			color: '#2697ed',
		},
		error: {
			main: red.A400
		},
		breadcrumbItem: {
			fontSize: '12px',
			fontWeight: '500',
			textTransform: 'uppercase'
		},
		breadcrumbLink: {
			color: 'inherit',
			textDecoration: 'none',
			textTransform: 'uppercase',
			fontSize: '12px',
			'&:hover': {
				textDecoration: 'underline'
			}
		}
	}
}));

export default theme;
