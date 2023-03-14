import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateBrokerConfigurations, updateBrokerConnections, updateSelectedConnection} from '../../../actions/actions';
import BrokerStatusIcon from '../../../components/BrokerStatusIcon';
import ContainerBreadCrumbs from '../../../components/ContainerBreadCrumbs';
import ContainerHeader from '../../../components/ContainerHeader';
import PremiumFeatureDialog from '../../../components/PremiumFeatureDialog';
import {atLeastAdmin} from '../../../utils/accessUtils/access';
import {handleConnectionChange} from '../../../utils/connectionUtils/connections';
import {WebSocketContext} from '../../../websockets/WebSocket';


const GROUP_TABLE_COLUMNS = [{id: 'expand', key: '', width: '10px'}, {id: 'name', key: 'Name'}, {
	id: 'id',
	key: 'ID'
}, {id: 'url', key: 'URL'}, {id: 'status', key: 'Status', width: '10px'}, {id: 'action', key: ' ', width: '100px'}];

const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.tables?.odd
		}
	}
}))(TableRow);

const useStyles = makeStyles((theme) => ({
	avatar: {
		backgroundColor: 'white'
	}, imageIcon: {
		height: '100%', width: '20px'
	}, iconRoot: {
		textAlign: 'center'
	}, cursorPointer: {
		cursor: 'pointer'
	}, invisibleButton: {
		display: 'none',
	},
}));


const CustomRow = (props) => {
	const {enqueueSnackbar} = useSnackbar();
	const initialCursorPosInfo = {
		mouseX: null, mouseY: null,
	};
	const {
		brokerConnection, handleBrokerConnectionConnectDisconnect, onDeleteConnection, userProfile, small, medium
	} = props;
	const [open, setOpen] = React.useState(false);
	const [cursorPosInfo, setCursorPosInfo] = React.useState(initialCursorPosInfo);

	const handleClick = (event) => {
		event.preventDefault();
		setCursorPosInfo({
			mouseX: event.clientX - 2, mouseY: event.clientY - 4,
		});
	};

	const handleClose = () => {
		setCursorPosInfo(initialCursorPosInfo);
	};


	const copyText = (text) => {
		try {
			navigator.clipboard.writeText(text);
			enqueueSnackbar(`Text copied successfully`, {
				variant: 'success'
			});
		} catch (error) {
			enqueueSnackbar(`Couldn't copy text: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
		}

		handleClose();
	}

	const someExternalURLExists = !!(brokerConnection.externalUnencryptedUrl || brokerConnection.externalEncryptedUrl);
	const bothExternalURLExists = !!(brokerConnection.externalUnencryptedUrl && brokerConnection.externalEncryptedUrl);

	const oneExternalURLExists = someExternalURLExists && !bothExternalURLExists;
	const makeCollapsible = someExternalURLExists || brokerConnection.ca || brokerConnection.cert || brokerConnection.key;

	const numberOfAdditionalFields = !!brokerConnection.websocketsUrl + !!brokerConnection.externalUnencryptedUrl + !!brokerConnection.externalEncryptedUrl + !!brokerConnection.ca + !!brokerConnection.cert + !!brokerConnection.key;

	const columnSize = (numberOfAdditionalFields === 1) ? 12 : 6;

	const url = brokerConnection.externalEncryptedUrl || brokerConnection.externalUnencryptedUrl || brokerConnection.internalUrl || brokerConnection.url;


	return <>
		<StyledTableRow
			//   style={{ cursor: "pointer" }}
			// onClick={() => onSelectConnection(brokerConnection)}
			onClick={props.onClick}
			key={brokerConnection.name}
			onContextMenu={handleClick}
			className={atLeastAdmin(userProfile, brokerConnection.name) ? props.classes.cursorPointer : ''}
		>
			{medium || small ? null : <TableCell style={{padding: '6px'}}>
				<IconButton aria-label="expand row" size="small"
							disabled={!makeCollapsible}
							style={makeCollapsible ? {opacity: "100%"} : {opacity: "0%"}}
							onClick={(event) => {
								event.stopPropagation();
								setOpen(!open);
							}}>
					{open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
				</IconButton>
			</TableCell>}
			<TableCell style={{padding: '6px'}}>{brokerConnection.name}</TableCell>
			{medium || small ? null : <TableCell style={{padding: '6px'}}>{brokerConnection.id}</TableCell>}
			{small ? null : <TableCell style={{padding: '6px'}}>{url}</TableCell>}
			<TableCell style={{padding: '6px'}}>
				<BrokerStatusIcon brokerConnection={brokerConnection}/>
				{}
			</TableCell>
			{medium || small ? null : <TableCell style={{padding: '6px'}} align="right">
				<Tooltip title={brokerConnection.status?.connected ? 'Disconnect' : 'Connect'}>
					<Switch
						color="primary"
						disabled={!atLeastAdmin(userProfile, brokerConnection.name)}
						checked={brokerConnection.status?.connected}
						name="connectionConnected"
						onClick={(event) => {
							event.stopPropagation();
							handleBrokerConnectionConnectDisconnect(brokerConnection.id, brokerConnection.name,
								event.target.checked);
						}}
						inputProps={{'aria-label': 'Connection connected'}}
					/>
				</Tooltip>
				<IconButton
					disabled={brokerConnection.status?.connected || !atLeastAdmin(userProfile, brokerConnection.name)}
					size="small"
					onClick={(event) => {
						event.stopPropagation();
						onDeleteConnection(brokerConnection.id);
					}}
				>
					<DeleteIcon fontSize="small"/>
				</IconButton>
			</TableCell>}
		</StyledTableRow>
		<TableRow>
			<TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
				<Collapse in={open} timeout="auto" unmountOnExit>
					<Box margin={1} style={{marginTop: '16px'}} align="center">
						{/* {brokerConnection.externalUrl ? <Typography>Internal URL: {brokerConnection.url}</Typography> : null} */}
						<Grid container spacing={2} alignItems="flex-end">
							{brokerConnection.internalUrl ? <Grid item xs={columnSize} align="center">
								<Typography style={{fontSize: 'small'}}>
										<span
											style={{fontWeight: 'bold'}}>Internal URL: </span>{brokerConnection.internalUrl}
								</Typography>
							</Grid> : null}
							{brokerConnection.externalEncryptedUrl ? <Grid item xs={columnSize} align="center">
								<Typography style={{fontSize: 'small'}}>
										<span
											style={{fontWeight: 'bold'}}>External MQTTS URL: </span>{brokerConnection.externalEncryptedUrl}
								</Typography>
							</Grid> : null}
							{brokerConnection.externalUnencryptedUrl ? <Grid item xs={columnSize} align="center">
								<Typography style={{fontSize: 'small'}}>
										<span
											style={{fontWeight: 'bold'}}>External MQTT URL: </span>{brokerConnection.externalUnencryptedUrl}
								</Typography>
							</Grid> : null}
							{brokerConnection.websocketsUrl ? <Grid item xs={columnSize} align="center">
								<Typography style={{fontSize: 'small'}}>
										<span
											style={{fontWeight: 'bold'}}>External WS URL: </span>{brokerConnection.websocketsUrl}
								</Typography>
							</Grid> : null}
							{brokerConnection.ca ? <Grid item xs={columnSize} align="center">
								<Typography style={{fontSize: 'small'}}>
									<span style={{fontWeight: 'bold'}}>CA Cert File: </span>{brokerConnection.caFile}
								</Typography>
							</Grid> : null}
							{brokerConnection.cert ? <Grid item md={columnSize} align="center">
								<Typography style={{fontSize: 'small'}}>
										<span
											style={{fontWeight: 'bold'}}>Client Cert File: </span>{brokerConnection.certFile}
								</Typography>
							</Grid> : null}
							{brokerConnection.key ? <Grid item md={columnSize} align="center">
								<Typography style={{fontSize: 'small'}}>
										<span
											style={{fontWeight: 'bold'}}>Private Key File: </span>{brokerConnection.keyFile}
								</Typography>
							</Grid> : null}
						</Grid>
					</Box>
				</Collapse>
			</TableCell>
		</TableRow>
		<Menu
			keepMounted
			open={cursorPosInfo.mouseY !== null}
			onClose={handleClose}
			anchorReference="anchorPosition"
			anchorPosition={cursorPosInfo.mouseY !== null && cursorPosInfo.mouseX !== null ? {
				top: cursorPosInfo.mouseY,
				left: cursorPosInfo.mouseX
			} : undefined}
		>
			{!oneExternalURLExists && !brokerConnection.internalUrl ?
				<MenuItem onClick={() => copyText(brokerConnection.url)}>Copy URL</MenuItem> : null}
			{brokerConnection.internalUrl ?
				<MenuItem onClick={() => copyText(brokerConnection.internalUrl)}>Copy Internal URL</MenuItem> : null}
			{oneExternalURLExists ? <MenuItem onClick={() => copyText(
				brokerConnection.externalUnencryptedUrl || brokerConnection.externalEncryptedUrl)}>Copy External
				URL</MenuItem> : bothExternalURLExists ? (<>
				<MenuItem onClick={() => copyText(brokerConnection.externalUnencryptedUrl)}>Copy External MQTT
					URL</MenuItem>
				<MenuItem onClick={() => copyText(brokerConnection.externalEncryptedUrl)}>Copy External MWTTS
					URL</MenuItem>
			</>) : null}
			{brokerConnection.websocketsUrl ?
				<MenuItem onClick={() => copyText(brokerConnection.websocketsUrl)}>Copy WS URL</MenuItem> : null}
		</Menu>
	</>
};


const Connections = ({
						 brokerConnections, onSort, sortBy, sortDirection, connected, userProfile, currentConnectionName
					 }) => {
	const classes = useStyles();
	const history = useHistory();
	const dispatch = useDispatch();
	const context = useContext(WebSocketContext);
	const confirm = useConfirm();
	const {enqueueSnackbar} = useSnackbar();
	const {client: brokerClient} = context;
	const [connection, setConnection] = React.useState('');
	const [premiumFeatureDialogOpen, setPremiumFeatureDialogOpen] = React.useState(false);
	const small = useMediaQuery(theme => theme.breakpoints.down('xs'));
	const medium = useMediaQuery(theme => theme.breakpoints.between('sm', 'sm'));

	const handleClosePremiumFeatureDialog = () => {
		setPremiumFeatureDialogOpen(false);
	}

	const onNewConnection = () => {
		history.push('/connections/new');
	};


	const onSelectConnection = async (connection) => {
		if (!atLeastAdmin(userProfile, connection.name)) {
			return;
		}
		dispatch(updateSelectedConnection(connection));
		history.push(`/connections/${connection.id}`);
	};


	const loadConnections = async () => {
		const brokerConnections = await brokerClient.getBrokerConnections();
		dispatch(updateBrokerConnections(brokerConnections));
		const brokerConfigurations = await brokerClient.getBrokerConfigurations();
		dispatch(updateBrokerConfigurations(brokerConfigurations));
	}

	const onConnectServerToBroker = async (id, name) => {
		try {
			await brokerClient.connectServerToBroker(id);
			if (!connected) {
				handleConnectionChange(dispatch, brokerClient, name, currentConnectionName, connected).catch(
					(error) => console.error('Error while pulling information from the broker on reconnect: ' + error));
				// await brokerClient.connectToBroker(name);
				// dispatch(updateBrokerConnected(true, name));
			}

			enqueueSnackbar(`Connection "${id}" successfully established`, {
				variant: 'success'
			});
		} catch (error) {
			// setPremiumFeatureDialogOpen(true);
			enqueueSnackbar(`Error connecting broker. Reason: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
		}
		await loadConnections();
	}

	const onDisconnectServerFromBroker = async (id, name) => {
		try {

			let connections = await brokerClient.getBrokerConnections();
			// const connected = connections.filter(connection => connection?.status?.connected);
			// if (connected?.length === 1) {
			// 	enqueueSnackbar(`Error disconnecting broker. Reason: at least one broker needs to be connected.`, {
			// 		variant: 'error'
			// 	});
			// 	return;
			// }

			await confirm({
				title: 'Confirm disconnecting',
				description: `Do you really want to disconnect the connection "${id}"?`,
				cancellationButtonProps: {
					variant: 'contained'
				},
				confirmationButtonProps: {
					color: 'primary', variant: 'contained'
				}
			});

			await brokerClient.disconnectServerFromBroker(id);
			enqueueSnackbar(`Connection "${id}" successfully closed`, {
				variant: 'success'
			});
			connections = await brokerClient.getBrokerConnections();
			dispatch(updateBrokerConnections(connections));
			handleConnectionChange(dispatch, brokerClient, currentConnectionName, name, connected).catch(
				(error) => console.error('Error while pulling information from the broker on disconnect: ' + error));
		} catch (error) {
			// setPremiumFeatureDialogOpen(true);
			enqueueSnackbar(`Error disconnecting broker. Reason: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
			// enqueueSnackbar(`Error disconnecting broker. Note that this feature is only available in the premium
			// version.`, { variant: 'error' });
		}
		await loadConnections();
	}

	const handleBrokerConnectionConnectDisconnect = async (id, name, connect) => {
		if (connect) {
			await onConnectServerToBroker(id, name);
		} else {
			await onDisconnectServerFromBroker(id, name);
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
					color: 'primary', variant: 'contained'
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
			// enqueueSnackbar(`Error disconnecting broker. Note that this feature is only available in the premium
			// version.`, { variant: 'error' });
		}
	};

	return (<div style={{height: '100%'}}>
		<PremiumFeatureDialog open={premiumFeatureDialogOpen} handleClose={handleClosePremiumFeatureDialog}/>
		<ContainerBreadCrumbs title="Connections" links={[{name: 'Home', route: '/home'}]}/>
		<div style={{height: 'calc(100% - 26px)'}}>
			<div style={{display: 'grid', gridTemplateRows: 'max-content auto', height: '100%'}}>
				<ContainerHeader
					title="Connections"
					subTitle="List of Connections. Connections configure the access to an existing broker instance."
				>
					<Button
						variant="outlined"
						color="primary"
						size="small"
						// className={classes.button}
						startIcon={<AddIcon/>}
						onClick={(event) => {
							event.stopPropagation();
							onNewConnection();
						}}
					>
						New Connection
					</Button>
				</ContainerHeader>
				{brokerConnections && brokerConnections?.length > 0 ? (
					<div style={{height: '100%', overflowY: 'auto'}}>
						<TableContainer style={{maxHeight: '100%'}}>
							<Table stickyHeader size="small" aria-label="sticky table">
								<TableHead>
									<TableRow>
										{GROUP_TABLE_COLUMNS.map((column) => (<TableCell
											style={{
												padding: '6px',
												width: column.width,
												display: (!small && !medium) || (column.id === 'name' && (small || medium)) || (column.id === 'status' && (small || medium)) || (column.id === 'url' && medium) ? undefined : 'none'
											}}
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
										</TableCell>))}
									</TableRow>
								</TableHead>
								<TableBody>
									{brokerConnections && brokerConnections
										.sort((a, b) => a.name.localeCompare(b.name))
										.map((brokerConnection) => (<CustomRow
											small={small}
											medium={medium}
											hover
											onClick={() => onSelectConnection(brokerConnection)}
											brokerConnection={brokerConnection}
											handleBrokerConnectionConnectDisconnect={handleBrokerConnectionConnectDisconnect}
											onDeleteConnection={onDeleteConnection}
											userProfile={userProfile}
											classes={classes}
										/>))}
								</TableBody>
							</Table>
						</TableContainer>
					</div>) : (<div>No connections found</div>)}
			</div>
		</div>
	</div>);
};

const mapStateToProps = (state) => {
	return {
		brokerConnections: state.brokerConnections?.brokerConnections,
		connected: state.brokerConnections.connected,
		userProfile: state.userProfile?.userProfile,
		currentConnectionName: state.brokerConnections?.currentConnectionName,
	};
};

export default connect(mapStateToProps)(Connections);
