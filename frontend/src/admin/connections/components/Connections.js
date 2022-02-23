import React, { useContext } from 'react';
import { green, red } from '@material-ui/core/colors';
import { makeStyles, withStyles, useTheme } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import AddIcon from '@material-ui/icons/Add';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import ConfigurationIcon from '@material-ui/icons/Tune';
import ConnectedIcon from '@material-ui/icons/CheckCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import DisconnectedIcon from '@material-ui/icons/Cancel';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import Fab from '@material-ui/core/Fab';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Popover from '@material-ui/core/Popover';
import { Link as RouterLink } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { updateBrokerConfigurations, updateBrokerConnections, updateSelectedConnection } from '../../../actions/actions';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PremiumFeatureDialog from '../../../components/PremiumFeatureDialog';
// import {
// 	colors,
//   } from '@material-ui/core';


const GROUP_TABLE_COLUMNS = [
	{ id: 'id', key: 'ID' },
	{ id: 'configurationName', key: 'Name' },
	{ id: 'URL', key: 'URL' },
	{ id: 'status', key: 'Status' }
];

const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.tables?.odd
		},
		cursor: 'pointer'
	}
}))(TableRow);

const createStatusIcon = (status) =>
	status && status.connected ? (
		<ConnectedIcon fontSize="small" style={{ color: green[500] }} />
	) : (
		<DisconnectedIcon fontSize="small" style={{ color: red[500] }} />
	);

const useStyles = makeStyles((theme) => ({
	avatar: {
		backgroundColor: 'white'
	},
	imageIcon: {
		height: '100%',
		width: '20px'
	},
	iconRoot: {
		textAlign: 'center'
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const Connections = ({ brokerConnections, onSort, sortBy, sortDirection }) => {
	const classes = useStyles();
	const history = useHistory();
	const dispatch = useDispatch();
	const theme = useTheme();
	const context = useContext(WebSocketContext);
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;
	const [connection, setConnection] = React.useState('');
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [openedPopoverId, setOpenedPopoverId] = React.useState(null);
	const [premiumFeatureDialogOpen, setPremiumFeatureDialogOpen] = React.useState(false);

	const handleClosePremiumFeatureDialog = () => {
		setPremiumFeatureDialogOpen(false);
	}

	const onNewConnection = () => {
		history.push('/config/connections/new');
	};

	const handlePopoverOpen = (target, id) => {
		setOpenedPopoverId(id);
		setAnchorEl(target);
	};

	const handleClose = () => {
		setOpenedPopoverId(null);
		setAnchorEl(null);
	};

	const loadConnections = async () => {
		const brokerConnections = await brokerClient.getBrokerConnections();
		dispatch(updateBrokerConnections(brokerConnections));
		const brokerConfigurations = await brokerClient.getBrokerConfigurations();
		dispatch(updateBrokerConfigurations(brokerConfigurations));
	}

	const onSelectConnection = async (connection) => {
		dispatch(updateSelectedConnection(connection));
		history.push(`/config/connections/detail/${connection.id}`);
	};

	const onConnectServerToBroker = async (id) => {
		try {
			await brokerClient.connectServerToBroker(id);
			enqueueSnackbar(`Connection "${id}" successfully established`, {
				variant: 'success'
			});
		} catch (error) {
			// setPremiumFeatureDialogOpen(true);
			enqueueSnackbar(`Error disconnecting broker. Reason: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
		}
		await loadConnections();
	}

	const onDisconnectServerFromBroker = async (id) => {
		try {

			let connections = await brokerClient.getBrokerConnections();
			const connected = connections.filter(connection => connection?.status?.connected);
			if (connected?.length === 1) {
				enqueueSnackbar(`Error disconnecting broker. Reason: at least one broker needs to be connected.`, {
					variant: 'error'
				});
				return;
			}

			await confirm({
				title: 'Confirm disconnecting',
				description: `Do you really want to disconnect the connection "${id}"?`,
				cancellationButtonProps: {
					variant: 'contained'
				},
				confirmationButtonProps: {
					color: 'primary',
					variant: 'contained'
				}
			});

			await brokerClient.disconnectServerFromBroker(id);
			enqueueSnackbar(`Connection "${id}" successfully closed`, {
				variant: 'success'
			});
			connections = await brokerClient.getBrokerConnections();
			dispatch(updateBrokerConnections(connections));
		} catch (error) {
			// setPremiumFeatureDialogOpen(true);
			enqueueSnackbar(`Error disconnecting broker. Reason: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
			// enqueueSnackbar(`Error disconnecting broker. Note that this feature is only available in the premium version.`, {
			// 	variant: 'error'
			// });
		}
		await loadConnections();
	}

	const handleBrokerConnectionConnectDisconnect = async (id, connect) => {
		if (connect) {
			await onConnectServerToBroker(id);
		} else {
			await onDisconnectServerFromBroker(id);
		}
	};

	const onDeleteConnection = async (id) => {
		try {
			await confirm({
				title: 'Confirm connection deletion',
				description: `Do you really want to delete connection "${id}"?`,
				cancellationButtonProps: {
					variant: 'contained'
				},
				confirmationButtonProps: {
					color: 'primary',
					variant: 'contained'
				}
			});
			await brokerClient.deleteConnection(id);
			enqueueSnackbar(`Connection "${id}" successfully deleted`, {
				variant: 'success'
			});
			const connections = await brokerClient.getBrokerConnections();
			dispatch(updateBrokerConnections(connections));
		} catch (error) {
			// setPremiumFeatureDialogOpen(true);
			enqueueSnackbar(`Error deleting connection. Reason: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
			// enqueueSnackbar(`Error disconnecting broker. Note that this feature is only available in the premium version.`, {
			// 	variant: 'error'
			// });
		}
	};

	return (
		<div>
			<PremiumFeatureDialog open={premiumFeatureDialogOpen} handleClose={handleClosePremiumFeatureDialog} />
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/config">
					Config
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Connections
				</Typography>
			</Breadcrumbs>
			<br />
			<Button
				variant="outlined"
				color="default"
				size="small"
				className={classes.button}
				startIcon={<AddIcon />}
				onClick={(event) => {
					event.stopPropagation();
					onNewConnection();
				}}
			>
				New Connection
			</Button>
			<br />
			<br />
			{brokerConnections && brokerConnections?.length > 0 ? (
				<div>
					<Hidden xsDown implementation="css">
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										{GROUP_TABLE_COLUMNS.map((column) => (
											<TableCell
												key={column.id}
												// sortDirection={sortBy === column.id ? sortDirection : false}
											>
												{/* <TableSortLabel
													active={sortBy === column.id}
													direction={sortDirection}
													// onClick={() => onSort(column.id)}
												>
													{column.key}
												</TableSortLabel> */}
												{column.key}
											</TableCell>
										))}
										<TableCell />
									</TableRow>
								</TableHead>
								<TableBody>
									{brokerConnections &&
										brokerConnections
											.sort((a, b) => a.name.localeCompare(b.name))
											.map((brokerConnection) => (
												<StyledTableRow
													hover
													key={brokerConnection.name}
													onClick={() => onSelectConnection(brokerConnection)}
												//   style={{ cursor: "pointer" }}
												>
													<TableCell>{brokerConnection.id}</TableCell>
													<TableCell>{brokerConnection.name}</TableCell>
													<TableCell>{brokerConnection.url}</TableCell>
													<TableCell>
														<Popover
															id={brokerConnection.id}
															open={openedPopoverId === brokerConnection.id}
															anchorEl={anchorEl}
															onClose={handleClose}
															anchorOrigin={{
																vertical: 'bottom',
																horizontal: 'center'
															}}
															transformOrigin={{
																vertical: 'top',
																horizontal: 'center'
															}}
														>
															<Typography className={classes.typography}>
																{brokerConnection.status?.connected ? (
																	<Paper>Broker successfully connected</Paper>
																) : (
																	<TableContainer component={Paper}>
																		<Table>
																			<TableBody>
																				<TableRow>
																					<TableCell>
																						<strong>Error number</strong>
																					</TableCell>
																					<TableCell>
																						{
																							brokerConnection.status
																								?.error?.errno
																						}
																					</TableCell>
																				</TableRow>
																				<TableRow>
																					<TableCell>
																						<strong>Error code</strong>
																					</TableCell>
																					<TableCell>
																						{
																							brokerConnection.status
																								?.error?.code
																						}
																					</TableCell>
																				</TableRow>
																				<TableRow>
																					<TableCell>
																						<strong>System call</strong>
																					</TableCell>
																					<TableCell>
																						{
																							brokerConnection.status
																								?.error?.syscall
																						}
																					</TableCell>
																				</TableRow>
																				<TableRow>
																					<TableCell>
																						<strong>Address</strong>
																					</TableCell>
																					<TableCell>
																						{
																							brokerConnection.status
																								?.error?.address
																						}
																					</TableCell>
																				</TableRow>
																				<TableRow>
																					<TableCell>
																						<strong>Port</strong>
																					</TableCell>
																					<TableCell>
																						{
																							brokerConnection.status
																								?.error?.port
																						}
																					</TableCell>
																				</TableRow>
																			</TableBody>
																		</Table>
																	</TableContainer>
																)}
															</Typography>
														</Popover>
														<IconButton
															size="small"
															onClick={(event) => {
																event.stopPropagation();
																handlePopoverOpen(event.target, brokerConnection.id);
															}}
														>
															{createStatusIcon(brokerConnection.status)}
														</IconButton>
														{ }
													</TableCell>
													<TableCell align="right">
														<Tooltip title={brokerConnection.status?.connected ? 'Disconnect' : 'Connect'}>
															<Switch
																checked={brokerConnection.status?.connected}
																name="connectionConnected"
																onClick={(event) => {
																	event.stopPropagation();
																	handleBrokerConnectionConnectDisconnect(brokerConnection.id, event.target.checked);
																}}
																inputProps={{ 'aria-label': 'Connection connected' }}
															/>
														</Tooltip>
														<IconButton
															disabled={brokerConnection.status?.connected}
															size="small"
															onClick={(event) => {
																event.stopPropagation();
																onDeleteConnection(brokerConnection.id);
															}}
														>
															<DeleteIcon fontSize="small" />
														</IconButton>
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
								{brokerConnections && Array.isArray(brokerConnections)
									? brokerConnections.map((brokerConnection) => (
										<React.Fragment>
											<ListItem alignItems="flex-start">
												<ListItemText
													primary={<span>{brokerConnection.name}</span>}
													secondary={
														<React.Fragment>
															<Typography
																component="span"
																variant="body2"
																className={classes.inline}
																color="textPrimary"
															>
																{brokerConnection.url}
															</Typography>
														</React.Fragment>
													}
												/>
												{/* <ListItemSecondaryAction>
					  <IconButton edge="end" aria-label="edit">
						<EditIcon />
					  </IconButton>
					  <IconButton edge="end" aria-label="delete">
						<DeleteIcon />
					  </IconButton>
					</ListItemSecondaryAction> */}
											</ListItem>
											<Divider />
										</React.Fragment>
									))
									: null}
							</List>
						</Paper>
					</Hidden>
				</div>
			) : (
				<div>No connections found</div>
			)}
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		brokerConnections: state.brokerConnections?.brokerConnections
	};
};

export default connect(mapStateToProps)(Connections);
