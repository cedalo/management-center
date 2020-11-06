import moment from 'moment';
import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import PluginDisabledIcon from '@material-ui/icons/Cancel';
import PluginEnabledIcon from '@material-ui/icons/CheckCircle';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { red, green } from '@material-ui/core/colors';
import Terminal from 'terminal-in-react';

import { Link as RouterLink } from 'react-router-dom';

import { WebSocketContext } from '../websockets/WebSocket';
import { updateClient, updateClients, updateGroups } from '../actions/actions';
import useLocalStorage from '../helpers/useLocalStorage';

const useStyles = makeStyles((theme) => ({
	terminal: {
		fontWeight: "bold", 
		fontSize: "2em"
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const Plugins = (props) => {
	const dispatch = useDispatch();
	const [darkMode, setDarkMode] = useLocalStorage('mosquitto-ui.darkMode');
	const theme = useTheme();
	const context = useContext(WebSocketContext);
	const { client: brokerClient } = context;

	const showMsg = () => 'Hello World'

	const classes = useStyles();

	return (
		<Terminal
		  startState='maximised'
		  className={classes.terminal}
		  showActions={false}
		  hideTopBar={true}
		  allowTabs={false}
		  prompt={darkMode === 'true' ? 'yellow' : 'darkgrey'}
		  color={darkMode === 'true' ? 'yellow' : 'darkgrey'}
		  style={{ fontWeight: "bold", fontSize: "1.4em", width: '100%' }}
          backgroundColor={darkMode === 'true' ? 'black' : 'white'}
		  barColor='black'
		  outputColor={darkMode === 'true' ? 'green' : 'grey'}
          commands={{
			  'addClient': (args, print, runCommand) => {
				brokerClient.createClient(args[1], args[2], args[3])
					.then(() => {
						print(`Client "${args[1]}" successfully created!`);
					})
					.then(() => brokerClient.listClients())
					.then(clients => dispatch(updateClients(clients)))
			  },
			  'listClients': (args, print, runCommand) => {
				brokerClient.listClients().then((clients) => {
					const message = clients
						.map((client) => `${client.username}\t${client.clientid ? client.clientid : ''}`)
						.join('\n')
					print(message);
				});
			  },
			  'listGroups': (args, print, runCommand) => {
				brokerClient.listGroups().then((groups) => {
					const message = groups
						.map((group) => `${group.groupname}`)
						.join('\n')
					print(message);
				});
			  },
			  'listRoles': (args, print, runCommand) => {
				brokerClient.listRoles().then((roles) => {
					const message = roles
						.map((role) => `${role.rolename}`)
						.join('\n')
					print(message);
				});
			  },
			  'deleteClient': (args, print, runCommand) => {
				brokerClient.deleteClient(args[1]).then(() => {
					print(`Client "${args[1]}" successfully deleted!`);
				});
			  },
          }}
          descriptions={{
            'addClient': 'Add a new client',
            'deleteClient': 'Delete a client',
            'listClients': 'List all clients',
            'listGroups': 'List all groups',
            'listRoles': 'List all roles'
          }}
          msg='Welcome to the Management Center Terminal'
        />
	)
};

const mapStateToProps = (state) => {
	return {
		license: state.license?.license,
		version: state.version?.version
	};
};

export default connect(mapStateToProps)(Plugins);
