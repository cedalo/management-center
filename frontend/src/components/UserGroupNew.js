import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import UsersIcon from '@material-ui/icons/People';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import React, {useContext, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateUserGroups} from '../admin/users/actions/actions';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBox from './ContainerBox';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import SaveCancelButtons from './SaveCancelButtons';
import {useFormStyles} from '../styles';

const UserGroupNew = (props) => {
	const [groupname, setGroupname] = useState('');
	const [role, setRole] = useState('');
	const roles = props.roles;
	const [textdescription, setTextdescription] = useState('');
	const {enqueueSnackbar} = useSnackbar();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const {client} = context;
	const formClasses = useFormStyles();

	const validate = () => {
		return (groupname !== '' && role !== '');
	};

	const onSaveGroup = async () => {
		try {
			history.push(`/user-groups`);
			const userGroups = await client.createUserGroup(groupname, role, textdescription);
			dispatch(updateUserGroups(userGroups));
			enqueueSnackbar(`User group "${groupname}" successfully created.`, {
				variant: 'success'
			});
		} catch (error) {
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
		<ContainerBox>
			<ContainerBreadCrumbs title="New" links={[{name: 'Home', route: '/home'},
				{name: 'User Groups', route: '/user-groups'}
			]}/>
			<ContainerHeader
				title="New User Group"
				subTitle="Create a new user group by entering a unique group name and assigning a role."
			/>
			<Grid container spacing={1} alignItems="flex-end">
				<Grid item xs={12}>
					<TextField
						error={!!props?.userGroups[groupname]}
						required
						id="groupname"
						label="Name"
						onChange={(event) => setGroupname(event.target.value)}
						defaultValue=""
						variant="outlined"
						fullWidth
						className={formClasses.textField}
						size="small"
						margin="dense"
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<UsersIcon/>
								</InputAdornment>
							)
						}}
					/>
				</Grid>
				<Grid item xs={12}>
					<TextField
						id="textdescription"
						label="Description"
						onChange={(event) => setTextdescription(event.target.value)}
						defaultValue=""
						variant="outlined"
						fullWidth
						className={formClasses.textField}
						size="small"
						margin="dense"
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
						label="Role of the users in the group"
						onChange={(event) => setRole(event.target.value)}
						className={formClasses.textField}
						size="small"
						margin="dense"
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
			</Grid>
			<Grid container xs={12} alignItems="flex-start">
				<Grid item xs={12}>
					<SaveCancelButtons
						onSave={onSaveGroup}
						saveDisabled={!validate()}
						onCancel={onCancel}
					/>
				</Grid>
			</Grid>
		</ContainerBox>
	);
};

const mapStateToProps = (state) => {
	return {
		userGroups: state.userGroups && state.userGroups.userGroups,
		roles: state.userRoles && state.userRoles.userRoles
	};
};

export default connect(mapStateToProps)(UserGroupNew);
