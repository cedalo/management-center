import React, { useContext, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import Paper from '@material-ui/core/Paper';
import { Link as RouterLink } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';

import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import SaveCancelButtons from './SaveCancelButtons';


import UsersIcon from '@material-ui/icons/People';
import MenuItem from '@material-ui/core/MenuItem';
import { updateUserGroups } from '../admin/users/actions/actions';


const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
			margin: theme.spacing(1)
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
			width: '75ch'
		}
	},
	buttons: {
		'& > *': {
			margin: theme.spacing(1)
		}
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
	margin: {
		margin: theme.spacing(2)
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const UserGroupNew = (props) => {
	const classes = useStyles();

	const [groupname, setGroupname] = useState('');
	const [role, setRole] = useState('');

	const roles = props.roles;

	// const [roles, setRoles] = useState([]);
	const [textdescription, setTextdescription] = useState('');

	const { enqueueSnackbar } = useSnackbar();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { client } = context;
    

	const validate = () => {
		const valid = (groupname !== '' && role !== '');
		return valid;
	};


	const onSaveGroup = async () => {
		try {
			history.push(`/admin/user-groups`);
			const userGroups = await client.createUserGroup(groupname, role, textdescription);
			dispatch(updateUserGroups(userGroups));
			enqueueSnackbar(`User group "${groupname}" successfully created.`, {
				variant: 'success'
			});
		} catch(error) {
			enqueueSnackbar(`Error creating user group "${groupname}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error;
		}
	};

	const onCancel = async () => {
		await confirm({
			title: 'Cancel group creation',
			description: `Do you really want to cancel creating this group?`,
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
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security">
					Security
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Groups
				</Typography>
			</Breadcrumbs>
			<br />
			<div className={classes.root}>
				<Paper>
					<form className={classes.form} noValidate autoComplete="off">
						<div className={classes.margin}>
							<Grid container spacing={1} alignItems="flex-end">
								<Grid item xs={12}>
									<TextField
										error={!!props?.userGroups[groupname]}
										// helperText={groupnameExists && 'A group with this name already exists.'}
										required
										id="groupname"
										label="Group Name"
										onChange={(event) => setGroupname(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<UsersIcon />
												</InputAdornment>
											)
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										select
										fullWidth
										name="role-select"
										id="role-select"
										value={role}
										variant="outlined"
										helperText="Role of the users in the group (required)"
										label="Role *"
										onChange={(event) => setRole(event.target.value)}
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
										id="textdescription"
										label="Group's description"
										onChange={(event) => setTextdescription(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid>
								<Grid container xs={12} alignItems="flex-start">
									<Grid item xs={12} className={classes.buttons}>
										<SaveCancelButtons
											onSave={onSaveGroup}
											saveDisabled={!validate()}
											onCancel={onCancel}
										/>
									</Grid>
								</Grid>
							</Grid>
						</div>
					</form>
				</Paper>
			</div>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		userGroups: state.userGroups && state.userGroups.userGroups,
		roles: state.userRoles && state.userRoles.userRoles
	};
};

export default connect(mapStateToProps)(UserGroupNew);
