import React from 'react';
import ReactDOM from 'react-dom';
import { ConfirmProvider } from 'material-ui-confirm';
// import CssBaseline from '@material-ui/core/CssBaseline';
// import { ThemeProvider } from '@material-ui/core/styles';
import App from './App';
// import theme from './theme';

ReactDOM.render(
	<ConfirmProvider>
		<App />
	</ConfirmProvider>
  ,
  document.querySelector('#root'),
);
