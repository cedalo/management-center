import FormGroup from '@material-ui/core/FormGroup';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import UsersIcon from '@material-ui/icons/People';
import {useSnackbar} from 'notistack';
import React, {useContext, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateUserGroups} from '../admin/users/actions/actions';
import {useFormStyles} from '../styles';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
import SaveCancelButtons from './SaveCancelButtons';

const UserGroupNew = (props) => {
	const [groupname, setGroupname] = useState('');
	const [role, setRole] = useState('');
	const roles = props.roles;
	const [textdescription, setTextdescription] = useState('');
	const {enqueueSnackbar} = useSnackbar();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirmCancel = useConfirmCancel();
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
		await confirmCancel({
			title: 'Cancel group creation',
			description: `Do you really want to cancel creating this group?`
		});
		history.goBack();
	};

	return (
		<ContentContainer
			breadCrumbs={<ContainerBreadCrumbs title="New" links={[{name: 'Home', route: '/home'},
				{name: 'User Groups', route: '/user-groups'}
			]}/>}
		>
			<ContainerHeader
				title="New User Group"
				subTitle="Create a new user group by entering a unique group name and assigning a role."
			/>
			<FormGroup>
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
					margin="normal"
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<UsersIcon/>
							</InputAdornment>
						)
					}}
				/>
				<TextField
					id="textdescription"
					label="Description"
					onChange={(event) => setTextdescription(event.target.value)}
					defaultValue=""
					variant="outlined"
					fullWidth
					className={formClasses.textField}
					size="small"
					margin="normal"
				/>
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
					margin="normal"
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
				<SaveCancelButtons
					onSave={onSaveGroup}
					saveDisabled={!validate()}
					onCancel={onCancel}
				/>
			</FormGroup>
		</ContentContainer>
	);
};

const mapStateToProps = (state) => {
	return {
		userGroups: state.userGroups && state.userGroups.userGroups,
		roles: state.userRoles && state.userRoles.userRoles
	};
};

export default connect(mapStateToProps)(UserGroupNew);
