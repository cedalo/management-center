import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {updateUserGroup, updateUserGroups} from '../admin/users/actions/actions';
import {useFormStyles} from '../styles';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBox from './ContainerBox';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';

const UserGroupDetail = (props) => {
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const {enqueueSnackbar} = useSnackbar();
	const {client: brokerClient} = context;
	const roles = props.roles;
	const group = props.userGroup || {};
	const [editMode, setEditMode] = React.useState(false);
	const [updatedGroup, setUpdatedGroup] = React.useState({});
	const formClasses = useFormStyles();

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

	return props.userGroup.name ? (
		<ContentContainer
			breadCrumbs={<ContainerBreadCrumbs title={updatedGroup.name} links={[{name: 'Home', route: '/home'},
				{name: 'User Groups', route: '/user-groups'}
			]}/>}
		>
			<ContainerHeader
				title={`Edit User Group: ${updatedGroup.name}`}
				subTitle="Edit User Group properties"
			/>
			<FormGroup>
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
					label="Name"
					defaultValue=""
					variant="outlined"
					fullWidth
					className={formClasses.textField}
					size="small"
					margin="normal"
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<AccountCircle/>
							</InputAdornment>
						)
					}}
				/>
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
					label="Description"
					value={updatedGroup.description}
					//   onChange={(event) => setTextDescription(event.target.value)}
					defaultValue=""
					variant="outlined"
					fullWidth
					className={formClasses.textField}
					size="small"
					margin="normal"
				/>
				<TextField
					disabled={!editMode}
					select
					fullWidth
					name="role-select"
					id="role-select"
					variant="outlined"
					label="Role of the users in the group *"
					value={updatedGroup.role || props.userGroup.name}
					onChange={(event) => {
						if (editMode) {
							setUpdatedGroup({
								...updatedGroup,
								role: event.target.value
							});
						}
					}}
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
				{!editMode && (
					<Grid item xs={12}>
						<Button
							variant="contained"
							color="primary"
							size="small"
							className={formClasses.buttonTop}
							startIcon={<EditIcon/>}
							onClick={() => setEditMode(true)}
						>
							Edit
						</Button>
					</Grid>
				)}
				{editMode && (
					<Grid item xs={12}>
						<Button
							variant="contained"
							disabled={!validate()}
							color="primary"
							size="small"
							startIcon={<SaveIcon/>}
							className={formClasses.buttonTopRight}
							onClick={(event) => {
								event.stopPropagation();
								onUpdateGroup();
							}}
						>
							Save
						</Button>
						<Button
							variant="contained"
							className={formClasses.buttonTop}
							size="small"
							onClick={(event) => {
								event.stopPropagation();
								onCancelEdit();
							}}
						>
							Cancel
						</Button>
					</Grid>
				)}
			</FormGroup>

		</ContentContainer>
	) : (
		<Redirect to="/user-groups" push/>
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
