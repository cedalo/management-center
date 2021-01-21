import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { green, red } from '@material-ui/core/colors';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { updateClient, updateClients, updateGroups, updateRoles } from '../actions/actions';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Paper from '@material-ui/core/Paper';
import PluginDisabledIcon from '@material-ui/icons/Cancel';
import PluginEnabledIcon from '@material-ui/icons/CheckCircle';
import { Link as RouterLink } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Terminal from 'terminal-in-react';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import moment from 'moment';
import useLocalStorage from '../helpers/useLocalStorage';

const useStyles = makeStyles((theme) => ({
	terminal: {
		fontWeight: 'bold',
		fontSize: '2em'
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
	const [darkMode, setDarkMode] = useLocalStorage('cedalo.managementcenter.darkMode');
	const theme = useTheme();
	const context = useContext(WebSocketContext);
	const { client: brokerClient } = context;

	const classes = useStyles();

	return (
		<Terminal
			startState="maximised"
			className={classes.terminal}
			showActions={false}
			hideTopBar={true}
			allowTabs={false}
			prompt={darkMode === 'true' ? 'yellow' : 'darkgrey'}
			color={darkMode === 'true' ? 'yellow' : 'darkgrey'}
			style={{ fontWeight: 'bold', fontSize: '1.4em', width: '100%' }}
			backgroundColor={darkMode === 'true' ? 'black' : 'white'}
			barColor="black"
			outputColor={darkMode === 'true' ? 'green' : 'grey'}
			commands={{
				addGroupClient: (args, print, runCommand) => {
					const [, username, groupname] = args;
					brokerClient
						.addGroupClient(username, groupname)
						.then(() => {
							print(`Client "${username}" successfully added to group "${groupname}"!`);
						});
				},
				addGroupRole: (args, print, runCommand) => {
					const [, groupname, rolename, priority] = args;
					brokerClient
						.addGroupRole(groupname, rolename, priority)
						.then(() => {
							print(`Role "${rolename}" successfully added to group "${groupname}"!`);
						});
				},
				addRoleACL: (args, print, runCommand) => {
					const [, rolename, acltype, priority, topic, allow] = args;
					brokerClient
						.addRoleACL(rolename, { acltype, priority, topic, allow })
						.then(() => {
							print(`ACL successfully added to role "${rolename}"!`);
						});
				},
				createClient: (args, print, runCommand) => {
					const [, username, password, clientid, rolename, textname, textdescription] = args;
					brokerClient
						.createClient(username, password, clientid, rolename, textname, textdescription)
						.then(() => {
							print(`Client "${username}" successfully created!`);
						})
						.then(() => brokerClient.listClients())
						.then((clients) => dispatch(updateClients(clients)));
				},
				createGroup: (args, print, runCommand) => {
					const [, groupname, rolename, textname, textdescription] = args;
					brokerClient
						.createGroup(groupname, rolename, textname, textdescription)
						.then(() => {
							print(`Group "${args[1]}" successfully created!`);
						})
						.then(() => brokerClient.listGroups())
						.then((groups) => dispatch(updateGroups(groups)));
				},
				createRole: (args, print, runCommand) => {
					const [, rolename, textname, textdescription] = args;
					brokerClient
						.createRole(rolename, textname, textdescription)
						.then(() => {
							print(`Role "${rolename}" successfully created!`);
						})
						.then(() => brokerClient.listRoles())
						.then((roles) => dispatch(updateRoles(roles)));
				},
				deleteClient: (args, print, runCommand) => {
					const [, username] = args;
					brokerClient.deleteClient(username).then(() => {
						print(`Client "${username}" successfully deleted!`);
					});
				},
				deleteGroup: (args, print, runCommand) => {
					const [, groupname] = args;
					brokerClient.deleteGroup(groupname).then(() => {
						print(`Group "${groupname}" successfully deleted!`);
					});
				},
				deleteRole: (args, print, runCommand) => {
					const [, rolename] = args;
					brokerClient.deleteRole(rolename).then(() => {
						print(`Role "${rolename}" successfully deleted!`);
					});
				},
				disableClient: (args, print, runCommand) => {
					const username = args[1];
					brokerClient.disableClient(username).then(() => {
						print(`Client "${username}" disabled!`);
					})
					.then(() => brokerClient.listClients())
					.then((clients) => dispatch(updateClients(clients)));
				},
				enableClient: (args, print, runCommand) => {
					const username = args[1];
					brokerClient.enableClient(username).then(() => {
						print(`Client "${username}" enabled!`);
					})
					.then(() => brokerClient.listClients())
					.then((clients) => dispatch(updateClients(clients)));
				},
				getGroup: (args, print, runCommand) => {
					brokerClient.getGroup(args[1]).then((group) => {
						print(`Name: ${group.groupname}`);
						print(`Description: ${group.textdescription}`);
					});
				},
				listClients: (args, print, runCommand) => {
					brokerClient.listClients().then((clients) => {
						const message = clients
							.map((client) => `${client.username}\t${client.clientid ? client.clientid : ''}`)
							.join('\n');
						print(message);
					});
				},
				listGroups: (args, print, runCommand) => {
					brokerClient.listGroups().then((groups) => {
						const message = groups.map((group) => `${group.groupname}`).join('\n');
						print(message);
					});
				},
				listRoles: (args, print, runCommand) => {
					brokerClient.listRoles().then((roles) => {
						const message = roles.map((role) => `${role.rolename}`).join('\n');
						print(message);
					});
				},
				getAnonymousGroup: (args, print, runCommand) => {
					brokerClient.getAnonymousGroup()
						.then((group) => brokerClient.getGroup(group.groupname))
						.then((group) => {
							print(`Name: ${group.groupname}`);
							print(`Description: ${group.textdescription}`);
						});
				},
				modifyRole: (args, print, runCommand) => {
					const rolename = args[1];
					const textname = args[2];
					const textdescription = args[3];
					brokerClient.modifyRole({ rolename, textname, textdescription })
						.then(() => {
							print('Done');
						});
				},
				removeGroupClient: (args, print, runCommand) => {
					brokerClient
						.removeGroupClient(args[1], args[2])
						.then(() => {
							print(`Client "${args[1]}" successfully removed from group "${args[2]}"!`);
						});
				},
				removeGroupRole: (args, print, runCommand) => {
					const [, groupname, rolename] = args;
					brokerClient
						.removeGroupRole(groupname, rolename)
						.then(() => {
							print(`Role "${rolename}" successfully removed from group "${groupname}"!`);
						});
				setAnonymousGroup: (args, print, runCommand) => {
					brokerClient.setAnonymousGroup(args[1]).then(() => {
						print('Done');
					});
				}
			}}
			descriptions={{
				addGroupClient: 'Add a client to a group',
				createClient: 'Create a new client',
				createGroup: 'Create a new group',
				createRole: 'Create a new role',
				deleteClient: 'Delete a client',
				deleteGroup: 'Delete a client',
				getAnonymousGroup: 'Get anonymous group',
				getGroup: 'Get the details for a group',
				removeGroupClient: 'Remove a client from a group',
				setAnonymousGroup: 'Set anonymous group',
				listClients: 'List all clients',
				listGroups: 'List all groups',
				listRoles: 'List all roles'
			}}

			msg="Welcome to the Management Center Terminal, type 'help' for more information."
		/>
	);
};

const mapStateToProps = (state) => {
	return {
		license: state.license?.license,
		version: state.version?.version
	};
};

export default connect(mapStateToProps)(Plugins);
