import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateCluster, updateClusters } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@mui/icons-material/Add';
import RemoveNodeIcon from '@mui/icons-material/RemoveCircle';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import SaveIcon from '@mui/icons-material/Save';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import SelectNodeDialog from './SelectNodeDialog';

const PREFIX = 'ClusterDetail';

const classes = {
    root: `${PREFIX}-root`,
    paper: `${PREFIX}-paper`,
    form: `${PREFIX}-form`,
    textField: `${PREFIX}-textField`,
    buttons: `${PREFIX}-buttons`,
    margin: `${PREFIX}-margin`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const StyledRedirect = styled(Redirect)((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
		width: '100%'
	},

    [`& .${classes.paper}`]: {
		padding: '15px'
	},

    [`& .${classes.form}`]: {
		// display: 'flex',
		flexWrap: 'wrap'
	},

    [`& .${classes.textField}`]: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
	},

    [`& .${classes.buttons}`]: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},

    [`& .${classes.margin}`]: {
		margin: theme.spacing(1)
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

const clusterShape = PropTypes.shape({
	clustername: PropTypes.string,
});

const ClusterDetail = (props) => {

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

	const addNodeToCluster = async (nodeId, privateIPAddress) => {
		try {
			await brokerClient.joinCluster(cluster.clustername, nodeId, privateIPAddress);
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
						{/* <Grid item xs={12} sm={12}>
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
						</Grid> */}
						<br/>
					</Grid>
					<br/>
					<Grid container spacing={1} alignItems="flex-end">
						{cluster?.nodes?.map((node, index) => 
							<Grid item xs={12} md={4}>
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
														id={node?.nodeid}
														label="Node ID"
														value={node?.nodeid}
														defaultValue=""
														variant="outlined"
														fullWidth
														className={classes.textField}
													/>
												</Grid>
												<Grid item xs={12}>
													<TextField
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
														disabled={true}
														id={node?.port}
														label="Port"
														value={node?.port}
														defaultValue=""
														variant="outlined"
														fullWidth
														className={classes.textField}
													/>
												</Grid>
												{/* <Grid item xs={12}>
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
												</Grid> */}
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
				handleAddNode={(nodeId, privateIPAddress) => addNodeToCluster(nodeId, privateIPAddress)}
				cluster={cluster}
			/>
		</Paper>
	</div>) : (
		<StyledRedirect to="/admin/clusters" push />
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
