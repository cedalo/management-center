import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import {green, red} from '@material-ui/core/colors';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import {makeStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import ErrorIcon from '@material-ui/icons/Error';
import FollowerIcon from '@material-ui/icons/People';
import LeaderIcon from '@material-ui/icons/Person';
import RemoveNodeIcon from '@material-ui/icons/RemoveCircle';
import SaveIcon from '@material-ui/icons/Save';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {Redirect} from 'react-router-dom';
import ContainerBox from '../../../components/ContainerBox';
import ContainerBreadCrumbs from '../../../components/ContainerBreadCrumbs';
import ContainerHeader from '../../../components/ContainerHeader';
import ContentContainer from '../../../components/ContentContainer';
import WaitDialog from '../../../components/WaitDialog';
import {WebSocketContext} from '../../../websockets/WebSocket';
import {updateCluster, updateClusters} from '../actions/actions';
import SelectNodeDialog from './SelectNodeDialog';

const clusterShape = PropTypes.shape({
	clustername: PropTypes.string,
});

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%'
	},
}));

const getNodeIcon = (node) => {
	if (node?.error) {
		return <Tooltip title={node.error.message} aria-label="FailedNode">
			<ErrorIcon style={{color: red[500]}}/>
		</Tooltip>
	} else {
		if (node?.leader) {
			return <Tooltip title="Leader" aria-label="Leader">
				<LeaderIcon style={{color: green[500]}}/>
			</Tooltip>
		} else {
			return <Tooltip title="Follower" aria-label="Follower">
				<FollowerIcon/>
			</Tooltip>
		}
	}
}

const ClusterDetail = (props) => {
	const classes = useStyles();
	const [value, setValue] = React.useState(0);
	const [editMode, setEditMode] = React.useState(false);
	const [selectNodeDialogOpen, setSelectNodeDialogOpen] = React.useState(false);
	const [progressDialogOpen, setProgressDialogOpen] = React.useState(false);
	const {enqueueSnackbar} = useSnackbar();

	const {cluster} = props;
	const [updatedCluster, setUpdatedCluster] = React.useState({
		...cluster,
	});

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const {client: brokerClient} = context;

	const validate = () => {
		if (editMode) {
			return updatedCluster.clustername !== '';
		}
	};

	const addNodeToCluster = async (node) => {
		setSelectNodeDialogOpen(false);
		setProgressDialogOpen(true);
		try {
			await brokerClient.joinCluster(cluster.clustername, node);
			enqueueSnackbar('Node successfully added to cluster', {
				variant: 'success'
			});
			const clusterObject = await brokerClient.getCluster(cluster.clustername);
			dispatch(updateCluster(clusterObject));
			setUpdatedCluster({
				...clusterObject
			});
			const clusters = await brokerClient.listClusters();
			dispatch(updateClusters(clusters));
		} catch (error) {
			enqueueSnackbar(`Error adding node "${node.nodeId}" to cluster. Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
		setProgressDialogOpen(false);
	}

	const removeNodeFromCluster = async (nodeId) => {
		await confirm({
			title: 'Confirm node removal',
			description: `Do you really want to remove the node "${nodeId}" from this cluster?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});

		setProgressDialogOpen(true);
		try {
			await brokerClient.leaveCluster(cluster.clustername, nodeId);
			enqueueSnackbar('Node successfully removed from cluster', {
				variant: 'success'
			});
			const clusterObject = await brokerClient.getCluster(cluster.clustername);
			dispatch(updateCluster(clusterObject));
			setUpdatedCluster({
				...clusterObject
			});
			const clusters = await brokerClient.listClusters();
			dispatch(updateClusters(clusters));
		} catch (error) {
			enqueueSnackbar(`Error removing node "${nodeId}" from cluster. Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
		setProgressDialogOpen(false);
	}

	const onUpdateClusterDetail = async () => {
		await brokerClient.modifyCluster(updatedCluster);
		enqueueSnackbar('Cluster successfully updated', {
			variant: 'success'
		});
		const clusterObject = await brokerClient.getCluster(updatedCluster.clustername);
		dispatch(updateCluster(clusterObject));
		const clusters = await brokerClient.listClusters();
		dispatch(updateClusters(clusters));
		setEditMode(false);
	};

	const onEnableLTS = async (cluster, node) => {
		// TODO
	};

	const onDisableLTS = async (cluster, node) => {
		// TODO
	};

	const onCancelEdit = async () => {
		await confirm({
			title: 'Cancel cluster editing',
			description: `Do you really want to cancel editing this cluster?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		setUpdatedCluster({
			...cluster
		});
		setEditMode(false);
	};

	const getSyncModeLabel = (mode) => {
		return mode === 'dynsec' ? 'Dynamic Security Sync' : 'Full Sync';
	};

	return cluster ? [
		<ContentContainer
			breadCrumbs={<ContainerBreadCrumbs title={updatedCluster?.clustername}
											   links={[{name: 'Home', route: '/home'}, {
												   name: 'Cluster',
												   route: '/clusters'
											   }]}/>}
			overFlowX="hidden"
		>
			<ContainerHeader
				title={`Edit Cluster: ${updatedCluster?.clustername}`}
				subTitle="View cluster settings and the assigned broker settings. Click on Edit to change the settings or add an additional broker."
			/>
			<FormGroup>
				<Grid container spacing={2} alignItems="flex-end">
					<Grid item xs={12} sm={4}>
						<TextField
							size="small"
							margin="normal"
							required={editMode}
							disabled={true}
							id="clustername"
							label="Name"
							value={updatedCluster?.clustername}
							defaultValue=""
							variant="outlined"
							fullWidth
							className={classes.textField}
						/>
					</Grid>
					<Grid item xs={12} sm={5}>
						<TextField
							size="small"
							margin="normal"
							disabled={!editMode}
							id="description"
							label="Description"
							value={updatedCluster?.description}
							onChange={(event) => {
								if (editMode) {
									setUpdatedCluster({
										...updatedCluster,
										description: event.target.value
									});
								}
							}}
							defaultValue=""
							variant="outlined"
							fullWidth
							className={classes.textField}
						/>
					</Grid>
					<Grid item xs={12} sm={3}>
						<TextField
							size="small"
							disabled={true}
							margin="normal"
							id="syncmode"
							label="Sync Mode"
							value={getSyncModeLabel(cluster.syncmode)}
							defaultValue="full"
							variant="outlined"
							fullWidth
							className={classes.textField}
						/>
					</Grid>
					{cluster?.nodes?.map((node, index) =>
						<Grid item xs={12} sm={4}>
							<Card variant="outlined">
								<CardHeader
									avatar={getNodeIcon(node)}
									subheader={node.broker}
								/>
								<CardContent style={{paddingTop: '0px'}}>
									<Grid container spacing={1} alignItems="flex-end">
										<Grid item xs={12}>
											<TextField
												size="small"
												margin="dense"
												disabled={true}
												id={node?.nodeId}
												label="Node ID"
												value={node?.nodeId}
												defaultValue=""
												variant="outlined"
												fullWidth
											/>
										</Grid>
										<Grid item xs={12}>
											<TextField
												size="small"
												margin="dense"
												disabled={true}
												id={node?.address}
												label="Address"
												value={node?.address}
												defaultValue=""
												variant="outlined"
												fullWidth
												className={classes.textField}
											/>
										</Grid>
										<Grid item xs={12}>
											<TextField
												size="small"
												margin="dense"
												disabled={true}
												label="Port"
												value={node?.port}
												defaultValue=""
												variant="outlined"
												fullWidth
												className={classes.textField}
											/>
										</Grid>
									</Grid>
								</CardContent>
								<CardActions>
									<Button
										disabled={!editMode || cluster?.nodes?.length <= 3}
										size="small"
										onClick={() => removeNodeFromCluster(node.broker)}
										startIcon={<RemoveNodeIcon/>}
									>
										Remove
									</Button>
								</CardActions>
							</Card>
						</Grid>
					)}
				</Grid>
				{!editMode && (
					<Grid item xs={12}>
						<Button
							variant="contained"
							style={{marginTop: '20px'}}
							size="small"
							color="primary"
							startIcon={<EditIcon/>}
							onClick={() => setEditMode(true)}
						>
							Edit
						</Button>
					</Grid>
				)}
				{editMode && [
					<div style={{display: 'flex', marginTop: '10px', justifyContent: 'space-between'}}>
						<Grid item xs={12}>
							<Button
								variant="contained"
								size="small"
								disabled={!validate()}
								color="primary"
								style={{marginRight: '10px', marginTop: '10px'}}
								startIcon={<SaveIcon/>}
								onClick={(event) => {
									event.stopPropagation();
									onUpdateClusterDetail();
								}}
							>
								Save
							</Button>
							<Button
								variant="contained"
								style={{marginTop: '10px'}}
								size="small"
								onClick={(event) => {
									event.stopPropagation();
									onCancelEdit();
								}}
							>
								Cancel
							</Button>
						</Grid>
						<div>
							<Button
								variant="contained"
								size="small"
								color="primary"
								style={{marginTop: '10px', width: '120px'}}
								startIcon={<AddIcon/>}
								onClick={() => setSelectNodeDialogOpen(true)}
							>
								Add Node
							</Button>
						</div>
					</div>
				]
				}
			</FormGroup>
		</ContentContainer>,
		<SelectNodeDialog
			open={selectNodeDialogOpen}
			handleClose={() => setSelectNodeDialogOpen(false)}
			handleAddNode={(node) => addNodeToCluster(node)}
			cluster={cluster}
		/>,
		<WaitDialog
			title='Update process of your cluster is in process'
			open={progressDialogOpen}
			handleClose={() => setProgressDialogOpen(false)}
		/>
	] : (
		<Redirect to="/clusters" push/>
	);
};

ClusterDetail.propTypes = {
	cluster: clusterShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		cluster: state.clusters?.cluster,
	};
};

export default connect(mapStateToProps)(ClusterDetail);
