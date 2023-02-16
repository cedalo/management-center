import React, { useContext, useState } from 'react';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateUser, updateUsers } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AccountCircle from '@material-ui/icons/AccountCircle';
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
import { WebSocketContext } from '../../../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import AutoSuggest from '../../../components/AutoSuggest';


const PASSWORD_ERROR_MESSAGE = 'Password should not be empty';

const userShape = PropTypes.shape({
	username: PropTypes.string,
	roles: PropTypes.array
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
		flexWrap: 'wrap',
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
		margin: theme.spacing(1),
		maxWidth: theme.spacing(115),
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const UserDetail = (props) => {
	const classes = useStyles();
	const [value, setValue] = React.useState(0);
	const [editMode, setEditMode] = React.useState(false);
	const { enqueueSnackbar } = useSnackbar();
	const ref = React.useRef();
	const [passwordError, setPasswordError] = React.useState(null); 

	React.useEffect(() => {
		if (document.hasFocus() && ref.current?.contains(document.activeElement)) {
			if (!ref.current.value) {
				setPasswordError(PASSWORD_ERROR_MESSAGE);
			}
		}
	}, []);

	const { user, userRoles = [], backendParameters } = props;
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
		if (passwordError) {
			return false;
		}
		if (editMode) {
			return updatedUser.username !== '';
		}
	};

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const onUpdateUserDetail = async () => {
		try {
			await brokerClient.updateUser(updatedUser);
			enqueueSnackbar('User successfully updated', {
				variant: 'success'
		})
		} catch (error) {
			enqueueSnackbar(`Error updating user "${updatedUser.username}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error;
		}
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

	return user ? (<div>
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
				<Grid container spacing={1} alignItems="flex-end" className={classes.margin}>
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
					{backendParameters.ssoUsed ?
						null
					:
						<>
							<Grid item xs={12}>
								<TextField
									disabled={!editMode}
									required
									id="password"
									label="Password"
									helperText={passwordError || "You can change the password here, empty password will be ignored"}
									value={updatedUser?.password}
									defaultValue=""
									variant="outlined"
									fullWidth
									type="password"
									className={classes.textField}
									onChange={(event) => {
										if (event.target.value) {
											setPasswordError(null);
										} else {
											setPasswordError(PASSWORD_ERROR_MESSAGE);
										}
										if (editMode) {
											setUpdatedUser({
												...updatedUser,
												password: event.target.value
											});
										}
									}}
									error={!!passwordError}
									onFocus={() => {
										if (!updatedUser?.password) {
											setPasswordError(PASSWORD_ERROR_MESSAGE);
										}
									}}
									onBlur={() => {
										setPasswordError(null);
									}}
									inputRef={ref}
								/>
							</Grid>
						</>
					}
					<Grid item xs={12} style={{paddingTop: '10px'}}>
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
	</div>) : null;
};

UserDetail.propTypes = {
	user: userShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		user: state.users?.user,
		userRoles: state.userRoles?.userRoles,
		backendParameters: state.backendParameters?.backendParameters,
	};
};

export default connect(mapStateToProps)(UserDetail);
