import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
// import Fab from '@material-ui/core/Fab';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import ContainerBreadCrumbs from '../../../components/ContainerBreadCrumbs';
import ContainerHeader from '../../../components/ContainerHeader';
import ContentContainer from '../../../components/ContentContainer';
import WaitDialog from '../../../components/WaitDialog';
import {WebSocketContext} from '../../../websockets/WebSocket';
import {updateCluster, updateClusters} from '../actions/actions';
import { getSyncModeLabel } from './clusterutils';
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
	}
}));

const CLUSTER_TABLE_COLUMNS = [
	{id: 'name', key: 'Name', align: 'left'},
	{id: 'description', key: 'Description', align: 'left'},
	{id: 'syncmode', key: 'Cluster Mode', align: 'left', width: '15%'},
	{id: 'nodes', key: 'Nodes', align: 'center', width: '5%'},
	{id: 'delete', key: 'Delete', align: 'center', width: '5%'},
];

const createClusterTable = (clusters, classes, props, onCheckHealthStatus, onDeleteCluster, onSelectCluster) => {
	const {clusterManagementFeature, userRoles = [], roles = [], onSort, sortBy, sortDirection} = props;
	const small = useMediaQuery(theme => theme.breakpoints.down('xs'));
	const medium = useMediaQuery(theme => theme.breakpoints.between('sm', 'sm'));

	if (!clusterManagementFeature?.error && clusterManagementFeature?.supported !== false && clusters && clusters.length > 0) {
		return (<TableContainer>
			<Table stickyHeader size="small" aria-label="sticky table">
				<TableHead>
					<TableRow>
						{CLUSTER_TABLE_COLUMNS.map((column) => (
							<TableCell
								key={column.id}
								style={{
									width: column.width,
									display: (!small && !medium) ||
									(column.id === 'name' && (small || medium)) ||
									(column.id === 'nodes' && (small || medium)) ||
									(column.id === 'syncmode' && (small || medium)) ||
									(column.id === 'delete' && (small || medium)) ||
									(column.id === 'description' && medium) ? undefined : 'none'
								}}
								sortDirection={sortBy === column.id ? sortDirection : false}
							>
								{column.key}
							</TableCell>
						))}
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
								style={{cursor: 'pointer'}}
							>
								<TableCell align={CLUSTER_TABLE_COLUMNS[0].align}>{cluster.clustername}</TableCell>
								{small ? null :
									<TableCell
										align={CLUSTER_TABLE_COLUMNS[1].align}>{cluster.description}</TableCell>
								}
								<TableCell
									align={CLUSTER_TABLE_COLUMNS[2].align}>{getSyncModeLabel(cluster.syncmode)}</TableCell>
								<TableCell
									align={CLUSTER_TABLE_COLUMNS[3].align}>{cluster.nodes?.length || 0}</TableCell>
								<TableCell align={CLUSTER_TABLE_COLUMNS[4].align}>
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
											<DeleteIcon fontSize="small"/>
										</IconButton>
									</Tooltip>
								</TableCell>
							</StyledTableRow>
						))}
				</TableBody>
			</Table>
		</TableContainer>);
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
	const {enqueueSnackbar} = useSnackbar();
	const {client: brokerClient} = context;
	const [progressDialogOpen, setProgressDialogOpen] = React.useState(false);
	const {clusterManagementFeature, clusters = [], onSort, sortBy, sortDirection} = props;

	const onSelectCluster = async (clustername, numberOfNodes) => {
		setProgressDialogOpen(true);
		try {
			const cluster = await brokerClient.getCluster(clustername, numberOfNodes);
			dispatch(updateCluster(cluster));
			history.push(`/clusters/${clustername}`);
		} catch (error) {
			enqueueSnackbar(`Cluster loading failed. Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
		setProgressDialogOpen(false);
	};

	const onNewCluster = () => {
		history.push('/clusters/new');
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
			description: `Do you really want to delete cluster "${clustername}"?`
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

	return [
		<ContentContainer
			dataTour="page-clusters"
			breadCrumbs={<ContainerBreadCrumbs title="Clusters" links={[{name: 'Home', route: '/home'}]}/>}
		>
			<ContainerHeader
				title="Clusters"
				subTitle="Clusters enable Mosquitto High Availabiliy. Here you can and modify the cluster setup by creating or deleting a cluster, adding or deleting a node in a cluster and more."
				featureWarning={clusterManagementFeature?.supported === false ? "Clusters" : undefined}
				warnings={() => {
					const alerts = [];
					if (clusterManagementFeature?.error /*&& clusterManagementFeature?.supported === true*/) {
						alerts.push({
							severity: 'warning',
							title: clusterManagementFeature.error.title || 'An error has occured',
							error: clusterManagementFeature.error.message || clusterManagementFeature.error
						});
					}
					return alerts;
				}}
			>
				{!clusterManagementFeature?.error && clusterManagementFeature?.supported !== false &&
					<Button
						variant="outlined"
						color="primary"
						size="small"
						id="new-cluster-button"
						startIcon={<AddIcon/>}
						onClick={(event) => {
							event.stopPropagation();
							onNewCluster();
						}}
					>
						New&nbsp;Cluster
					</Button>}
			</ContainerHeader>
			{createClusterTable(clusters, classes, props, onCheckHealthStatus, onDeleteCluster, onSelectCluster)}
		</ContentContainer>,
		(progressDialogOpen && !clusterManagementFeature?.error && clusterManagementFeature?.supported !== false)
			? <WaitDialog
					title='Loading cluster details'
					message='Note that this can take a while depending on the size and status of your cluster.'
					open={progressDialogOpen}
					handleClose={() => setProgressDialogOpen(false)}
				/>
			: null
		];
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
