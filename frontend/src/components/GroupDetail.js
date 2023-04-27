import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {updateGroup, updateGroups, updateGroupsAll} from '../actions/actions';
import {useFormStyles} from '../styles';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
import { useConfirmCancel } from '../helpers/useConfirmDialog';

const clientShape = PropTypes.shape({
	username: PropTypes.string,
	groups: PropTypes.array
});

const GroupDetail = (props) => {
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirmCancel = useConfirmCancel();
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
	const formClasses = useFormStyles();

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

		const count = props.rowsPerPage;
		const offset = props.page * props.rowsPerPage;

		brokerClient.listGroups(true, count, offset).then((groups) => {
			dispatch(updateGroups(groups));
		}).catch((error) => console.error(error));
		brokerClient.listGroups(false).then((groupsAll) => {
			dispatch(updateGroupsAll(groupsAll));
		}).catch((error) => console.error(error));

		setEditMode(false);
	};

	const onCancelEdit = async () => {
		await confirmCancel({
			title: 'Cancel group editing',
			description: `Do you really want to cancel editing this group?`
		});
		setUpdatedGroup({
			...group
		});
		setEditMode(false);
	};

	return group.groupname ? (
		<ContentContainer
			breadCrumbs={<ContainerBreadCrumbs title={updatedGroup.groupname} links={[{name: 'Home', route: '/home'},
				{name: 'Groups', route: '/groups'}
			]}/>}
		>
			<ContainerHeader
				title={`Edit Group: ${updatedGroup.groupname}`}
				subTitle="Here you can modify the properties of a group. The group name can not be changed."
			/>
			<FormGroup>
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
					margin="normal"
					className={formClasses.textField}
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
					margin="normal"
					className={formClasses.textField}
					value={updatedGroup.textname}
					//   onChange={(event) => setTextName(event.target.value)}
					defaultValue=""
					variant="outlined"
					fullWidth
				/>
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
					margin="normal"
					className={formClasses.textField}
					value={updatedGroup.textdescription}
					//   onChange={(event) => setTextDescription(event.target.value)}
					defaultValue=""
					variant="outlined"
					fullWidth
				/>
				{!editMode && (
					<Button
						variant="contained"
						size="small"
						className={formClasses.buttonTop}
						style={{width: '120px'}}
						color="primary"
						startIcon={<EditIcon/>}
						onClick={() => setEditMode(true)}
					>
						Edit
					</Button>
				)}
				{editMode && (
					<Grid item xs={12}>
						<Button
							variant="contained"
							disabled={!validate()}
							size="small"
							color="primary"
							className={formClasses.buttonTopRight}
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
							className={formClasses.buttonTop}
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
		<Redirect to="/groups" push/>
	);
};

GroupDetail.propTypes = {
	user: clientShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		// TODO: check object hierarchy
		group: state.groups?.group,
		rowsPerPage: state.groups?.rowsPerPage,
		page: state.groups?.page,
	};
};

export default connect(mapStateToProps)(GroupDetail);
