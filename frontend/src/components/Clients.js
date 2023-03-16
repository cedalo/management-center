import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import ReloadIcon from '@material-ui/icons/Replay';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateClient, updateClients, updateGroups} from '../actions/actions';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import SelectList from './SelectList';

const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.tables?.odd
		}
	}
}))(TableRow);

const useStyles = makeStyles((theme) => ({
	tableContainer: {
		minHeight: '500px',
		'& td:nth-child(2)': {
			minWidth: '100px'
		}
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
	disabled: {
		opacity: '45%',
	},
}));

const clientShape = PropTypes.shape({
	username: PropTypes.string,
	//   lastName: PropTypes.string,
	//   firstName: PropTypes.string,
	groups: PropTypes.array
});

const USER_TABLE_COLUMNS = [
	{id: 'username', key: 'Name'},
	{id: 'clientid', key: 'ID'},
	{id: 'textname', key: 'Text Name'},
	{id: 'textdescription', key: 'Description'},
	{id: 'groups', key: 'Groups'},
	{id: 'roles', key: 'Roles'},
	{id: 'actions', key: ' '}
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
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const {enqueueSnackbar} = useSnackbar();
	const {client: brokerClient} = context;

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const handleChangePage = async (event, newPage) => {
		setPage(newPage);
		const count = rowsPerPage;
		const offset = newPage * count;
		const clients = await brokerClient.listClients(true, count, offset);
		dispatch(updateClients(clients));
	};

	const handleChangeRowsPerPage = async (event) => {
		const rowsPerPage = parseInt(event.target.value, 10);
		setRowsPerPage(rowsPerPage);
		setPage(0);
		const clients = await brokerClient.listClients(true, rowsPerPage, 0);
		dispatch(updateClients(clients));
	};

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
		const clients = await brokerClient.listClients(true, rowsPerPage, page * rowsPerPage);
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
		const clients = await brokerClient.listClients(true, rowsPerPage, page * rowsPerPage);
		dispatch(updateClients(clients));
	};

	const onReload = async () => {
		const clients = await brokerClient.listClients(true, rowsPerPage, page * rowsPerPage);
		dispatch(updateClients(clients));
	}

	const onSelectClient = async (username) => {
		const client = await brokerClient.getClient(username);
		dispatch(updateClient(client));
		history.push(`/clients/${username}`);
	};

	const onNewClient = () => {
		history.push('/clients/new');
	};

	const onEditClient = async (username) => {
		const client = await brokerClient.getClient(username);
		dispatch(updateClient(client));
		history.push(`/clients/${username}/?action=edit`);
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
		const clients = await brokerClient.listClients(true, rowsPerPage, page * rowsPerPage);
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
		const clients = await brokerClient.listClients(true, rowsPerPage, page * rowsPerPage);
		enqueueSnackbar('Client successfully disabled', {
			variant: 'success'
		});
		dispatch(updateClients(clients));
	};

	const onEnableClient = async (username) => {
		await brokerClient.enableClient(username);
		const clients = await brokerClient.listClients(true, rowsPerPage, page * rowsPerPage);
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
		const clients = await brokerClient.listClients(true, rowsPerPage, page * rowsPerPage);
		dispatch(updateClients(clients));
	};

	const {
		dynamicsecurityFeature,
		connectionID,
		defaultClient,
		groupsAll = [],
		rolesAll = [],
		clients = [],
		onSort,
		sortBy,
		sortDirection,
		filter
	} = props;

	React.useEffect(() => {
		// setFilteredClients(clients.filter(clientL => clientL.username.startsWith(filter)));
	}, [filter]);

	const groupSuggestions = groupsAll
		.sort()
		.map((groupname) => ({
			label: groupname,
			value: groupname
		}));

	const roleSuggestions = rolesAll
		.sort()
		.map((rolename) => ({
			label: rolename,
			value: rolename
		}));


	const getClassForCell = (client) => {
		return `${(defaultClient?.username === client.username) ? classes.disabled : ''}`;
	}

	return (
		<div style={{height: '100%'}}>
			<ContainerBreadCrumbs title="Clients" links={[{name: 'Home', route: '/home'}]}/>
			<div style={{height: 'calc(100% - 26px)'}}>
				<div style={{display: 'grid', gridTemplateRows: 'max-content auto', height: '100%'}}>
					<ContainerHeader
						title="Clients"
						subTitle="List of existing clients. A client is any device that connects to a broker and sends or
						receives messages. Add a client by clicking on the button to the right or modify it by
								clicking on one of the existing clients."
						connectedWarning={!props.connected}
						brokerFeatureWarning={dynamicsecurityFeature?.supported === false ? "dynamic security" : null}
					>
						{dynamicsecurityFeature?.supported !== false && [
							<Button
								variant="outlined"
								color="primary"
								size="small"
								className={classes.button}
								style={{marginRight: '10px'}}
								startIcon={<AddIcon/>}
								onClick={(event) => {
									event.stopPropagation();
									onNewClient();
								}}
							>
								New Client
							</Button>,
							<Button
								variant="outlined"
								color="primary"
								size="small"
								style={{paddingRight: '0px', minWidth: '30px'}}
								startIcon={<ReloadIcon />}
								onClick={(event) => {
									event.stopPropagation();
									onReload();
								}}
							/>
						]}
					</ContainerHeader>
					{dynamicsecurityFeature?.supported !== false && clients?.clients?.length > 0 ? (
						<div style={{height: '100%', overflowY: 'auto'}}>
							<Hidden xsDown implementation="css">
								<TableContainer>
									<Table stickyHeader size="small" aria-label="sticky table">
										<TableHead>
											<TableRow>
												{USER_TABLE_COLUMNS.map((column) => (
													<TableCell
														key={column.id}
														sortDirection={sortBy === column.id ? sortDirection : false}
													>
														{column.key}
													</TableCell>
												))}
												<TableCell/>
											</TableRow>
										</TableHead>
										<TableBody>
											{clients &&
												clients.clients.map((client) => (
													<Tooltip
														enterDelay={0}
														disableHoverListener={defaultClient?.username !== client.username}
														disableFocusListener={defaultClient?.username !== client.username}
														disableTouchListener={defaultClient?.username !== client.username}
														title={<span style={{fontSize: '13px'}}>User used for connection cannot be edited</span>}
													>
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
															style={{cursor: 'pointer'}}
														>
															<TableCell className={getClassForCell(
																client)}>{client.username}</TableCell>
															<TableCell className={getClassForCell(
																client)}>{client.clientid}</TableCell>
															<TableCell className={getClassForCell(
																client)}>{client.textname}</TableCell>
															<TableCell className={getClassForCell(
																client)}>{client.textdescription}</TableCell>
															<TableCell className={`${classes.badges} ${getClassForCell(
																client)}`}>
																<SelectList
																	values={client.groups}
																	getValue={value => value.groupname}
																	onChange={(event, value) => {
																		onUpdateClientGroups(client, value);
																	}}
																	disabled={defaultClient?.username === client.username}
																	suggestions={groupSuggestions}
																/>
															</TableCell>
															<TableCell className={`${classes.badges} ${getClassForCell(
																client)}`}>
																<SelectList
																	values={client.roles}
																	getValue={value => value.rolename}
																	onChange={(event, value) => {
																		onUpdateClientRoles(client, value);
																	}}
																	disabled={defaultClient?.username === client.username}
																	suggestions={roleSuggestions}
																/>
															</TableCell>
															<TableCell style={{padding: '0px', width: '20px'}}>
																<Tooltip title="Delete client">
																	<IconButton
																		disabled={defaultClient?.username === client.username}
																		size="small"
																		onClick={(event) => {
																			event.stopPropagation();
																			onDeleteClient(client.username);
																		}}
																	>
																		<DeleteIcon fontSize="small"/>
																	</IconButton>
																</Tooltip>
															</TableCell>
															<TableCell style={{padding: '0px', width: '20px'}}>
																<Tooltip title="Enable / disable client">
																	<Checkbox
																		color="primary"
																		disabled={defaultClient?.username === client.username}
																		checked={
																			typeof client.disabled === 'undefined' ||
																			client.disabled === false
																		}
																		onChange={(event) => {
																			event.stopPropagation();
																			if (event.target.checked) {
																				onEnableClient(client.username);
																			} else {
																				onDisableClient(client.username);
																			}
																		}}
																		inputProps={{ 'aria-label': 'Enable plugin at next startup'}}
																	/>
																</Tooltip>
															</TableCell>
														</StyledTableRow>
													</Tooltip>
												))}
										</TableBody>
										<TableFooter>
											<TableRow>
												<TablePagination
													rowsPerPageOptions={[5, 10, 25]}
													colSpan={8}
													count={clients?.totalCount}
													rowsPerPage={rowsPerPage}
													page={page}
													onChangePage={handleChangePage}
													onChangeRowsPerPage={handleChangeRowsPerPage}
												/>
											</TableRow>
										</TableFooter>
									</Table>
								</TableContainer>
							</Hidden>
							<Hidden smUp implementation="css">
								<Paper>
									<List className={classes.root}>
										{clients.clients.map((client) => (
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
															<EditIcon fontSize="small"/>
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
															<DeleteIcon fontSize="small"/>
														</IconButton>
													</ListItemSecondaryAction>
												</ListItem>
												<Divider/>
											</React.Fragment>
										))}
									</List>
								</Paper>
							</Hidden>
						</div>
					) : (
						props.connected ? <div>No clients found</div> : null
					)}
				</div>
			</div>
		</div>
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
		groups: state.groups?.groups?.groups,
		groupsAll: state.groups?.groupsAll?.groups,
		roles: state.roles?.roles?.roles,
		rolesAll: state.roles?.rolesAll?.roles,
		clients: state.clients?.clients,
		defaultClient: state.brokerConnections?.defaultClient,
		dynamicsecurityFeature: state.systemStatus?.features?.dynamicsecurity,
		connected: state.brokerConnections?.connected,
	};
};

export default connect(mapStateToProps)(Clients);
