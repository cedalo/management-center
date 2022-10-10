import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { updateInspectClient, updateInspectClients } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@material-ui/icons/Add';
import { Alert, AlertTitle } from '@material-ui/lab';
import AutoSuggest from '../../../components/AutoSuggest';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import ClientIcon from '@material-ui/icons/Person';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
// import Fab from '@material-ui/core/Fab';
import GroupIcon from '@material-ui/icons/Group';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';

import { green, red } from '@material-ui/core/colors';
import DisabledIcon from '@material-ui/icons/Cancel';
import EnabledIcon from '@material-ui/icons/CheckCircle';


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
	// fab: {
	// 	position: 'absolute',
	// 	bottom: theme.spacing(2),
	// 	right: theme.spacing(2)
	// },
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const CLIENTS_TABLE_COLUMNS = [
	{ id: 'username', key: 'Username' },
	{ id: 'clientid', key: 'Client ID' },
	{ id: 'protocol', key: 'Protocol' },
	{ id: 'protocol_version', key: 'Protocol Version' },
	{ id: 'address', key: 'Address' },
	{ id: 'status', key: 'Status' },
	{ id: 'last_connected', key: 'Last Connect Time' },
	{ id: 'last_disconnected', key: 'Last Disconnect Time' },
];


const unixTimestampToDate = (unixTimestamp) => {
	if (!unixTimestamp) return unixTimestamp;
	unixTimestamp = parseInt((unixTimestamp + '').slice(0, 10));
	const date = new Date(unixTimestamp * 1000);
	return date;
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
		return <div>
			<Hidden xsDown implementation="css">
				<Typography>Currently connected clients</Typography>
				<div style={{marginBottom: '15px'}}></div>
				<TableContainer component={Paper} className={classes.tableContainer}>
					<Table size="medium">
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
										key={client.username}
										onClick={(event) => {
											onSelectClient(client.username);
										}}
										style={{ cursor: 'pointer' }}
									>
										<TableCell>{client.username}</TableCell>
										<TableCell>{client.clientid}</TableCell>
										<TableCell>{client.protocol}</TableCell>
										<TableCell>{client.protocol_version}</TableCell>
										<TableCell>{client.address}</TableCell>
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
										<TableCell>{dateToString(unixTimestampToDate(client.lastConnect))}</TableCell>
										<TableCell>{dateToString(unixTimestampToDate(client.lastDisconnect))}</TableCell>
										<TableCell></TableCell>
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
									<ListItemSecondaryAction>
										{/* <IconButton
											edge="end"
											size="small"
											onClick={(event) => {
												event.stopPropagation();
												onSelectClient(client.username);
											}}
											aria-label="edit"
										>
											<EditIcon fontSize="small" />
										</IconButton> */}
									</ListItemSecondaryAction>
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
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;

	const { inspectFeature, userProfile, roles = [], clients = [], onSort, sortBy, sortDirection } = props;

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
		history.push(`/admin/inspect/clients/detail/${username}`);
	};

	console.log('clients:', clients);

	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} color="inherit" to="/admin">
					Admin
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Inspect
				</Typography>
			</Breadcrumbs>
			{/* TODO: Quick hack to detect whether feature is supported */}
			{inspectFeature?.error ? <><br/><Alert severity="warning">
				<AlertTitle>{inspectFeature.error.title}</AlertTitle>
				{inspectFeature.error.message}
			</Alert></> : null}
			{!inspectFeature?.error && inspectFeature?.supported === false ? <><br/><Alert severity="warning">
				<AlertTitle>Feature not available</AlertTitle>
				Make sure that this feature is included in your MMC license.
			</Alert></> : null}
			<br />
			<br />
			
			{ createClientsTable(clients, classes, props, onUpdateUserRoles, onSelectClient) }
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
