import Button from '@material-ui/core/Button';
import {green, red} from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import {makeStyles, useTheme, withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import DisabledIcon from '@material-ui/icons/Cancel';
import CancelIcon from '@material-ui/icons/CancelOutlined';
import EnabledIcon from '@material-ui/icons/CheckCircle';
import ReloadIcon from '@material-ui/icons/Replay';
import {useSnackbar} from 'notistack';
import React, {useContext, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import ContainerBreadCrumbs from '../../../components/ContainerBreadCrumbs';
import ContainerHeader from '../../../components/ContainerHeader';
import ContentContainer from '../../../components/ContentContainer';
import {WebSocketContext} from '../../../websockets/WebSocket';
import {updateInspectClient, updateInspectClients} from '../actions/actions';


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
	}
}));

const CLIENTS_TABLE_COLUMNS = [
	{id: 'username', key: 'Name', align: 'left', width: '15%', sortable: true},
	{id: 'clientid', key: 'Client ID', align: 'left', width: '20%', sortable: true},
	{id: 'protocol', key: 'Protocol', align: 'left', width: '15%', sortable: false},
	{id: 'address', key: 'IP Address', align: 'left', width: '15%', sortable: true},
	{id: 'messagesOut', key: 'Queue Usage', align: 'center', width: '15%', sortable: true},
	{id: 'connected', key: 'Connected', align: 'center', width: '5%', sortable: true},
	{id: 'disconnect', key: 'Disconnect', align: 'center', width: '5%', sortable: false},
];


const unixTimestampToDate = (unixTimestamp) => {
	if (!unixTimestamp) return unixTimestamp;
	unixTimestamp = parseInt((unixTimestamp + '').slice(0, 10));
	return new Date(unixTimestamp * 1000);
};

const dateToString = (date, separator = ' ') => {
	if (!date) return date;
	return date.getFullYear() + '-'
		+ ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + '-'
		+ (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + separator
		+ (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
		+ (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
		+ (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
};


const createClientsTable = (clients, classes, props, onDisconnectClient, onUpdateUserRoles,
							onSelectClient, small, medium, clientControlFeature) => {
	const {inspectFeature, onSort, sortBy, sortDirection, disableSort, doSort} = props;


	if (!inspectFeature?.error && inspectFeature?.supported !== false && clients && clients.length > 0) {
		return <div style={{height: '100%', overflowY: 'auto'}}>
			<TableContainer style={{maxHeight: '100%'}}>
				<Table stickyHeader size="small" aria-label="sticky table">
					<TableHead>
						<TableRow>
							{CLIENTS_TABLE_COLUMNS.map((column) => (
								<TableCell
									align={column.align}
									style={{
										width: column.width,
										display: (!small && !medium) ||
										(column.id === 'username' && (small || medium)) ||
										(column.id === 'status' && (small || medium)) ||
										(column.id === 'clientid' && medium) ? (
												(column.id === 'disconnect' && (clientControlFeature?.error || !clientControlFeature?.supported)) ? 'none' : undefined)
											: 'none'
									}}
									key={column.id}
									sortDirection={sortBy === column.id ? sortDirection : false}
								>
									{column.sortable ?
										<TableSortLabel
											active={sortBy === column.id}
											direction={sortDirection}
											onClick={() => onSort(column.id)}
										>
											{column.key}
										</TableSortLabel> :
										column.key
									}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{clients &&
							clients.map((client, index) => (
								<StyledTableRow
									// hover
									// key={client.username}
									onClick={(event) => {
										onSelectClient(client.username);
									}}
									// style={{cursor: 'pointer'}}
									key={`filter${String(Math.random())}`}
								>
									<TableCell align={CLIENTS_TABLE_COLUMNS[0].align}>{client.username}</TableCell>
									{small ? null :
										<TableCell align={CLIENTS_TABLE_COLUMNS[1].align}>{client.clientid}</TableCell>
									}
									{small || medium ? null : [
										<TableCell
											align={CLIENTS_TABLE_COLUMNS[2].align}>{`${client.protocol} ${client.protocolVersion}`}
										</TableCell>,
										<TableCell align={CLIENTS_TABLE_COLUMNS[3].align}>{client.address}</TableCell>,
										<TableCell align={CLIENTS_TABLE_COLUMNS[4].align}>
											{client.queues?.messagesOut === undefined ? '' : `${client.queues?.messagesOut} / ${client.queues?.messagesMax}`}
										</TableCell>
									]}
									{/*<TableCell>{dateToString(unixTimestampToDate(client.lastConnect))}</TableCell>*/}
									{/*<TableCell>{dateToString(unixTimestampToDate(client.lastDisconnect))}</TableCell>*/}
									<TableCell align={CLIENTS_TABLE_COLUMNS[5].align}>
										<Tooltip title={
											<>
												{
													client.lastConnect ? [
														<span>Last Connected: {dateToString(
															unixTimestampToDate(client.lastConnect))}</span>,
														<br/>
													] : null
												}
												{
													client.lastDisconnect ?
														<span>Last Disconnected: {dateToString(unixTimestampToDate(
															client.lastDisconnect))}</span> : null
												}
											</>
										}>
											{client.connected ?
												<EnabledIcon fontSize="small" style={{color: green[500]}}/>
												:
												<DisabledIcon fontSize="small" style={{color: red[500]}}/>
											}
										</Tooltip>
									</TableCell>
									{small || medium || (clientControlFeature?.error || !clientControlFeature?.supported) ? null :
										<TableCell align={CLIENTS_TABLE_COLUMNS[6].align}>
											{client.connected ?
												<Tooltip title="Click to disconnect client">
													<IconButton
														size="small"
														onClick={async (event) => {
															event.stopPropagation();
															await onDisconnectClient(client);
														}}
														aria-label="delete"
													>
														<CancelIcon/>
													</IconButton>
												</Tooltip>
												:
												null
											}
										</TableCell>
									}
								</StyledTableRow>
							))}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	} else if (inspectFeature?.error) {
		return null;
	} else {
		return <div>No clients connected</div>
	}
}

const Clients = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const {client: brokerClient} = context;
	const {
		inspectFeature, clientControlFeature, userProfile, roles = [], clients = [],
		filter, sortDirection, sortBy, doSort, connected
	} = props;
	const [filteredClients, setFilteredClients] = useState(clients);
	const theme = useTheme();
	const small = useMediaQuery(theme.breakpoints.down('xs'));
	const medium = useMediaQuery(theme.breakpoints.between('sm', 'sm'));
	const {enqueueSnackbar} = useSnackbar();

	const onDisconnectClient = async (client) => {
		try {
			await brokerClient.disconnectClient(client.clientid);
			enqueueSnackbar(`Disconnect sent to client "${client.clientid}"`, {
				variant: 'success'
			});
		} catch (error) {
			console.error(error);
			enqueueSnackbar(`Error disconnecting client "${client.clientid}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
		const refreshedInspectClients = await brokerClient.inspectListClients();
		dispatch(updateInspectClients(refreshedInspectClients));
	};

	const onUpdateUserRoles = async (user, roles = []) => {
		if (!roles) {
			roles = [];
		}
		const rolenames = roles.map((role) => role.value);
		await brokerClient.updateUserRoles(user, rolenames);
		const clients = await brokerClient.inspectListClients();
		dispatch(updateInspectClients(clients));
	};

	const onSelectClient = async (username) => {
		const client = await brokerClient.inspectGetClient(username);
		dispatch(updateInspectClient(client));
		history.push(`/clientinspection/${username}`);
	};

	React.useEffect(() => {
		let sortedClients;

		sortedClients = clients.filter(clientL => clientL.username.startsWith(filter));
		sortedClients.forEach(cl => cl.queues ? cl.messagesOut = cl.queues.messagesOut : cl.messagesOut = 0);

		if (sortBy) {
			sortedClients = doSort([...sortedClients], sortDirection, (a) => a[sortBy])
		} else {
			sortedClients = sortedClients;
		}

		setFilteredClients(sortedClients);

	}, [clients, sortDirection, sortBy, filter]);

	// React.useEffect(() => {
	// 	setFilteredClients(clients.filter(clientL => clientL.username.startsWith(filter)));
	// }, [filter]);
	//
	// React.useEffect(() => {
	// 	setFilteredClients(clients);
	// }, [clients]);

	const onReload = async () => {
		const clients = await brokerClient.inspectListClients();
		dispatch(updateInspectClients(clients));
	};

	return (
		<ContentContainer
			dataTour="page-clientinspection"
			breadCrumbs={<ContainerBreadCrumbs title="Client Inspection" links={[{name: 'Home', route: '/home'}]}/>}
		>
			<ContainerHeader
				title="Inspect Clients"
				subTitle="List of all clients that have connected to the broker at least once."
				connectedWarning={!connected}
				featureWarning={(!clientControlFeature?.error && clientControlFeature?.supported === false) ? "Client Control" : null}
				brokerFeatureWarning={(!inspectFeature?.error && inspectFeature?.supported === false) ? "Client Inspection" : null}
				warnings={() => {
					const alerts = [];
					if (inspectFeature?.error) {
						alerts.push({
							severity: 'warning',
							title: 'Client Inspect Error: ' + inspectFeature?.error?.title,
							error: inspectFeature?.error?.message
						});
					}
					if (clientControlFeature?.error) {
						alerts.push({
							severity: 'warning',
							title: 'Client Control Error: ' + clientControlFeature?.error?.title,
							error: clientControlFeature?.error?.message
						});
					}
					return alerts;
				}}
			>
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
			</ContainerHeader>
			{connected ? createClientsTable(filteredClients, classes, props, onDisconnectClient, onUpdateUserRoles,
				onSelectClient, small, medium, clientControlFeature) : null}
		</ContentContainer>
	);
};

const mapStateToProps = (state) => {
	return {
		clients: state.inspectClients?.clients,
		inspectFeature: state.systemStatus?.features?.inspect,
		connected: state.brokerConnections?.connected,
		clientControlFeature: state.systemStatus?.features?.clientcontrol
	};
};

export default connect(mapStateToProps)(Clients);
