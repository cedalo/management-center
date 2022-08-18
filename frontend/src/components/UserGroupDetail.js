import React, { useContext, useState } from 'react';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';

import { useSnackbar } from 'notistack';

import AccountCircle from '@material-ui/icons/AccountCircle';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import SaveIcon from '@material-ui/icons/Save';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';

import { updateUserGroup, updateUserGroups } from '../admin/users/actions/actions';
import MenuItem from '@material-ui/core/MenuItem';



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

const UserGroupDetail = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;


	const roles = props.roles;
    const group = props.userGroup || {};


	const [editMode, setEditMode] = React.useState(false);
	const [updatedGroup, setUpdatedGroup] = React.useState({});

	React.useEffect(() => {
		setUpdatedGroup({...props.userGroup});
	}, [props.userGroup]);

	const validate = () => {
		const valid = updatedGroup.name !== '' && updatedGroup.role !== '';
		return valid;
	};

	const onUpdateGroup = async () => {
		const groups = await brokerClient.updateUserGroup(updatedGroup);
		enqueueSnackbar('Group successfully updated', {
			variant: 'success'
		});
		const groupObject = groups[updatedGroup.name];
		dispatch(updateUserGroup({...groupObject}));
		dispatch(updateUserGroups(groups));
		setEditMode(false);
	};

	const onCancelEdit = async () => {
		await confirm({
			title: 'Cancel group editing',
			description: `Do you really want to cancel editing this group?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		setUpdatedGroup({
			...group
		});
		setEditMode(false);
	};

	return props.userGroup.name ? (<div className={classes.root}>
			<Breadcrumbs maxItems={2} aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/admin">
					Admin
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/admin/user-groups">
					User Groups
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					{updatedGroup.name}
				</Typography>
			</Breadcrumbs>
			<br />
			<Paper className={classes.paper}>
				<form className={classes.form} noValidate autoComplete="off">
					<div className={classes.margin}>
						<Grid container spacing={1} alignItems="flex-end">
							<Grid item xs={12}>
								<TextField
									required
									disabled
									onChange={(event) => {
										if (editMode) {
											setUpdatedGroup({
												...updatedGroup,
												name: event.target.value
											});
										}
									}}
									id="groupname"
									value={updatedGroup.name}
									label="Groupname"
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<AccountCircle />
											</InputAdornment>
										)
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									disabled={!editMode}
									select
									fullWidth
									name="role-select"
									id="role-select"
									variant="outlined"
									helperText="Role of the users in the group (required)"
									label="Role *"
									value={updatedGroup.role || props.userGroup.name}
									onChange={(event) => {
										if (editMode) {
											setUpdatedGroup({
												...updatedGroup,
												role: event.target.value
											});
										}
									}}
									className={classes.textField}
								>
									{roles.map((role) => (
										<MenuItem
											key={role}
											value={role}
										>
											{role}
										</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid item xs={12}>
								<TextField
									disabled={!editMode}
									onChange={(event) => {
										if (editMode) {
											setUpdatedGroup({
												...updatedGroup,
												description: event.target.value
											});
										}
									}}
									id="textdescription"
									label="Text description"
									value={updatedGroup.description}
									//   onChange={(event) => setTextDescription(event.target.value)}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
								/>
							</Grid>
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
					<Grid item xs={12} className={classes.buttons}>
						<Button
							variant="contained"
							disabled={!validate()}
							color="primary"
							className={classes.button}
							startIcon={<SaveIcon />}
							onClick={(event) => {
								event.stopPropagation();
								onUpdateGroup();
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
				)}
			</Paper>
		</div>
	) : (
		<Redirect to="/admin/user-groups" push />
	);
};


const mapStateToProps = (state) => {
	return {
		// TODO: check object hierarchy
		userGroup: state.userGroups && state.userGroups.userGroup,
		roles: state.userRoles && state.userRoles.userRoles
	};
};

export default connect(mapStateToProps)(UserGroupDetail);
