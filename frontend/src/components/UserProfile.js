import React, { useContext, useState } from 'react';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateUserProfile } from '../actions/actions';
import { updateUsers } from '../admin/users/actions/actions';
import { useSnackbar } from 'notistack';

import AccountCircle from '@material-ui/icons/AccountCircle';
import PasswordIcon from '@material-ui/icons/VpnKey';
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
// import AutoSuggest from './AutoSuggest';

const userShape = PropTypes.shape({
	username: PropTypes.string,
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

const UserProfile = (props) => {
	const classes = useStyles();
	const [value, setValue] = React.useState(0);
	const [editMode, setEditMode] = React.useState(false);
	const { enqueueSnackbar } = useSnackbar();

	const { userProfile } = props;
	const [password, setPassword] = useState('');
	const [passwordConfirm, setPasswordConfirm] = useState('');
	const [updatedUser, setUpdatedUser] = React.useState({
		...userProfile,
	});

	const passwordsMatch = password === passwordConfirm;

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const { client: brokerClient } = context;

	const validate = () => {
		if (editMode) {
			return passwordsMatch && updatedUser.username !== '';
		}
	};

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const onUpdateUserProfile = async () => {
		try {
			updatedUser.password = password;
			if (!updatedUser.username) {
				updatedUser.username = userProfile?.username;
			}
			await brokerClient.updateUserProfile(updatedUser);
			enqueueSnackbar('User successfully updated', {
				variant: 'success'
			});
			const userProfileObject = await brokerClient.getUserProfile();
			dispatch(updateUserProfile(userProfileObject));
			const users = await brokerClient.listUsers();
			dispatch(updateUsers(users));
			setEditMode(false);
		} catch (error) {
			enqueueSnackbar(`Error editing user profile. Reason: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
		}
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
			...userProfile
		});
		setEditMode(false);
	};

	return userProfile ? (<div>
		<Breadcrumbs aria-label="breadcrumb">
			<RouterLink className={classes.breadcrumbLink} to="/home">
				Home
			</RouterLink>
			<Typography className={classes.breadcrumbItem} color="textPrimary">
				Profile
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
								value={editMode ? updatedUser?.username : userProfile.username}
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
								required
								disabled={!editMode}
								id="password"
								label="Password"
								error={!passwordsMatch}
								helperText={!passwordsMatch && 'Passwords must match.'}
								onChange={(event) => setPassword(event.target.value)}
								defaultValue=""
								variant="outlined"
								fullWidth
								type="password"
								className={classes.textField}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<PasswordIcon />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								disabled={!editMode}
								id="password-confirm"
								label="Password Confirm"
								error={!passwordsMatch}
								helperText={!passwordsMatch && 'Passwords must match.'}
								onChange={(event) => setPasswordConfirm(event.target.value)}
								defaultValue=""
								variant="outlined"
								fullWidth
								type="password"
								className={classes.textField}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<PasswordIcon />
										</InputAdornment>
									)
								}}
							/>
						</Grid>
						{/* <Grid item xs={12}>
							<AutoSuggest
								disabled
								values={userProfile?.roles?.map((role) => ({
									label: role,
									value: role
								}))}
							/>
						</Grid> */}
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
							onUpdateUserProfile();
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
	</div>) : null;
};

UserProfile.propTypes = {
	userProfile: userShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		userProfile: state.userProfile?.userProfile,
	};
};

export default connect(mapStateToProps)(UserProfile);
