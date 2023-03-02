import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import React, {useContext, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateGroups} from '../actions/actions';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import SaveCancelButtons from './SaveCancelButtons';

const GroupNew = (props) => {
	const [groupname, setGroupname] = useState('');
	const [textname, setTextname] = useState('');
	const [textdescription, setTextdescription] = useState('');

	const {enqueueSnackbar} = useSnackbar();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const {client} = context;

	const groupnameExists = props?.groups?.groups?.find((searchGroup) => {
		return searchGroup.groupname === groupname;
	});

	const validate = () => {
		return groupname !== '';
	};

	const onSaveGroup = async () => {
		try {
			await client.createGroup(groupname, '', textname, textdescription);
			const groups = await client.listGroups();
			dispatch(updateGroups(groups));
			history.push(`/groups`);
			enqueueSnackbar(`Group "${groupname}" successfully created.`, {
				variant: 'success'
			});
		} catch (error) {
			enqueueSnackbar(`Error creating group "${groupname}". Reason: ${error.message || error}`, {
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
			<ContainerBreadCrumbs title="New" links={[{name: 'Home', route: '/home'},
				{name: 'Groups', route: '/groups'}
			]}/>
			<ContainerHeader
				title="New Group"
				subTitle="Create a new group by entering a unique group name."
			/>
			<Grid container spacing={1} alignItems="flex-end">
				<Grid item xs={12}>
					<TextField
						error={groupnameExists}
						helperText={groupnameExists && 'A group with this name already exists.'}
						required
						id="groupname"
						label="Name"
						onChange={(event) => setGroupname(event.target.value)}
						defaultValue=""
						variant="outlined"
						fullWidth
						size="small"
						margin="dense"
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
						id="textname"
						label="Text Name"
						onChange={(event) => setTextname(event.target.value)}
						defaultValue=""
						size="small"
						margin="dense"
						variant="outlined"
						fullWidth
					/>
				</Grid>
				<Grid item xs={12}>
					<TextField
						id="textdescription"
						label="Description"
						onChange={(event) => setTextdescription(event.target.value)}
						defaultValue=""
						size="small"
						margin="dense"
						variant="outlined"
						fullWidth
					/>
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
			</Grid>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		groups: state.groups?.groups
	};
};

export default connect(mapStateToProps)(GroupNew);
