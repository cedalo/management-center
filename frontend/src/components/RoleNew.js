import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import React, {useContext, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateRoles} from '../actions/actions';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import SaveCancelButtons from './SaveCancelButtons';
import {useFormStyles} from '../styles';

const RoleNew = () => {
	const [rolename, setRolename] = useState('');
	const [textname, setTextname] = useState('');
	const [textdescription, setTextdescription] = useState('');
	const { enqueueSnackbar } = useSnackbar();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { client } = context;
	const formClasses = useFormStyles();

	const validate = () => {
		return rolename !== '';
	};

	const onSaveRole = async () => {
		try {
			await client.createRole(rolename, textname, textdescription);
			const roles = await client.listRoles();
			dispatch(updateRoles(roles));
			history.push(`/roles`);
			enqueueSnackbar(`Role "${rolename}" successfully created.`, {
				variant: 'success'
			});
		} catch(error) {
			enqueueSnackbar(`Error creating role "${rolename}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error;
		}
	};

	const onCancel = async () => {
		await confirm({
			title: 'Cancel role creation',
			description: `Do you really want to cancel creating this role?`,
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
			<ContainerBreadCrumbs title="New" links={[{name: 'Home', route: '/home'}, {name: 'Roles', route: '/roles'}]}/>
			<ContainerHeader
				title={`New Group`}
				subTitle="Create a new group by assigning a unique name."
			/>
			<Grid container spacing={1} alignItems="flex-end">
				<Grid item xs={12}>
					<TextField
						required
						id="rolename"
						label="Name"
						onChange={(event) => setRolename(event.target.value)}
						defaultValue=""
						variant="outlined"
						fullWidth
						size="small"
						margin="dense"
						className={formClasses.textField}
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
						id="textname"
						label="Text Name"
						onChange={(event) => setTextname(event.target.value)}
						defaultValue=""
						variant="outlined"
						fullWidth
						size="small"
						margin="dense"
						className={formClasses.textField}
					/>
				</Grid>
				<Grid item xs={12}>
					<TextField
						id="textdescription"
						label="Text description"
						onChange={(event) => setTextdescription(event.target.value)}
						defaultValue=""
						variant="outlined"
						fullWidth
						size="small"
						margin="dense"
						className={formClasses.textField}
					/>
				</Grid>
			</Grid>
			<Grid container xs={12} alignItems="flex-start">
				<Grid item xs={12}>
					<SaveCancelButtons
						onSave={onSaveRole}
						saveDisabled={!validate()}
						onCancel={onCancel}
					/>
				</Grid>
			</Grid>
		</div>
	);
};

const mapStateToProps = () => {
	return {};
};

export default connect(mapStateToProps)(RoleNew);
