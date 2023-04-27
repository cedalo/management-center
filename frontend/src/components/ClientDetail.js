import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AccountCircle from '@material-ui/icons/AccountCircle';
import EditIcon from '@material-ui/icons/Edit';
import ClientIDIcon from '@material-ui/icons/Fingerprint';
import SaveIcon from '@material-ui/icons/Save';
import PasswordIcon from '@material-ui/icons/VpnKey';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {updateClient, updateClients} from '../actions/actions';
import {getIsAdminClient} from '../helpers/utils';
import {useFormStyles} from '../styles';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
import { useConfirmCancel } from '../helpers/useConfirmDialog';

const PASSWORD_ERROR_MESSAGE = 'Password should not be empty';

function TabPanel(props) {
	const {children, value, index, ...other} = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`scrollable-prevent-tabpanel-${index}`}
			aria-labelledby={`scrollable-prevent-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box pt={3}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired
};

function a11yProps(index) {
	return {
		id: `scrollable-prevent-tab-${index}`,
		'aria-controls': `scrollable-prevent-tabpanel-${index}`
	};
}

const clientShape = PropTypes.shape({
	username: PropTypes.string,
	lastName: PropTypes.string,
	firstName: PropTypes.string,
	groups: PropTypes.array
});

const ClientDetail = (props) => {
	const [value, setValue] = React.useState(0);
	const [showPassword, setShowPassword] = React.useState(false);
	const [editMode, setEditMode] = React.useState(false);
	const {enqueueSnackbar} = useSnackbar();
	const ref = React.useRef();
	const [passwordError, setPasswordError] = React.useState(null);
	const formClasses = useFormStyles();

	React.useEffect(() => {
		if (document.hasFocus() && ref.current?.contains(document.activeElement)) {
			if (!ref.current.value) {
				setPasswordError(PASSWORD_ERROR_MESSAGE);
			}
		}
	}, []);

	const {client = {}, defaultClient} = props;
	const isAdminClient = getIsAdminClient(defaultClient);

	const [updatedClient, setUpdatedClient] = React.useState({
		...client
	});

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirmCancel = useConfirmCancel();
	const {client: brokerClient} = context;

	const validate = () => {
		if (passwordError) {
			return false;
		}
		if (editMode) {
			return updatedClient.username !== '';
		} else {
			return updatedClient.clientid !== '' && updatedClient.username !== '';
		}
	};

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const onUpdateClient = async () => {
		// TODO: quick hack
		delete updatedClient.groups;
		delete updatedClient.roles;
		await brokerClient.modifyClient(updatedClient);
		enqueueSnackbar('Client successfully updated', {
			variant: 'success'
		});
		const clientObject = await brokerClient.getClient(updatedClient.username);
		dispatch(updateClient(clientObject));

		const count = props.rowsPerPage;
		const offset = props.page * props.rowsPerPage;

		brokerClient.listClients(true, count, offset).then((clients) => {
			dispatch(updateClients(clients));
		}).catch((error) => console.error(error));

		setEditMode(false);
	};

	const onCancelEdit = async () => {
		await confirmCancel({
			title: 'Cancel client editing',
			description: `Do you really want to cancel editing this client?`
		});
		setUpdatedClient({
			...client
		});
		setEditMode(false);
	};
	const {
		match: {
			params: {clientId}
		}
	} = props;
	// TODO: get client by id if current client is not defined

	return client.username ? (
		<ContentContainer
			breadCrumbs={<ContainerBreadCrumbs title={client.username} links={[{name: 'Home', route: '/home'},
				{name: 'Clients', route: '/clients'}
			]}/>}
		>
			<ContainerHeader
				title={`Edit Client: ${client.username}`}
				subTitle="Here you can modify the properties of a client. The user name can not be changed."
			/>
			<FormGroup>
				<TextField
					required={editMode}
					disabled={true}
					onChange={(event) => {
						if (editMode) {
							setUpdatedClient({
								...updatedClient,
								username: event.target.value
							});
						}
					}}
					id="username"
					label="Name"
					value={updatedClient.username}
					defaultValue=""
					variant="outlined"
					fullWidth
					size="small"
					margin="normal"
					className={formClasses.textField}
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
						if (event.target.value) {
							setPasswordError(null);
						} else {
							setPasswordError(PASSWORD_ERROR_MESSAGE);
						}
						if (editMode) {
							setUpdatedClient({
								...updatedClient,
								password: event.target.value
							})
						}
					}}
					id="password"
					label="Password (You can change the password here, empty password will be ignored)"
					helperText={passwordError}
					value={client.password}
					error={!!passwordError}
					// defaultValue="*****"
					onFocus={() => {
						if (!updatedClient.password) {
							setPasswordError(PASSWORD_ERROR_MESSAGE);
						}
					}}
					onBlur={() => {
						setPasswordError(null);
					}}
					inputRef={ref}
					variant="outlined"
					fullWidth
					type={showPassword ? 'text' : 'password'}
					size="small"
					margin="normal"
					className={formClasses.textField}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<PasswordIcon/>
							</InputAdornment>
						)
					}}
				/>
				{/* <IconButton onClick={() => {
										if (showPassword) {
											setShowPassword(false);
										} else {
											setShowPassword(true);
										}
									}} >
									{ showPassword ? <HidePasswordIcon /> : <ShowPasswordIcon /> }
									</IconButton> */}
				<TextField
					disabled={!editMode}
					id="client-id"
					label="ID"
					value={updatedClient.clientid}
					defaultValue=""
					variant="outlined"
					fullWidth
					size="small"
					margin="normal"
					className={formClasses.textField}
					onChange={(event) => {
						if (editMode) {
							setUpdatedClient({
								...updatedClient,
								clientid: event.target.value
							});
						}
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<ClientIDIcon/>
							</InputAdornment>
						)
					}}
				/>
				<TextField
					disabled={!editMode}
					onChange={(event) => {
						if (editMode) {
							setUpdatedClient({
								...updatedClient,
								textname: event.target.value
							});
						}
					}}
					id="textname"
					label="Text Name"
					value={updatedClient.textname}
					//   onChange={(event) => setTextName(event.target.value)}
					defaultValue=""
					variant="outlined"
					fullWidth
					size="small"
					margin="normal"
					className={formClasses.textField}
				/>
				<TextField
					disabled={!editMode}
					onChange={(event) => {
						if (editMode) {
							setUpdatedClient({
								...updatedClient,
								textdescription: event.target.value
							});
						}
					}}
					id="textdescription"
					label="Description"
					value={updatedClient.textdescription}
					//   onChange={(event) => setTextDescription(event.target.value)}
					defaultValue=""
					variant="outlined"
					fullWidth
					size="small"
					margin="normal"
					className={formClasses.textField}
				/>
				{!editMode && !isAdminClient(client) /* defaultClient?.username !== client.username */ && (
					<Button
						variant="contained"
						size="small"
						color="primary"
						style={{marginTop: '10px', width: '120px'}}
						startIcon={<EditIcon/>}
						onClick={() => setEditMode(true)}
					>
						Edit
					</Button>
				)}
				{editMode && !isAdminClient(client) /* defaultClient?.username !== client.username */ && (
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
								onUpdateClient();
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
			</FormGroup>
		</ContentContainer>
	) : (
		<Redirect to="/clients" push/>
	);
};

ClientDetail.propTypes = {
	client: clientShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		client: state.clients?.client,
		defaultClient: state.brokerConnections?.defaultClient,
		page: state.clients?.page,
		rowsPerPage: state.clients?.rowsPerPage
	};
};

export default connect(mapStateToProps)(ClientDetail);
