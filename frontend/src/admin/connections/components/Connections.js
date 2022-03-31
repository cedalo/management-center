import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { green, red } from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import AddIcon from '@mui/icons-material/Add';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ConfigurationIcon from '@mui/icons-material/Tune';
import ConnectedIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import DisconnectedIcon from '@mui/icons-material/Cancel';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import Fab from '@mui/material/Fab';
import Hidden from '@mui/material/Hidden';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import { Link as RouterLink } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { updateBrokerConfigurations, updateBrokerConnections, updateSelectedConnection } from '../../../actions/actions';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PremiumFeatureDialog from '../../../components/PremiumFeatureDialog';
const PREFIX = 'Connections';

const classes = {
    root: `${PREFIX}-root`,
    avatar: `${PREFIX}-avatar`,
    imageIcon: `${PREFIX}-imageIcon`,
    iconRoot: `${PREFIX}-iconRoot`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.avatar}`]: {
		backgroundColor: 'white'
	},

    [`& .${classes.imageIcon}`]: {
		height: '100%',
		width: '20px'
	},

    [`& .${classes.iconRoot}`]: {
		textAlign: 'center'
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

// import {
// 	colors,
//   } from '@mui/material';


const GROUP_TABLE_COLUMNS = [
	{ id: 'id', key: 'ID' },
	{ id: 'configurationName', key: 'Name' },
	{ id: 'URL', key: 'URL' },
	{ id: 'status', key: 'Status' }
];

const StyledTableRow = TableRow;

const createStatusIcon = (status) =>
	status && status.connected ? (
		<ConnectedIcon fontSize="small" style={{ color: green[500] }} />
	) : (
		<DisconnectedIcon fontSize="small" style={{ color: red[500] }} />
	);

const Connections = ({ brokerConnections, onSort, sortBy, sortDirection }) => {

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
        <Root>
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
                size="small"
                className={classes.button}
                startIcon={<AddIcon />}
                onClick={(event) => {
					event.stopPropagation();
					onNewConnection();
				}}>
				New Connection
			</Button>
			<br />
			<br />
			{brokerConnections && brokerConnections?.length > 0 ? (
				<div>
					<Hidden smDown implementation="css">
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
                                                    //   style={{ cursor: "pointer" }}
                                                    onClick={() => onSelectConnection(brokerConnection)}
                                                    classes={{
                                                        root: classes.root
                                                    }}>
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
		</Root>
    );
};

const mapStateToProps = (state) => {
	return {
		brokerConnections: state.brokerConnections?.brokerConnections
	};
};

export default connect(mapStateToProps)(Connections);
