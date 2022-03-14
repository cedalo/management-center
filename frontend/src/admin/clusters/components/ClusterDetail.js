import React, { useContext, useState } from 'react';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateCluster, updateClusters } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@material-ui/icons/Add';
import RemoveNodeIcon from '@material-ui/icons/RemoveCircle';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import SaveIcon from '@material-ui/icons/Save';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import SelectNodeDialog from './SelectNodeDialog';

const clusterShape = PropTypes.shape({
	clustername: PropTypes.string,
});

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%'
	},
	paper: {
		padding: '15px'
	},
	form: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	textField: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
	},
	buttons: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},
	margin: {
		margin: theme.spacing(1)
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const ClusterDetail = (props) => {
	const classes = useStyles();
	const [value, setValue] = React.useState(0);
	const [editMode, setEditMode] = React.useState(false);
	const [selectNodeDialogOpen, setSelectNodeDialogOpen] = React.useState(false);
	const { enqueueSnackbar } = useSnackbar();

	const { cluster } = props;
	const [updatedCluster, setUpdatedCluster] = React.useState({
		...cluster,
	});

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const { client: brokerClient } = context;

	const validate = () => {
		if (editMode) {
			return updatedCluster.clustername !== '';
		}
	};

	const addNodeToCluster = async (nodeId) => {
		try {
			await brokerClient.joinCluster(cluster.clustername, nodeId);
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
			enqueueSnackbar(`Error adding node "${nodeId}" to cluster. Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
		setSelectNodeDialogOpen(false);
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

	return cluster ? (<div>
		<Breadcrumbs aria-label="breadcrumb">
			<RouterLink className={classes.breadcrumbLink} to="/home">
				Home
			</RouterLink>
			<RouterLink className={classes.breadcrumbLink} color="inherit" to="/admin">
				Admin
			</RouterLink>
			<RouterLink className={classes.breadcrumbLink} to="/admin/clusters">
				Clusters
			</RouterLink>
			<Typography className={classes.breadcrumbItem} color="textPrimary">
				{cluster.clustername}
			</Typography>
		</Breadcrumbs>
		<br />
		<Paper className={classes.paper}>
			<form className={classes.form} noValidate autoComplete="off">
				<div className={classes.margin}>
					<Grid container spacing={1} alignItems="flex-end">
						<Grid item xs={12} sm={4}>
							<TextField
								required={editMode}
								disabled={true}
								id="clustername"
								label="Clustername"
								value={updatedCluster?.clustername}
								defaultValue=""
								variant="outlined"
								fullWidth
								className={classes.textField}
							/>
						</Grid>
						<Grid item xs={12} sm={8}>
							<TextField
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
						<Grid item xs={12} sm={12}>
							<TextField
								disabled
								id="backend-username"
								label="Backend Username"
								value={cluster?.backendhosts[0]?.username}
								defaultValue=""
								variant="outlined"
								fullWidth
								className={classes.textField}
							/>
						</Grid>
						<Grid item xs={12} sm={12}>
							<TextField
								disabled
								type="password"
								id="backend-password"
								label="Backend Password"
								value={cluster?.backendhosts[0]?.password}
								defaultValue=""
								variant="outlined"
								fullWidth
								className={classes.textField}
							/>
						</Grid>
						<Grid item xs={12} sm={8}>
							<TextField
								disabled
								id="backend-hostname"
								label="Backend Hostname"
								value={cluster?.backendhosts[0]?.hostname}
								defaultValue=""
								variant="outlined"
								fullWidth
								className={classes.textField}
							/>
						</Grid>
						<Grid item xs={12} sm={4}>
							<TextField
								disabled
								id="backend-port"
								label="Backend Port"
								value={cluster?.backendhosts[0]?.port}
								defaultValue=""
								variant="outlined"
								fullWidth
								className={classes.textField}
							/>
						</Grid>
						<br/>
					</Grid>
					<br/>
					<Grid container spacing={1} alignItems="flex-end">
						{cluster?.nodes?.map((node, index) => 
							<Grid item xs={12} sm={4}>
								<Card variant="outlined">
									<CardHeader
										subheader={node.id}
									/>
									<CardContent>
										<Grid container spacing={1} alignItems="flex-end">
												{/* <Grid item xs={12}>
													<TextField
														disabled={true}
														id={node.id}
														label="Name"
														value={node?.id}
														defaultValue=""
														variant="outlined"
														fullWidth
														className={classes.textField}
													/>
												</Grid> */}
												<Grid item xs={12}>
													<TextField
														disabled={true}
														id={node?.connection?.url}
														label="URL"
														value={node?.connection?.url}
														defaultValue=""
														variant="outlined"
														fullWidth
														className={classes.textField}
													/>
												</Grid>
												<Grid item xs={12}>
													<TextField
														disabled={true}
														id={node.ha?.nodeid}
														label="Node ID"
														value={node.ha?.nodeid}
														defaultValue=""
														variant="outlined"
														fullWidth
														className={classes.textField}
													/>
												</Grid>
												<Grid item xs={12}>
													<TextField
														disabled={true}
														id={`${node.id}-redis-hostname`}
														label="Redis Host"
														value={node.ha?.backendhosts[0]?.hostname}
														defaultValue=""
														variant="outlined"
														fullWidth
														className={classes.textField}
													/>
												</Grid>
												<Grid item xs={12}>
													<TextField
														disabled={true}
														id={`${node.id}-redis-port`}
														label="Redis Port"
														value={node.ha?.backendhosts[0]?.port}
														defaultValue=""
														variant="outlined"
														fullWidth
														className={classes.textField}
													/>
												</Grid>
												{/* <Grid item xs={12}>
													<Tooltip title="Use LTS">
														<FormControlLabel
															disabled={!editMode}
															control={
																<Switch
																	disabled={!editMode}
																	checked={
																		node.ha?.uselts
																	}
																	onClick={(event) => {
																		event.stopPropagation();
																		if (event.target.checked) {
																			onEnableLTS(cluster, node);
																		} else {
																			onDisableLTS(cluster, node);
																		}
																	}}
																/>
															}
															label="Use LTS" 
														/>
													</Tooltip>
												</Grid> */}
										</Grid>
									</CardContent>
									<CardActions>
										<Button
											disabled={!editMode}
											size="small"
											onClick={() => removeNodeFromCluster(node.id)}
											startIcon={<RemoveNodeIcon />}
										>
											Remove
										</Button>
									</CardActions>
								</Card>
							</Grid>
						)}
					</Grid>
				</div>
			</form>
			{!editMode && (
				<Grid item xs={12} className={classes.buttons}>
					<Button
						variant="contained"
						color="primary"
						className={classes.button}
						startIcon={<EditIcon />}
						onClick={() => setEditMode(true)}
					>
						Edit
					</Button>
				</Grid>
			)}
			{editMode && (
				<>
					<Grid item xs={12} className={classes.buttons}>
						<Button
							variant="contained"
							color="primary"
							className={classes.button}
							startIcon={<AddIcon />}
							onClick={() => setSelectNodeDialogOpen(true)}
						>
							Add node
						</Button>
					</Grid>
					<Grid item xs={12} className={classes.buttons}>
						<Button
							variant="contained"
							disabled={!validate()}
							color="primary"
							className={classes.button}
							startIcon={<SaveIcon />}
							onClick={(event) => {
								event.stopPropagation();
								onUpdateClusterDetail();
							}}
						>
							Save
						</Button>
						<Button
							variant="contained"
							onClick={(event) => {
								event.stopPropagation();
								onCancelEdit();
							}}
						>
							Cancel
						</Button>
					</Grid>
				</>
			)}
			<SelectNodeDialog
				open={selectNodeDialogOpen}
				handleClose={() => setSelectNodeDialogOpen(false)}
				handleAddNode={(nodeId) => addNodeToCluster(nodeId)}
				cluster={cluster}
			/>
		</Paper>
	</div>) : (
		<Redirect to="/admin/clusters" push />
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
