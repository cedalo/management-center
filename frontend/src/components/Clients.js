import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import { updateClient, updateClients, updateGroups } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@mui/icons-material/Add';
import { Alert, AlertTitle } from '@mui/material';
import AutoSuggest from './AutoSuggest';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ClientIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
// import Fab from '@mui/material/Fab';
import GroupIcon from '@mui/icons-material/Group';
import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';

const PREFIX = 'Clients';

const classes = {
    root: `${PREFIX}-root`,
    tableContainer: `${PREFIX}-tableContainer`,
    badges: `${PREFIX}-badges`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.tableContainer}`]: {
		minHeight: '500px',
		'& td:nth-child(2)': {
			minWidth: '100px'
		}
	},

    [`& .${classes.badges}`]: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},

    // fab: {
    // 	position: 'absolute',
    // 	bottom: theme.spacing(2),
    // 	right: theme.spacing(2)
    // },
    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,

    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

const StyledTableRow = TableRow;

const clientShape = PropTypes.shape({
	username: PropTypes.string,
	//   lastName: PropTypes.string,
	//   firstName: PropTypes.string,
	groups: PropTypes.array
});

const USER_TABLE_COLUMNS = [
	{ id: 'username', key: 'Username' },
	{ id: 'clientid', key: 'Client ID' },
	{ id: 'textname', key: 'Text name' },
	{ id: 'textdescription', key: 'Description' },
	{ id: 'groups', key: 'Groups' },
	{ id: 'roles', key: 'Client Roles' }
];

const FormattedClientType = (props) => {
	switch (props.provider) {
		case 'local':
			return 'Local';
		default:
			return props.provider || '';
	}
};

const Clients = (props) => {

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;

	const onUpdateClientGroups = async (client, groups = []) => {
		if (!groups) {
			groups = [];
		}
		if (groups.length === 0) {
			await confirm({
				title: 'Confirm remove client from all groups',
				description: `Do you really want to remove client "${client.username}" from all groups?`,
				cancellationButtonProps: {
					variant: 'contained'
				},
				confirmationButtonProps: {
					color: 'primary',
					variant: 'contained'
				}
			});
		}
		const groupnames = groups.map((group) => group.value);
		await brokerClient.updateClientGroups(client, groupnames);
		const clients = await brokerClient.listClients();
		dispatch(updateClients(clients));
		const groupsUpdated = await brokerClient.listGroups();
		dispatch(updateGroups(groupsUpdated));
	};

	const onUpdateClientRoles = async (client, roles = []) => {
		if (!roles) {
			roles = [];
		}
		const rolenames = roles.map((role) => role.value);
		await brokerClient.updateClientRoles(client, rolenames);
		const clients = await brokerClient.listClients();
		dispatch(updateClients(clients));
	};

	const onSelectClient = async (username) => {
		const client = await brokerClient.getClient(username);
		dispatch(updateClient(client));
		history.push(`/security/clients/detail/${username}`);
	};

	const onNewClient = () => {
		history.push('/security/clients/new');
	};

	const onEditClient = async (username) => {
		const client = await brokerClient.getClient(username);
		dispatch(updateClient(client));
		history.push(`/security/clients/detail/${username}/?action=edit`);
	};

	const onDeleteClient = async (username) => {
		await confirm({
			title: 'Confirm client deletion',
			description: `Do you really want to delete client "${username}"?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		if (username === 'cedalo') {
			await confirm({
				title: 'Confirm default client deletion',
				description: `Are you sure? You are about to delete the default client for the current Mosquitto instance.`,
				cancellationButtonProps: {
					variant: 'contained'
				},
				confirmationButtonProps: {
					color: 'primary',
					variant: 'contained'
				}
			});
		}
		await brokerClient.deleteClient(username);
		enqueueSnackbar(`Client "${username}" successfully deleted`, {
			variant: 'success'
		});
		const clients = await brokerClient.listClients();
		dispatch(updateClients(clients));
		const groups = await brokerClient.listGroups();
		dispatch(updateGroups(groups));
	};

	const onDisableClient = async (username) => {
		await confirm({
			title: 'Confirm client disable',
			description: `Do you really want to disable client "${username}"?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		await brokerClient.disableClient(username);
		const clients = await brokerClient.listClients();
		enqueueSnackbar('Client successfully disabled', {
			variant: 'success'
		});
		dispatch(updateClients(clients));
	};

	const onEnableClient = async (username) => {
		await brokerClient.enableClient(username);
		const clients = await brokerClient.listClients();
		enqueueSnackbar('Client successfully enabled', {
			variant: 'success'
		});
		dispatch(updateClients(clients));
	};

	const onRemoveClientFromGroup = async (client, group) => {
		await confirm({
			title: 'Remove client from group',
			description: `Do you really want to remove client "${client.username}" from group "${group}"?`
		});
		await client.removeGroupClient(client, group);
		const clients = await client.listClients();
		dispatch(updateClients(clients));
	};

	const { dynamicsecurityFeature, connectionID, defaultClient, groups = [], roles = [], clients = [], onSort, sortBy, sortDirection } = props;

	const groupSuggestions = groups
		.map((group) => group.groupname)
		.sort()
		.map((groupname) => ({
			label: groupname,
			value: groupname
		}));

	const roleSuggestions = roles
		.map((role) => role.rolename)
		.sort()
		.map((rolename) => ({
			label: rolename,
			value: rolename
		}));

	return (
        <Root>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} color="inherit" to="/security">
					Security
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Clients
				</Typography>
			</Breadcrumbs>
			{/* TODO: Quick hack to detect whether feature is supported */}
			{dynamicsecurityFeature?.supported === false ? <><br/><Alert severity="warning">
				<AlertTitle>Feature not available</AlertTitle>
				Make sure that the broker connected has the dynamic security enabled.
			</Alert></> : null}
			<br />
			{dynamicsecurityFeature?.supported !== false && <><Button
                variant="outlined"
                size="small"
                className={classes.button}
                startIcon={<AddIcon />}
                onClick={(event) => {
					event.stopPropagation();
					onNewClient();
				}}>
				New Client
			</Button>
			<br />
			<br />
			</>}
			
			{dynamicsecurityFeature?.supported !== false && clients && clients.length > 0 ? (
				<div>
					<Hidden smDown implementation="css">
						<TableContainer component={Paper} className={classes.tableContainer}>
							<Table size="medium">
								<TableHead>
									<TableRow>
										{USER_TABLE_COLUMNS.map((column) => (
											<TableCell
												key={column.id}
												sortDirection={sortBy === column.id ? sortDirection : false}
											>
												{/* <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortDirection}
                      onClick={() => onSort(column.id)}
                    > */}
												{column.key}
												{/* </TableSortLabel> */}
											</TableCell>
										))}
										<TableCell />
									</TableRow>
								</TableHead>
								<TableBody>
									{clients &&
										clients.map((client) => (
											<StyledTableRow
                                                hover
                                                key={client.username}
                                                onClick={(event) => {
													if (
														event.target.nodeName?.toLowerCase() === 'td' ||
														defaultClient?.username === client.username
													) {
														onSelectClient(client.username);
													}
												}}
                                                style={{ cursor: 'pointer' }}
                                                classes={{
                                                    root: classes.root
                                                }}>
												<TableCell>{client.username}</TableCell>
												<TableCell>{client.clientid}</TableCell>
												<TableCell>{client.textname}</TableCell>
												<TableCell>{client.textdescription}</TableCell>
												<TableCell className={classes.badges}>
													<AutoSuggest
														disabled={defaultClient?.username === client.username}
														suggestions={groupSuggestions}
														values={client.groups.map((group) => ({
															label: group.groupname,
															value: group.groupname
														}))}
														handleChange={(value) => {
															onUpdateClientGroups(client, value);
														}}
													/>
												</TableCell>
												<TableCell className={classes.badges}>
													<AutoSuggest
														disabled={defaultClient?.username === client.username}
														suggestions={roleSuggestions}
														values={client.roles.map((role) => ({
															label: role.rolename,
															value: role.rolename
														}))}
														handleChange={(value) => {
															onUpdateClientRoles(client, value);
														}}
													/>
												</TableCell>
												<TableCell align="right">
													{/* <IconButton
						  size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEditClient(client.username);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton> */}

													<Tooltip title="Delete client">
														<IconButton
															disabled={defaultClient?.username === client.username}
															size="small"
															onClick={(event) => {
																event.stopPropagation();
																onDeleteClient(client.username);
															}}
														>
															<DeleteIcon fontSize="small" />
														</IconButton>
													</Tooltip>
													<Tooltip title="Enable / disable client">
														<Switch
															disabled={defaultClient?.username === client.username}
															checked={
																typeof client.disabled === 'undefined' ||
																client.disabled === false
															}
															onClick={(event) => {
																event.stopPropagation();
																if (event.target.checked) {
																	onEnableClient(client.username);
																} else {
																	onDisableClient(client.username);
																}
															}}
														/>
													</Tooltip>
												</TableCell>
											</StyledTableRow>
										))}
								</TableBody>
							</Table>
						</TableContainer>
					</Hidden>
					<Hidden smUp implementation="css">
						<Paper>
							<List className={classes.root}>
								{clients.map((client) => (
									<React.Fragment>
										<ListItem
											alignItems="flex-start"
											onClick={(event) => onSelectClient(client.username)}
										>
											<ListItemText
												primary={<span>{client.username}</span>}
												secondary={
													<React.Fragment>
														<Typography
															component="span"
															variant="body2"
															className={classes.inline}
															color="textPrimary"
														>
															{client.textname}
														</Typography>
														<span> — {client.textdescription} </span>

														{/* <div className={classes.badges}>
                        {client.groups.map((group) => (
                          <Chip
                            // icon={<FaceIcon />}
                            size="small"
                            label={group}
                            onDelete={(event) => {
                              event.stopPropagation();
                              onRemoveClientFromGroup(client, group);
                            }}
                            color="secondary"
                          />
                        ))}
                      </div> */}
													</React.Fragment>
												}
											/>
											<ListItemSecondaryAction>
												<IconButton
													edge="end"
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														onSelectClient(client.username);
													}}
													aria-label="edit"
												>
													<EditIcon fontSize="small" />
												</IconButton>

												<IconButton
													edge="end"
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														onDeleteClient(client.username);
													}}
													aria-label="delete"
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</ListItemSecondaryAction>
										</ListItem>
										<Divider />
									</React.Fragment>
								))}
							</List>
						</Paper>
					</Hidden>
				</div>
			) : (
				<div>No clients found</div>
			)}
			{/* <Fab
				color="primary"
				aria-label="add"
				className={classes.fab}
				onClick={(event) => {
					event.stopPropagation();
					onNewClient();
				}}
			>
				<AddIcon />
			</Fab> */}
		</Root>
    );
};

Clients.propTypes = {
	clients: PropTypes.arrayOf(clientShape).isRequired,
	sortBy: PropTypes.string,
	sortDirection: PropTypes.string,
	onSelectClient: PropTypes.func.isRequired,
	onSort: PropTypes.func.isRequired
};

Clients.defaultProps = {
	sortBy: undefined,
	sortDirection: undefined
};

const mapStateToProps = (state) => {
	return {
		groups: state.groups?.groups,
		roles: state.roles?.roles,
		clients: state.clients?.clients,
		defaultClient: state.brokerConnections?.defaultClient,
		dynamicsecurityFeature: state.systemStatus?.features?.dynamicsecurity
	};
};

export default connect(mapStateToProps)(Clients);
