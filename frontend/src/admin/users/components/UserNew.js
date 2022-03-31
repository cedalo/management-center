import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import { updateUser, updateUsers } from '../actions/actions';
import { useSnackbar } from 'notistack';

import { Alert, AlertTitle } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import ClientIDIcon from '@mui/icons-material/Fingerprint';
import ClientIcon from '@mui/icons-material/Person';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import PasswordIcon from '@mui/icons-material/VpnKey';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import AutoSuggest from '../../../components/AutoSuggest';
import SaveCancelButtons from '../../../components/SaveCancelButtons';

const PREFIX = 'UserNew';

const classes = {
    root: `${PREFIX}-root`,
    buttons: `${PREFIX}-buttons`,
    form: `${PREFIX}-form`,
    textField: `${PREFIX}-textField`,
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
		'& > *': {
			margin: theme.spacing(1)
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
			width: '75ch'
		}
	},

    [`& .${classes.buttons}`]: {
		'& > *': {
			margin: theme.spacing(1)
		}
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

    [`& .${classes.margin}`]: {
		margin: theme.spacing(2)
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

const UserNew = (props) => {
	const { users, userRoles = [], userManagementFeature } = props;


	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirm, setPasswordConfirm] = useState('');
	const [roles, setRoles] = useState([]);

	const roleSuggestions = userRoles
		.sort()
		.map((rolename) => ({
			label: rolename,
			value: rolename
		}));

	const usernameExists = props?.users?.find((searchUser) => {
		return searchUser.username === username;
	});

	const passwordsMatch = password === passwordConfirm;

	const validate = () => {
		const valid = passwordsMatch && !usernameExists && username !== '' && password !== '';
		return valid;
	};

	const { enqueueSnackbar } = useSnackbar();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { client } = context;

	const onSaveUser = async () => {
		try {
			await client.createUser(username, password, roles);
			const users = await client.listUsers();
			dispatch(updateUsers(users));
			history.push(`/admin/users`);
			enqueueSnackbar(`User "${username}" successfully created.`, {
				variant: 'success'
			});
		} catch (error) {
			enqueueSnackbar(`Error creating user "${username}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error;
		}
	};

	const onCancel = async () => {
		await confirm({
			title: 'Cancel user creation',
			description: `Do you really want to cancel creating this user?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		history.goBack();
	};

	return (
        <Root>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security">
					Admin
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Users
				</Typography>
			</Breadcrumbs>
			<br />
			{/* TODO: Quick hack to detect whether feature is supported */}
			{userManagementFeature?.error ? <><br /><Alert severity="warning">
				<AlertTitle>{userManagementFeature.error.title}</AlertTitle>
				{userManagementFeature.error.message}
			</Alert></> : null}
			{!userManagementFeature?.error && <div className={classes.root}>
				<Paper>
					<form className={classes.form} noValidate autoComplete="off">
						<div className={classes.margin}>
							<Grid container spacing={1} alignItems="flex-end">
								<Grid item xs={12}>
									<TextField
										error={usernameExists}
										helperText={usernameExists && 'A user with this username already exists.'}
										required
										id="username"
										label="User name"
										onChange={(event) => setUsername(event.target.value)}
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
								<Grid item xs={12}>
									<AutoSuggest
										placeholder="Select roles..."
										suggestions={roleSuggestions}
										values={roles?.map((role) => ({
											label: role,
											value: role
										}))}
										handleChange={(value) => {
											setRoles(value.map((role) => role.value));
										}}
									/>
								</Grid>
								<Grid container xs={12} alignItems="flex-start">
									<Grid item xs={12} className={classes.buttons}>
										<SaveCancelButtons
											onSave={onSaveUser}
											saveDisabled={!validate()}
											onCancel={onCancel}
										/>
									</Grid>
								</Grid>
							</Grid>
						</div>
					</form>
				</Paper>
			</div>}
		</Root>
    );
};

const mapStateToProps = (state) => {
	return {
		userRoles: state.userRoles?.userRoles,
		users: state.users?.users,
		userManagementFeature: state.systemStatus?.features?.usermanagement,
	};
};

export default connect(mapStateToProps)(UserNew);
