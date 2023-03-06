import {green, red} from '@material-ui/core/colors';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import DisabledIcon from '@material-ui/icons/Cancel';
import EnabledIcon from '@material-ui/icons/CheckCircle';
import {Alert, AlertTitle} from '@material-ui/lab';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import ContainerBreadCrumbs from '../../../components/ContainerBreadCrumbs';
import ContainerHeader from '../../../components/ContainerHeader';
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
	{ id: 'username', key: 'Username' },
	{ id: 'clientid', key: 'Client ID' },
	{ id: 'protocol', key: 'Protocol' },
	{ id: 'address', key: 'IP Address' },
	{ id: 'last_connected', key: 'Last Connect Time' },
	{ id: 'last_disconnected', key: 'Last Disconnect Time' },
	{ id: 'status', key: 'Status' },
];


const unixTimestampToDate = (unixTimestamp) => {
	if (!unixTimestamp) return unixTimestamp;
	unixTimestamp = parseInt((unixTimestamp + '').slice(0, 10));
	return new Date(unixTimestamp * 1000);
};

const dateToString = (date, separator=' ') => {
	if (!date) return date;
	return date.getFullYear() + '-'
			+ ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + '-'
			+ (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + separator
			+ (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
			+ (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
			+ (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
};


const createClientsTable = (clients, classes, props, onUpdateUserRoles, onSelectClient) => {
	const { inspectFeature, onSort, sortBy, sortDirection } = props;

	if (!inspectFeature?.error && inspectFeature?.supported !== false && clients && clients.length > 0) {
		return <div style={{height: '100%', overflowY: 'auto'}}>
			<Hidden style={{height: '100%'}} xsDown implementation="js">
				<TableContainer style={{maxHeight: '100%'}}>
					<Table stickyHeader size="small"  aria-label="sticky table">
						<TableHead>
							<TableRow>
								{CLIENTS_TABLE_COLUMNS.map((column) => (
									<TableCell
										key={column.id}
										sortDirection={sortBy === column.id ? sortDirection : false}
									>
										{column.key}
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
										// key={client.username}
										onClick={(event) => {
											onSelectClient(client.username);
										}}
										style={{ cursor: 'pointer' }}
										key={`filter${String(Math.random())}`}
									>
										<TableCell>{client.username}</TableCell>
										<TableCell>{client.clientid}</TableCell>
										<TableCell>{`${client.protocol} ${client.protocolVersion}`}</TableCell>
										<TableCell>{client.address}</TableCell>
										<TableCell>{dateToString(unixTimestampToDate(client.lastConnect))}</TableCell>
										<TableCell>{dateToString(unixTimestampToDate(client.lastDisconnect))}</TableCell>
										<TableCell align="center">
											{client.connected ?
												<Tooltip title={"Client connected"}>
													<EnabledIcon fontSize="small" style={{ color: green[500] }} />
												</Tooltip>
												:
												<Tooltip title={"Client disconnected"}>
													<DisabledIcon fontSize="small" style={{ color: red[500] }} />
												</Tooltip>
											}
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
													{client.username}
												</Typography>
												<span> — {client.clientid} </span>
											</React.Fragment>
										}
									/>
								</ListItem>
								<Divider />
							</React.Fragment>
						))}
					</List>
				</Paper>
			</Hidden>
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
	const { client: brokerClient } = context;
	const { inspectFeature, userProfile, roles = [], clients = [], filter, onSort, sortBy, sortDirection } = props;
	const [filteredClients, setFilteredClients] = useState(clients);

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
		setFilteredClients(clients.filter(clientL => clientL.username.startsWith(filter)));
	}, [filter]);

	React.useEffect(() => {
		setFilteredClients(clients);
	}, [clients]);

	console.log('clients:', filteredClients);

	return (
		<div style={{height: '100%'}}>
			<ContainerBreadCrumbs title="Client Inspection" links={[{name: 'Home', route: '/home'}]}/>
			<div style={{height: 'calc(100% - 26px)'}}>
				<div style={{display: 'grid', gridTemplateRows: 'max-content auto', height: '100%'}}>
					<ContainerHeader
						title="Inspect Clients"
						subTitle="List of all clients that have connected to the broker at least once."
					/>
					{/* TODO: Quick hack to detect whether feature is supported */}
					{inspectFeature?.error ? <>
						<br/>
							<Alert severity="warning">
								<AlertTitle>{inspectFeature.error.title}</AlertTitle>
								{inspectFeature.error.message}
							</Alert>
					</> : null}
					{!inspectFeature?.error && inspectFeature?.supported === false ? <>
						<br/>
						<Alert severity="warning">
							<AlertTitle>Feature not available</AlertTitle>
							Make sure that this feature is included in your MMC license.
						</Alert>
					</> : null}
					{ createClientsTable(filteredClients, classes, props, onUpdateUserRoles, onSelectClient) }
				</div>
			</div>
		</div>
	);
};

Clients.propTypes = {
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
		clients: state.inspectClients?.clients,
		inspectFeature: state.systemStatus?.features?.inspect
	};
};

export default connect(mapStateToProps)(Clients);
