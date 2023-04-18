import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
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
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import ReloadIcon from '@material-ui/icons/Replay';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateClient, updateClients, updateGroups} from '../actions/actions';
import {isAdminClient} from '../helpers/utils';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
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
			// minWidth: '100px'
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
	{id: 'name', key: 'Name', width: '10%'},
	{id: 'clientid', key: 'ID', width: '10%'},
	{id: 'textname', key: 'Text Name', width: '10%'},
	{id: 'textdescription', key: 'Description', width: '15%'},
	{id: 'groups', key: 'Groups', width: '20%'},
	{id: 'roles', key: 'Roles', width: '20%'},
	{id: 'actions', key: 'Actions', width: '5%'}
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
	const small = useMediaQuery(theme => theme.breakpoints.down('xs'));
	const medium = useMediaQuery(theme => theme.breakpoints.between('sm', 'sm'));
	const [roleSuggestions, setRoleSuggestions] = useState([]);
	const [roles, setRoles] = useState([]);

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
				description: `Do you really want to remove client "${client.username}" from all groups?`
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
		if (roles.length === 0) {
			await confirm({
				title: 'Remove all roles from client',
				description: `Do you really want to remove all roles from client "${client.username}"?`
			});
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
			description: `Do you really want to delete client "${username}"?`
		});
		if (username === 'cedalo') {
			await confirm({
				title: 'Confirm default client deletion',
				description: `Are you sure? You are about to delete the default client for the current Mosquitto instance.`
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
			description: `Do you really want to disable client "${username}"?`
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
		isAdminClient,
		connectionID,
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

	React.useEffect(() => {
		const suggestions = rolesAll
			.sort()
			.map((rolename) => ({
				label: rolename,
				value: rolename
			}));
		setRoleSuggestions(suggestions);
	}, [clients]);

	const groupSuggestions = groupsAll
		.sort()
		.map((groupname) => ({
			label: groupname,
			value: groupname
		}));


	const getClassForCell = (client) => `${isAdminClient(client) ? classes.disabled : ''}`;

	return (
		<ContentContainer
			dataTour="page-clients"
			breadCrumbs={<ContainerBreadCrumbs title="Clients" links={[{name: 'Home', route: '/home'}]}/>}
		>
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
						startIcon={<ReloadIcon/>}
						onClick={(event) => {
							event.stopPropagation();
							onReload();
						}}
					/>
				]}
			</ContainerHeader>
			{dynamicsecurityFeature?.supported !== false && clients?.clients?.length > 0 ? (
					<TableContainer>
						<Table stickyHeader size="small" aria-label="sticky table">
							<TableHead>
								<TableRow>
									{USER_TABLE_COLUMNS.map((column) => (
										<TableCell
											key={column.id}
											style={{
												width: column.width,
												display: (!small && !medium) ||
												(column.id === 'name' && (small || medium)) ||
												(column.id === 'groups' && (small || medium)) ||
												(column.id === 'action' && (small || medium)) ||
												(column.id === 'roles' && medium) ? undefined : 'none'
											}}
											sortDirection={sortBy === column.id ? sortDirection : false}
										>
											{column.key}
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{clients &&
									clients.clients.map((client) => (
										<Tooltip
											enterDelay={0}
											disableHoverListener={!isAdminClient(client)}
											disableFocusListener={!isAdminClient(client)}
											disableTouchListener={!isAdminClient(client)}
											title={<span style={{fontSize: '13px'}}>User used for connection cannot be edited</span>}
										>
											<StyledTableRow
												hover
												key={client.username}
												onClick={(event) => {
													if (
														event.target.nodeName?.toLowerCase() === 'td' ||
														isAdminClient(client)
													) {
														onSelectClient(client.username);
													}
												}}
												style={{cursor: 'pointer'}}
											>
												<TableCell className={getClassForCell(
													client)}>{client.username}</TableCell>
												{small || medium ? null : [
													<TableCell className={getClassForCell(
														client)}>{client.clientid}</TableCell>,
													<TableCell className={getClassForCell(
														client)}>{client.textname}</TableCell>,
													<TableCell className={getClassForCell(
														client)}>{client.textdescription}</TableCell>
												]}
												<TableCell className={`${classes.badges} ${getClassForCell(
													client)}`}>
													<SelectList
														values={client.groups}
														getValue={value => value.groupname}
														onChange={(event, value) => {
															onUpdateClientGroups(client, value);
														}}
														disabled={isAdminClient(client)}
														suggestions={groupSuggestions}
													/>
												</TableCell>
												{small ? null :
													<TableCell className={`${classes.badges} ${getClassForCell(
														client)}`}>
														<SelectList
															values={client.roles}
															getValue={value => value.rolename}
															onChange={(event, value) => {
																onUpdateClientRoles(client, value);
															}}
															disabled={isAdminClient(client)}
															suggestions={roleSuggestions}
														/>
													</TableCell>
												}
												{small || medium ? null :
													<TableCell style={{padding: '0px'}} align="center">
														<Tooltip title="Enable / disable client">
															<Checkbox
																color="primary"
																disabled={isAdminClient(client)}
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
																inputProps={{'aria-label': 'Enable plugin at next startup'}}
															/>
														</Tooltip>
														<Tooltip title="Delete client">
															<IconButton
																disabled={isAdminClient(client)}
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
												}
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
			) : (
				props.connected ? <div>No clients found</div> : null
			)}
		</ContentContainer>
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
		dynamicsecurityFeature: state.systemStatus?.features?.dynamicsecurity,
		connected: state.brokerConnections?.connected,
		isAdminClient: isAdminClient(state)
	};
};

export default connect(mapStateToProps)(Clients);
