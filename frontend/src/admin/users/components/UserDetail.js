import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateUser, updateUsers } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AccountCircle from '@mui/icons-material/AccountCircle';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import AutoSuggest from '../../../components/AutoSuggest';

const PREFIX = 'UserDetail';

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

const Root = styled('div')((
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
		display: 'flex',
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

const userShape = PropTypes.shape({
	username: PropTypes.string,
	roles: PropTypes.array
});

const UserDetail = (props) => {

	const [value, setValue] = React.useState(0);
	const [editMode, setEditMode] = React.useState(false);
	const { enqueueSnackbar } = useSnackbar();

	const { user, userRoles = [] } = props;
	if (user) {
		user.password = null;
	}
	const [updatedUser, setUpdatedUser] = React.useState({
		...user,
	});

	const roleSuggestions = userRoles
		.sort()
		.map((rolename) => ({
			label: rolename,
			value: rolename
		}));

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const { client: brokerClient } = context;

	const validate = () => {
		if (editMode) {
			return updatedUser.username !== '';
		}
	};

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const onUpdateUserDetail = async () => {
		await brokerClient.updateUser(updatedUser);
		enqueueSnackbar('User successfully updated', {
			variant: 'success'
		});
		const userObject = await brokerClient.getUser(updatedUser.username);
		dispatch(updateUser(userObject));
		const users = await brokerClient.listUsers();
		dispatch(updateUsers(users));
		setEditMode(false);
	};

	const onCancelEdit = async () => {
		await confirm({
			title: 'Cancel user editing',
			description: `Do you really want to cancel editing this user?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		setUpdatedUser({
			...user
		});
		setEditMode(false);
	};

	return user ? (<Root>
		<Breadcrumbs aria-label="breadcrumb">
			<RouterLink className={classes.breadcrumbLink} to="/home">
				Home
			</RouterLink>
			<RouterLink className={classes.breadcrumbLink} color="inherit" to="/admin">
				Admin
			</RouterLink>
			<RouterLink className={classes.breadcrumbLink} to="/admin/users">
				Users
			</RouterLink>
			<Typography className={classes.breadcrumbItem} color="textPrimary">
				{user.username}
			</Typography>
		</Breadcrumbs>
		<br />
		<Paper className={classes.paper}>
			<form className={classes.form} noValidate autoComplete="off">
				<div className={classes.margin}>
					<Grid container spacing={1} alignItems="flex-end">
						<Grid item xs={12}>
							<TextField
								required={editMode}
								disabled={true}
								id="username"
								label="username"
								value={updatedUser?.username}
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
								required
								id="password"
								label="Password"
								value={updatedUser?.password}
								defaultValue=""
								variant="outlined"
								fullWidth
								type="password"
								className={classes.textField}
								onChange={(event) => {
									if (editMode) {
										setUpdatedUser({
											...updatedUser,
											password: event.target.value
										});
									}
								}}
							/>
						</Grid>
						<Grid item xs={12}>
							<AutoSuggest
								disabled={!editMode}
								suggestions={roleSuggestions}
								values={updatedUser?.roles?.map((role) => ({
									label: role,
									value: role
								}))}
								handleChange={(value) => {
									if (editMode) {
										setUpdatedUser({
											...updatedUser,
											roles: value.map((role) => role.value)
										});
									}
								}}
							/>
						</Grid>
					</Grid>
				</div>
			</form>
			{!editMode && (
				<Grid item xs={12} className={classes.buttons}>
					<Button
						disabled={updatedUser.editable === false}
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
							onUpdateUserDetail();
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
	</Root>) : null;
};

UserDetail.propTypes = {
	user: userShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		user: state.users?.user,
		userRoles: state.userRoles?.userRoles,
	};
};

export default connect(mapStateToProps)(UserDetail);
