import {makeStyles, useTheme} from '@material-ui/core/styles';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import Terminal from 'terminal-in-react';
import {updateAnonymousGroup, updateClients, updateDefaultACLAccess, updateGroups} from '../actions/actions';
import useLocalStorage from '../helpers/useLocalStorage';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBox from './ContainerBox';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';


const useStyles = makeStyles((theme) => ({
	terminal: {
		fontWeight: 'bold',
		fontSize: '2em',
		minHeight: '100%',
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
}));

const isHelpParameter = (parameter) => parameter === '--help';
const toErrorMessage = (error) => `⚠️ ${error.message ? error.message : error}`;

const Plugins = (props) => {
	const dispatch = useDispatch();
	const [darkMode, setDarkMode] = useLocalStorage('cedalo.managementcenter.darkMode');
	const theme = useTheme();
	const context = useContext(WebSocketContext);
	const {client: brokerClient} = context;
	const classes = useStyles();

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
					.addRoleACL(rolename, {acltype, priority: parsedPriority, topic, allow})
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
					.then((group) => {
						print(
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
						const message = clients?.clients
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
						const message = groups?.groups.map((group) => `${group.groupname}`).join('\n');
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
						const message = roles?.roles.map((role) => `${role.rolename}`).join('\n');
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
				const [, username, password, clientid, textname, textdescription] = args;
				brokerClient.modifyClient({username, password, clientid, textname, textdescription})
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
				const [, groupname, textname, textdescription] = args;
				brokerClient.modifyGroup({groupname, textname, textdescription})
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
				brokerClient.modifyRole({rolename, textname, textdescription})
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
					.removeRoleACL(rolename, {acltype, topic})
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
					.setDefaultACLAccess([{acltype, allow: allow === 'true' ? true : false}])
					.then(() => {
						brokerClient.getDefaultACLAccess()
							.then((defaultAccess) => {
								dispatch(updateDefaultACLAccess(defaultAccess));
								print(
									`${defaultAccess.acls.map(acl => `${acl.acltype}: ${acl.allow}`).join('\n')}`);
							})
							.catch((error) => {
								print(toErrorMessage(error));
							});
					})
					.catch((error) => {
						print(toErrorMessage(error));
					});
			}
		}
	}

	return (
		<ContentContainer
			dataTour="page-terminal"
			breadCrumbs={<ContainerBreadCrumbs title="Terminal" links={[{name: 'Home', route: '/home'}]}/>}
		>
			<ContainerHeader
				title="Terminal"
				subTitle="The terminal window allows you to execute commands on the current connection. Type 'help' for a list of available commands and type '<command> --help' for information on a specific command."
			/>

			<Terminal
				startState="maximised"
				// className={classes.terminal}
				showActions={false}
				hideTopBar={true}
				allowTabs={false}
				prompt={darkMode === 'true' ? '#FD602E' : 'black'}
				color={darkMode === 'true' ? 'white' : 'black'}
				style={{fontWeight: 'light', fontSize: '1.25em', width: '100%', border: '1px solid'}}
				backgroundColor={darkMode === 'true' ? 'black' : 'white'}
				barColor="black"
				outputColor={darkMode === 'true' ? 'white' : 'black'}
				commands={commands}
				descriptions={{
					addGroupClient: 'Add a client to a group',
					addGroupRole: 'Add a role to a group',
					addRoleACL: 'Add ACL to role',
					clear: 'Clear the Screen',
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
					setDefaultACLAccess: 'Set the default ACL access',
					show: false
				}}
			/>
		</ContentContainer>
	);
};

const mapStateToProps = (state) => {
	return {
		license: state.license?.license,
		version: state.version?.version
	};
};

export default connect(mapStateToProps)(Plugins);
