import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { green, red } from '@material-ui/core/colors';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { updateAnonymousGroup, updateDefaultACLAccess, updateClient, updateClients, updateGroups, updateRoles } from '../actions/actions';

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

const isHelpParameter = (parameter) => parameter === '--help';
const toErrorMessage = (error) => `⚠️ ${error.message ? error.message : error}`;

const Plugins = (props) => {
	const dispatch = useDispatch();
	const [darkMode, setDarkMode] = useLocalStorage('cedalo.managementcenter.darkMode');
	const theme = useTheme();
	const context = useContext(WebSocketContext);
	const { client: brokerClient } = context;

	const classes = useStyles();

	const message = `Welcome to the Management Center Terminal.
💡 Type 'help' for a list of available commands and type '<command> --help' for information on a specific command.`

	const updateAndDispatchClients = () => 
		brokerClient
			.listClients()
			.then((clients) => dispatch(updateClients(clients)))

	const updateAndDispatchGroups = () => 
		brokerClient
			.listGroups()
			.then((groups) => dispatch(updateGroups(groups)))

	const updateAndDispatchRoles = () => 
		brokerClient
			.listRoles()
			.then((roles) => dispatch(updateRples(roles)))

	const commands = {
		addGroupClient: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`addGroupClient <username> <groupname> <priority>`);
			} else {
				const [, username, groupname, priority] = args;
				brokerClient
					.addGroupClient(username, groupname, priority)
					.then(() => {
						print(`Client "${username}" successfully added to group "${groupname}"!`);
					})
					.then(updateAndDispatchClients())
					.then(updateAndDispatchGroups())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		addGroupRole: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`addGroupRole <groupname> <rolename> <priority>`);
			} else {
				const [, groupname, rolename, priority] = args;
				brokerClient
					.addGroupRole(groupname, rolename, priority)
					.then(() => {
						print(`Role "${rolename}" successfully added to group "${groupname}"!`);
					})
					.then(updateAndDispatchGroups())
					.then(updateAndDispatchRoles())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		addRoleACL: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`addRoleACL <rolename> <acltype> <topic filter> allow|deny <priority>`);
			} else {
				const [, rolename, acltype, topic, allow, priority] = args;
				const parsedPriority = parseInt(priority);
				if (allow !== 'true' && allow !== 'false') {
					print(toErrorMessage('allow|deny parameter must be a boolean.'));
					return;
				}
				if (isNaN(parsedPriority)) {
					print(toErrorMessage('Priority must be a number.'));
					return;
				}
				brokerClient
					.addRoleACL(rolename, { acltype, priority: parsedPriority, topic, allow })
					.then(() => {
						print(`ACL successfully added to role "${rolename}"!`);
					})
					.then(updateAndDispatchRoles())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		createClient: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`createClient <username> <password> <clientid> <rolename> <textname> <textdescription>`);
			} else {
				const [, username, password, clientid, rolename, textname, textdescription] = args;
				brokerClient
					.createClient(username, password, clientid, rolename, textname, textdescription)
					.then(() => {
						print(`Client "${username}" successfully created!`);
					})
					.then(updateAndDispatchClients())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		createGroup: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`createGroup <groupname> <rolename> <textname> <textdescription>`);
			} else {
				const [, groupname, rolename, textname, textdescription] = args;
				brokerClient
					.createGroup(groupname, rolename, textname, textdescription)
					.then(() => {
						print(`Group "${args[1]}" successfully created!`);
					})
					.then(updateAndDispatchGroups())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		createRole: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`createRole <rolename> <textname> <textdescription>`);
			} else {
				const [, rolename, textname, textdescription] = args;
				brokerClient
					.createRole(rolename, textname, textdescription)
					.then(() => {
						print(`Role "${rolename}" successfully created!`);
					})
					.then(updateAndDispatchRoles())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		deleteClient: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`deleteClient <username>`);
			} else {
				const [, username] = args;
				brokerClient.deleteClient(username)
					.then(() => {
						print(`Client "${username}" successfully deleted!`);
					})
					.then(updateAndDispatchClients())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		deleteGroup: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`deleteGroup <groupname>`);
			} else {
				const [, groupname] = args;
				brokerClient.deleteGroup(groupname)
					.then(() => {
						print(`Group "${groupname}" successfully deleted!`);
					})
					.then(updateAndDispatchGroups())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		deleteRole: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`deleteRole <rolename>`);
			} else {
				const [, rolename] = args;
				brokerClient.deleteRole(rolename)
					.then(() => {
						print(`Role "${rolename}" successfully deleted!`);
					})
					.then(updateAndDispatchRoles())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		disableClient: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`disableClient <username>`);
			} else {
				const username = args[1];
				brokerClient.disableClient(username)
					.then(() => {
						print(`Client "${username}" disabled!`);
					})
					.then(updateAndDispatchGroups())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		enableClient: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`enableClient <username>`);
			} else {
				const username = args[1];
				brokerClient.enableClient(username)
					.then(() => {
						print(`Client "${username}" enabled!`);
					})
					.then(updateAndDispatchGroups())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		getAnonymousGroup: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`getAnonymousGroup`);
			} else {
				brokerClient.getAnonymousGroup()
					.then((group) => brokerClient.getGroup(group.groupname))
					.then((group) => {
						print(`Name: ${group.groupname}`);
						print(`Description: ${group.textdescription}`);
					})
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		getClient: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`getClient <clientname>`);
			} else {
				const [, clientname] = args;
				brokerClient.getClient(clientname)
					.then((client) => {
						print(
`Name:        ${client.username}
Textname:    ${client.textname}
Description: ${client.textdescription}
Client ID:   ${client.clientid}
Roles:       ${client.roles.map(role => role.rolename).join(', ')}
Groups:      ${client.groups.map(group => group.groupname).join(', ')}
`);
					})
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		getDefaultACLAccess: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`getDefaultACLAccess`);
			} else {
				brokerClient.getDefaultACLAccess()
					.then((defaultAccess) => {
						print(
`${defaultAccess.acls.map(acl => `${acl.acltype}: ${acl.allow}`).join('\n')}`);
					})
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		getGroup: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`getGroup <groupname>`);
			} else {
				const [, groupname] = args;
				brokerClient.getGroup(groupname)
					.then((group) => {print(
`Name:        ${group.groupname}
Textname:    ${group.textname}
Description: ${group.textdescription}
Roles:       ${group.roles.map(role => role.rolename).join(', ')}
Clients:     ${group.clients.map(client => client.username).join(', ')}
`);
					})
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		getRole: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`getRole <rolename>`);
			} else {
				const [, rolename] = args;
				brokerClient.getRole(rolename)
					.then((client) => {
						print(
`Name:        ${client.rolename}
Textname:    ${client.textname}
Description: ${client.textdescription}

************************************************************
ACLs:       
************************************************************
${client.acls.map(acl => `
ACL Type:   ${acl.acltype}
Allow:      ${acl.allow}
Priority:   ${acl.priority}
Topic:      ${acl.topic}
`).join('')}
`);
					})
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		listClients: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`listClients`);
			} else {
				brokerClient.listClients()
					.then((clients) => {
						const message = clients
							.map((client) => `${client.username}\t${client.clientid ? client.clientid : ''}`)
							.join('\n');
						print(message);
					})
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		// listGroupClients: (args, print, runCommand) => {
		// 	brokerClient.listGroupClients(args[1]).then((clients) => {
		// 		if (clients) {
		// 			const message = clients
		// 				.map((client) => `${client.username}\t${client.clientid ? client.clientid : ''}`)
		// 				.join('\n');
		// 			print(message);
		// 		} else {
		// 			print(`No clients found for group "${args[1]}".`);
		// 		}
		// 	});
		// },
		listGroups: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`listGroups`);
			} else {
				brokerClient.listGroups()
					.then((groups) => {
						const message = groups.map((group) => `${group.groupname}`).join('\n');
						print(message);
					})
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		listRoles: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`listRoles`);
			} else {
				brokerClient.listRoles()
					.then((roles) => {
						const message = roles.map((role) => `${role.rolename}`).join('\n');
						print(message);
					})
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		modifyClient: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				// TODO: add support for groups and roles
				print(`modifyClient <username> <password> <clientid> <textname> <textdescription>`);
			} else {
				const [, username, password, clientid, textname, textdescription ] = args;
				brokerClient.modifyClient({ username, password, clientid, textname, textdescription })
					.then(() => {
						print('Done');
					})
					.then(updateAndDispatchClients())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		modifyGroup: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				// TODO: add support for clients and roles
				print(`modifyGroup <groupname> <textname> <textdescription>`);
			} else {
				const [, groupname, textname, textdescription ] = args;
				brokerClient.modifyGroup({ groupname, textname, textdescription })
					.then(() => {
						print('Done');
					})
					.then(updateAndDispatchGroups())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		modifyRole: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`modifyRole <rolename> <textname> <textdescription>`);
			} else {
				const [, rolename, textname, textdescription] = args;
				brokerClient.modifyRole({ rolename, textname, textdescription })
					.then(() => {
						print('Done');
					})
					.then(updateAndDispatchRoles())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		removeGroupClient: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`removeGroupClient <username> <groupname>`);
			} else {
				const [, username, groupname] = args;
				brokerClient
					.removeGroupClient(username, groupname)
					.then(() => {
						print(`Client "${username}" successfully removed from group "${groupname}"!`);
					})
					.then(updateAndDispatchClients())
					.then(updateAndDispatchGroups())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		removeGroupRole: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`removeGroupRole <groupname> <rolename>`);
			} else {
				const [, groupname, rolename] = args;
				brokerClient
					.removeGroupRole(groupname, rolename)
					.then(() => {
						print(`Role "${rolename}" successfully removed from group "${groupname}"!`);
					})
					.then(updateAndDispatchGroups())
					.then(updateAndDispatchRoles())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		removeRoleACL: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`removeRoleACL <rolename> <acltype> <topic>`);
			} else {
				const [, rolename, acltype, topic] = args;
				brokerClient
					.removeRoleACL(rolename, { acltype, topic })
					.then(() => {
						print(`ACL successfully removed from role "${rolename}"!`);
					})
					.then(updateAndDispatchRoles())
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		setAnonymousGroup: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`setAnonymousGroup <groupname>`);
			} else {
				const [, groupname] = args;
				brokerClient.setAnonymousGroup(groupname)
					.then(() => {
						print('Done');
					})
					.then(() => brokerClient.getAnonymousGroup())
					.then((group) => dispatch(updateAnonymousGroup(group)))
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		},
		setDefaultACLAccess: (args, print, runCommand) => {
			if (isHelpParameter(args[1])) {
				print(`setDefaultACLAccess <acltype> true|false`);
			} else {
				const [, acltype, allow] = args;
				brokerClient
					.setDefaultACLAccess([{ acltype, allow: allow === 'true' ? true : false }])
					.then(() => {
						brokerClient.getDefaultACLAccess()
						.then((defaultAccess) => {
							dispatch(updateDefaultACLAccess(defaultACLAccess));
							print(
`${defaultAccess.acls.map(acl => `${acl.acltype}: ${acl.allow}`).join('\n')}`);
						})
						.catch((error) => {
							print(toErrorMessage(error));
						});
					})
			}
		}
	}
	
	return (
		<Terminal
			startState="maximised"
			className={classes.terminal}
			showActions={false}
			hideTopBar={true}
			allowTabs={false}
			prompt={darkMode === 'true' ? 'yellow' : 'darkgrey'}
			color={darkMode === 'true' ? 'yellow' : 'darkgrey'}
			style={{ fontWeight: 'light', fontSize: '1.25em', width: '100%' }}
			backgroundColor={darkMode === 'true' ? 'black' : 'white'}
			barColor="black"
			outputColor={darkMode === 'true' ? 'yellow' : 'grey'}
			commands={commands}
			descriptions={{
				addGroupClient: 'Add a client to a group',
				addGroupRole: 'Add a role to a group',
				addRoleACL: 'Add ACL to role',
				createClient: 'Create a new client',
				createGroup: 'Create a new group',
				createRole: 'Create a new role',
				deleteClient: 'Delete a client',
				deleteGroup: 'Delete a client',
				deleteRole: 'Delete a role',
				disableClient: 'Disable a client',
				enableClient: 'Enable a client',
				getAnonymousGroup: 'Get anonymous group',
				getClient: 'Get the details for a client',
				getDefaultACLAccess: 'Get the default ACL access',
				getGroup: 'Get the details for a group',
				getRole: 'Get the details for a role',
				listClients: 'List all clients',
				listGroups: 'List all groups',
				listRoles: 'List all roles',
				modifyClient: 'Modify a client',
				modifyGroup: 'Modify a group',
				modifyRole: 'Modify a role',
				removeGroupClient: 'Remove a client from a group',
				removeGroupRole: 'Remove a role from a group',
				removeRoleACL: 'Remove an ACL from a role',
				setAnonymousGroup: 'Set anonymous group',
				setDefaultACLAccess: 'Set the default ACL access'
			}}

			msg={message}
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
