import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import {makeStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AccountCircle from '@material-ui/icons/AccountCircle';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {Link as RouterLink, Redirect} from 'react-router-dom';
import {updateGroup, updateGroups} from '../actions/actions';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';

const clientShape = PropTypes.shape({
	username: PropTypes.string,
	groups: PropTypes.array
});

const GroupDetail = (props) => {
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const {enqueueSnackbar} = useSnackbar();
	const {client: brokerClient} = context;

	const [value, setValue] = React.useState(0);
	const [state, setState] = React.useState({
		checkedA: true,
		checkedB: true
	});
	const {group = {}} = props;
	const [editMode, setEditMode] = React.useState(false);
	const [updatedGroup, setUpdatedGroup] = React.useState({
		...group
	});

	const validate = () => {
		const valid = updatedGroup.groupname !== '';
		return valid;
	};

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const onUpdateGroup = async () => {
		await brokerClient.modifyGroup(updatedGroup);
		enqueueSnackbar('Group successfully updated', {
			variant: 'success'
		});
		const groupObject = await brokerClient.getGroup(group.groupname);
		dispatch(updateGroup(groupObject));
		const groups = await brokerClient.listGroups();
		dispatch(updateGroups(groups));
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

	return group.groupname ? (
		<div>
			<ContainerBreadCrumbs title={updatedGroup.groupname} links={[{name: 'Home', route: '/home'},
				{name: 'Groups', route: '/groups'}
			]}/>
			<ContainerHeader
				title={`Edit Group: ${updatedGroup.groupname}`}
				subTitle="Here you can modify the properties of a group. The group name can not be changed."
			/>
			<Grid container spacing={1} alignItems="flex-end">
				<Grid item xs={12}>
					<TextField
						required
						disabled
						onChange={(event) => {
							if (editMode) {
								setUpdatedGroup({
									...updatedGroup,
									groupname: event.target.value
								});
							}
						}}
						id="groupname"
						size="small"
						margin="dense"
						value={updatedGroup.groupname}
						label="Name"
						defaultValue=""
						variant="outlined"
						fullWidth
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<AccountCircle/>
								</InputAdornment>
							)
						}}
					/>
				</Grid>
				<Grid item xs={12}>
					<TextField
						disabled={!editMode}
						onChange={(event) => {
							if (editMode) {
								setUpdatedGroup({
									...updatedGroup,
									textname: event.target.value
								});
							}
						}}
						id="textname"
						label="Text Name"
						size="small"
						margin="dense"
						value={updatedGroup.textname}
						//   onChange={(event) => setTextName(event.target.value)}
						defaultValue=""
						variant="outlined"
						fullWidth
					/>
				</Grid>
				<Grid item xs={12}>
					<TextField
						disabled={!editMode}
						onChange={(event) => {
							if (editMode) {
								setUpdatedGroup({
									...updatedGroup,
									textdescription: event.target.value
								});
							}
						}}
						id="textdescription"
						label="Description"
						size="small"
						margin="dense"
						value={updatedGroup.textdescription}
						//   onChange={(event) => setTextDescription(event.target.value)}
						defaultValue=""
						variant="outlined"
						fullWidth
					/>
				</Grid>
			</Grid>
			{!editMode && (
				<Grid item xs={12}>
					<Button
						variant="contained"
						size="small"
						style={{marginTop: '10px'}}
						color="primary"
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
						size="small"
						color="primary"
						style={{marginTop: '10px', marginRight: '10px'}}
						startIcon={<SaveIcon/>}
						onClick={(event) => {
							event.stopPropagation();
							onUpdateGroup();
						}}
					>
						Save
					</Button>
					<Button
						variant="contained"
						size="small"
						style={{marginTop: '10px'}}
						onClick={(event) => {
							event.stopPropagation();
							onCancelEdit();
						}}
					>
						Cancel
					</Button>
				</Grid>
			)}
		</div>
	) : (
		<Redirect to="/groups" push/>
	);
};

GroupDetail.propTypes = {
	user: clientShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		// TODO: check object hierarchy
		group: state.groups?.group
	};
};

export default connect(mapStateToProps)(GroupDetail);
