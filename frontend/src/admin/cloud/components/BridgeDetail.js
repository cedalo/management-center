import React, { useContext, useState } from 'react';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateBridge, updateBridges } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@material-ui/icons/Add';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import SaveIcon from '@material-ui/icons/Save';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import WaitDialog from '../../../components/WaitDialog';

const bridgeShape = PropTypes.shape({
	bridgename: PropTypes.string,
});

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%'
	},
	paper: {
		padding: '15px'
	},
	form: {
		// display: 'flex',
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

const BridgeDetail = (props) => {
	const classes = useStyles();
	const [value, setValue] = React.useState(0);
	const [editMode, setEditMode] = React.useState(false);
	const [progressDialogOpen, setProgressDialogOpen] = React.useState(false);
	const { enqueueSnackbar } = useSnackbar();

	const { bridge } = props;
	const [updatedBridge, setUpdatedBridge] = React.useState({
		...bridge,
	});

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const { client: brokerClient } = context;

	const validate = () => {
		if (editMode) {
			return updatedBridge.bridgename !== '';
		}
	};


	const onUpdateBridgeDetail = async () => {
		await brokerClient.modifyBridge(updatedBridge);
		enqueueSnackbar('Bridge successfully updated', {
			variant: 'success'
		});
		const bridgeObject = await brokerClient.getBridge(updatedBridge.bridgename);
		dispatch(updateBridge(bridgeObject));
		const bridges = await brokerClient.listBridges();
		dispatch(updateBridges(bridges));
		setEditMode(false);
	};

	const onCancelEdit = async () => {
		await confirm({
			title: 'Cancel bridge editing',
			description: `Do you really want to cancel editing this bridge?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		setUpdatedBridge({
			...bridge
		});
		setEditMode(false);
	};

	return bridge ? (<div>
		<Breadcrumbs aria-label="breadcrumb">
			<RouterLink className={classes.breadcrumbLink} to="/home">
				Home
			</RouterLink>
			<RouterLink className={classes.breadcrumbLink} color="inherit" to="/admin">
				Admin
			</RouterLink>
			<RouterLink className={classes.breadcrumbLink} to="/admin/cloud/bridges">
				Bridges
			</RouterLink>
			<Typography className={classes.breadcrumbItem} color="textPrimary">
				{bridge.bridgename}
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
								id="bridgename"
								label="bridgename"
								value={updatedBridge?.bridgename}
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
								value={updatedBridge?.description}
								onChange={(event) => {
									if (editMode) {
										setUpdatedBridge({
											...updatedBridge,
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
						<br />
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
								onupdateBridgeDetail();
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
			<WaitDialog
				title='Update process of your bridge is in process'
				open={progressDialogOpen}
				handleClose={() => setProgressDialogOpen(false)}
			/>
		</Paper>
	</div>) : (
		<Redirect to="/admin/cloud/bridges" push />
	);
};

BridgeDetail.propTypes = {
	bridge: bridgeShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		bridge: state.bridges?.bridge,
	};
};

export default connect(mapStateToProps)(BridgeDetail);
