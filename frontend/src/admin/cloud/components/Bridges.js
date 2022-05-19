import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { updateBridge, updateBridges } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@material-ui/icons/Add';
import { Alert, AlertTitle } from '@material-ui/lab';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckHealthStatusIcon from '@material-ui/icons/Favorite';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';

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
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const BRIDGES_TABLE_COLUMNS = [
	{ id: 'bridgename', key: 'Bridgename' },
	{ id: 'description', key: 'Description' },
];

const createBridgeTable = (bridges, classes, props, onCheckHealthStatus, onDeleteBridge, onSelectBridge) => {
	const { bridgesFeature, sortBy, sortDirection } = props;

	if (!bridgesFeature?.error && bridgesFeature?.supported !== false && bridges && bridges.length > 0) {
		return <div>
			<Hidden xsDown implementation="css">
				<TableContainer component={Paper} className={classes.tableContainer}>
					<Table size="medium">
						<TableHead>
							<TableRow>
								{BRIDGES_TABLE_COLUMNS.map((column) => (
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
							{bridges &&
								bridges.map((bridge) => (
									<StyledTableRow
										hover
										key={bridge.bridgename}
										onClick={(event) => {
											onSelectBridge(bridge.bridgename);
										}}
										style={{ cursor: 'pointer' }}
									>
										<TableCell>{bridge.bridgename}</TableCell>
										<TableCell>{bridge.description}</TableCell>
										<TableCell align="right">
											<Tooltip title="Delete bridge">
												<IconButton
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														onDeleteBridge(bridge.bridgename);
													}}
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
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
						{bridges.map((bridge) => (
							<React.Fragment>
								<ListItem
									alignItems="flex-start"
									onClick={(event) => onSelectBridge(bridge.bridgename)}
								>
									<ListItemText
										primary={<span>{bridge.bridgename}</span>}
										secondary={
											<React.Fragment>
												<Typography
													component="span"
													variant="body2"
													className={classes.inline}
													color="textPrimary"
												>
													{bridge.bridgename}
												</Typography>
											</React.Fragment>
										}
									/>
									<ListItemSecondaryAction>
										<IconButton
											edge="end"
											size="small"
											onClick={(event) => {
												event.stopPropagation();
												onSelectBridge(bridge.bridgename);
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
												onDeleteBridge(bridge.bridgename);
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
	} else if (bridgesFeature?.error) {
		return null;
	} else {
		return <div>No bridges found</div>
	}
}

const Bridges = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;

	const { bridgesFeature, bridges = [], onSort, sortBy, sortDirection } = props;

	const onSelectBridge = async (bridgename) => {
		const bridge = await brokerClient.getBridge(bridgename);
		dispatch(updateBridge(bridge));
		history.push(`/admin/cloud/bridges/detail/${bridgename}`);
	};

	const onNewBridge = () => {
		history.push('/admin/cloud/bridges/new');
	};

	const onDeleteBridge = async (bridgename) => {
		await confirm({
			title: 'Confirm bridge deletion',
			description: `Do you really want to delete brdige "${bridgename}"?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		await brokerClient.deleteBridge(bridgename);
		enqueueSnackbar(`Bridge "${bridgename}" successfully deleted`, {
			variant: 'success'
		});
		const bridges = await brokerClient.listBridges();
		dispatch(updateBridges(bridges));
	};

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
					Bridges
				</Typography>
			</Breadcrumbs>
			{/* TODO: Quick hack to detect whether feature is supported */}
			{bridgesFeature?.error ? <><br/><Alert severity="warning">
				<AlertTitle>{bridgesFeature.error.title}</AlertTitle>
				{bridgesFeature.error.message}
			</Alert></> : null}
			{!bridgesFeature?.error && bridgesFeature?.supported === false ? <><br/><Alert severity="warning">
				<AlertTitle>Feature not available</AlertTitle>
				Make sure that this feature is included in your MMC license.
			</Alert></> : null}
			<br />
			{!bridgesFeature?.error && bridgesFeature?.supported !== false && <><Button
				variant="outlined"
				color="default"
				size="small"
				className={classes.button}
				startIcon={<AddIcon />}
				onClick={(event) => {
					event.stopPropagation();
					onNewBridge();
				}}
			>
				New Bridge
			</Button>
			<br />
			<br />
			</>}
			
			{ createBridgeTable(bridges, classes, props, onDeleteBridge, onSelectBridge) }
		</div>
	);
};

Bridges.propTypes = {
	sortBy: PropTypes.string,
	sortDirection: PropTypes.string,
	onSelectBridge: PropTypes.func.isRequired,
	onSort: PropTypes.func.isRequired
};

Bridges.defaultProps = {
	sortBy: undefined,
	sortDirection: undefined
};

const mapStateToProps = (state) => {
	return {
		bridges: state.bridges?.bridges,
		bridgesFeature: state.systemStatus?.features?.bridgesFeature
	};
};

export default connect(mapStateToProps)(Bridges);
