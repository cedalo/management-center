import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { updateCluster, updateClusters } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@material-ui/icons/Add';
import { Alert, AlertTitle } from '@material-ui/lab';
import AutoSuggest from '../../../components/AutoSuggest';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import ClientIcon from '@material-ui/icons/Person';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckHealthStatusIcon from '@material-ui/icons/Favorite';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
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
import WaitDialog from '../../../components/WaitDialog';
import { useConfirm  } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import DialogContentText from '@material-ui/core/DialogContentText';


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

const CLUSTER_TABLE_COLUMNS = [
	{ id: 'clustername', key: 'Clustername' },
	{ id: 'description', key: 'Description' },
	{ id: 'numberOfNodes', key: 'Nodes' },
];

const createClusterTable = (clusters, classes, props, onCheckHealthStatus, onDeleteCluster, onSelectCluster) => {
	const { clusterManagementFeature, userRoles = [], roles = [], onSort, sortBy, sortDirection } = props;

	if (!clusterManagementFeature?.error && clusterManagementFeature?.supported !== false && clusters && clusters.length > 0) {
		return <div>
			<Hidden xsDown implementation="css">
				<TableContainer component={Paper} className={classes.tableContainer}>
					<Table size="medium">
						<TableHead>
							<TableRow>
								{CLUSTER_TABLE_COLUMNS.map((column) => (
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
							{clusters &&
								clusters.map((cluster) => (
									<StyledTableRow
										hover
										key={cluster.clustername}
										onClick={(event) => {
											onSelectCluster(cluster.clustername, cluster.nodes?.length);
										}}
										style={{ cursor: 'pointer' }}
									>
										<TableCell>{cluster.clustername}</TableCell>
										<TableCell>{cluster.description}</TableCell>
										<TableCell>{cluster.nodes?.length || 0}</TableCell>
										<TableCell align="right">
											{/* <Tooltip title="Check health status">
												<IconButton
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														onCheckHealthStatus(cluster.clustername);
													}}
												>
													<CheckHealthStatusIcon fontSize="small" />
												</IconButton>
											</Tooltip> */}
											<Tooltip title="Delete cluster">
												<IconButton
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														onDeleteCluster(cluster.clustername);
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
						{clusters.map((cluster) => (
							<React.Fragment>
								<ListItem
									alignItems="flex-start"
									onClick={(event) => onSelectCluster(cluster.clustername, cluster.nodes?.length)}
								>
									<ListItemText
										primary={<span>{cluster.clustername}</span>}
										secondary={
											<React.Fragment>
												<Typography
													component="span"
													variant="body2"
													className={classes.inline}
													color="textPrimary"
												>
													{cluster.clustername}
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
												onSelectCluster(cluster.clustername, cluster.nodes?.length);
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
												onCheckHealthStatus(cluster.clustername);
											}}
											aria-label="delete"
										>
											<CheckHealthStatusIcon fontSize="small" />
										</IconButton>

										<IconButton
											edge="end"
											size="small"
											onClick={(event) => {
												event.stopPropagation();
												onDeleteCluster(cluster.clustername);
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
	} else if (clusterManagementFeature?.error) {
		return null;
	} else {
		return <div>No clusters found</div>
	}
}

const Clusters = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;
	const [progressDialogOpen, setProgressDialogOpen] = React.useState(false);
	const { clusterManagementFeature, clusters = [], onSort, sortBy, sortDirection } = props;

	const onSelectCluster = async (clustername, numberOfNodes) => {
		setProgressDialogOpen(true);
		try {
			const cluster = await brokerClient.getCluster(clustername, numberOfNodes);
			dispatch(updateCluster(cluster));
			setProgressDialogOpen(false);
			history.push(`/admin/clusters/detail/${clustername}`);
		} catch(error) {
			enqueueSnackbar(`Cluster loading failed. Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
	};

	const onNewCluster = () => {
		history.push('/admin/clusters/new');
	};

	const onCheckHealthStatus = async (clustername) => {
		try {
			const healtStatus = await brokerClient.checkClusterHealthStatus(clustername);
			if (healtStatus.error) {
				const error = healtStatus.error;
				enqueueSnackbar(`Cluster health check failed. Reason: ${error.message || error}`, {
					variant: 'error'
				});
			} else {
				enqueueSnackbar(`Cluster "${clustername}" healthy`, {
					variant: 'success'
				});
			}
		} catch (error) {
			enqueueSnackbar(`Cluster health check failed. Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
	};

	const onDeleteCluster = async (clustername) => {
		await confirm({
			title: 'Confirm cluster deletion',
			description: `Do you really want to delete cluster "${clustername}"?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		try {
			await brokerClient.deleteCluster(clustername);
			enqueueSnackbar(`Cluster "${clustername}" deleted successfully`, {
				variant: 'success'
			});
		} catch (error) {
			enqueueSnackbar(`Error deleting cluster "${clustername}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			try {
				await confirm({
					title: 'Force delete cluster',
					description: (
						<>
						<DialogContentText style={{ textAlign: "left" }}>
						  <span>When deleting cluster {clustername} an error occured:</span>
						  <br/>
						  <span>"{error.message || error}"</span>
						  <br/>
						  <span>It might be that the cluster is dangling.</span>
						  <br/>
						  <br/>
						  <span>Do you want to delete cluster configuration from MMC?</span>
						  <br/>
						  <span>Note that this is only an MMC-side action and does not ensure that the actual cluster will be deleted</span>
						</DialogContentText>
						</>
					),
					confirmationText: 'Yes',
					cancellationText: 'No',
					cancellationButtonProps: {
						variant: 'contained'
					},
					confirmationButtonProps: {
						color: 'primary',
						variant: 'contained'
					}
				});
				await confirm({
					title: 'Force delete cluster',
					description: (
						<>
							<span>Are you sure you want to delete configuration of the cluster "{clustername}" on the side of the Management Center?</span>
							<br/>
							<span>This action cannot be undone</span>
						</>
					),
					confirmationText: 'Yes',
					cancellationText: 'No',
					cancellationButtonProps: {
						variant: 'contained'
					},
					confirmationButtonProps: {
						color: 'primary',
						variant: 'contained'
					}
				});
				try {
					await brokerClient.deleteClusterConfiguration(clustername);
					enqueueSnackbar(`Configuration of the cluster "${clustername}" deleted successfully`, {
						variant: 'success'
					});
				} catch(error_) {
					enqueueSnackbar(`Error deleting cluster "${clustername}" configuration. Reason: ${error_.message || error_}`, {
						variant: 'error'
					});
				}
			} catch(_) {
			}
		}
		const clusters = await brokerClient.listClusters();
		dispatch(updateClusters(clusters));
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
					Clusters
				</Typography>
			</Breadcrumbs>
			{/* TODO: Quick hack to detect whether feature is supported */}
			{clusterManagementFeature?.supported === false ? <><br/><Alert severity="warning">
				<AlertTitle>Feature not available</AlertTitle>
				Make sure that this feature is included in your MMC license.
			</Alert></> : null}
			{clusterManagementFeature?.error && clusterManagementFeature?.supported === true ? <><br/><Alert severity="warning">
				<AlertTitle>{clusterManagementFeature.error.title || 'An error has occured'}</AlertTitle>
				{clusterManagementFeature.error.message || clusterManagementFeature.error}
			</Alert></> : null}
			<br />
			{!clusterManagementFeature?.error && clusterManagementFeature?.supported !== false && <><Button
				variant="outlined"
				color="default"
				size="small"
				className={classes.button}
				startIcon={<AddIcon />}
				onClick={(event) => {
					event.stopPropagation();
					onNewCluster();
				}}
			>
				New Cluster
			</Button>
			<br />
			<br />
			<WaitDialog
				title='Loading cluster details'
				message='Note that this can take a while depending on the size and status of your cluster.'
				open={progressDialogOpen}
				handleClose={() => setProgressDialogOpen(false)}
			/>
			</>}
			
			{ createClusterTable(clusters, classes, props, onCheckHealthStatus, onDeleteCluster, onSelectCluster) }
		</div>
	);
};

Clusters.propTypes = {
	sortBy: PropTypes.string,
	sortDirection: PropTypes.string,
	onSelectCluster: PropTypes.func.isRequired,
	onSort: PropTypes.func.isRequired
};

Clusters.defaultProps = {
	sortBy: undefined,
	sortDirection: undefined
};

const mapStateToProps = (state) => {
	return {
		clusters: state.clusters?.clusters,
		clusterManagementFeature: state.systemStatus?.features?.clustermanagement
	};
};

export default connect(mapStateToProps)(Clusters);
