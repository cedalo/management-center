import FormGroup from '@material-ui/core/FormGroup';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ClientIDIcon from '@material-ui/icons/Fingerprint';
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import PasswordIcon from '@material-ui/icons/VpnKey';
import {useSnackbar} from 'notistack';
import React, {useContext, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateClients} from '../actions/actions';
import {useFormStyles} from '../styles';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
import SaveCancelButtons from './SaveCancelButtons';
import { useConfirmCancel } from '../helpers/useConfirmDialog';


const ClientNew = (props) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [clientID, setClientID] = useState('');
	const [textname, setTextname] = useState('');
	const [textdescription, setTextdescription] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const formClasses = useFormStyles();

	const handleClickShowPassword = () => setShowPassword(!showPassword);
	const handleMouseDownPassword = () => setShowPassword(!showPassword);

	const usernameExists = props?.clients?.clients?.find((searchClient) => {
		return searchClient.username === username;
	});

	const validate = () => {
		const valid = !usernameExists && username !== '' && password !== '';
		return valid;
	};

	const {enqueueSnackbar} = useSnackbar();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirmCancel = useConfirmCancel();
	const {client} = context;

	const onSaveClient = async () => {
		try {
			await client.createClient(username, password, clientID, '', textname, textdescription);
			const clients = await client.listClients();
			dispatch(updateClients(clients));
			history.push(`/clients`);
			enqueueSnackbar(`Client "${username}" successfully created.`, {
				variant: 'success'
			});
		} catch (error) {
			enqueueSnackbar(`Error creating client "${username}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error;
		}
	};

	const onCancel = async () => {
		await confirmCancel({
			title: 'Cancel client creation',
			description: `Do you really want to cancel creating this client?`
		});
		history.goBack();
	};

	return (
		<ContentContainer
			breadCrumbs={<ContainerBreadCrumbs title="New" links={[{name: 'Home', route: '/home'},
				{name: 'Clients', route: '/clients'}
			]}/>}
		>
			<ContainerHeader
				title="Create new client"
				subTitle="Enter a unique name, password and client id to define client properties and click add to append
						a new client to the list."
			/>
			<FormGroup>
				<TextField
					error={usernameExists}
					helperText={usernameExists && 'A client with this username already exists.'}
					required
					id="username"
					label="Name"
					onChange={(event) => setUsername(event.target.value)}
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
					required
					id="password"
					label="Password"
					onChange={(event) => setPassword(event.target.value)}
					defaultValue=""
					variant="outlined"
					fullWidth
					type={showPassword ? "text" : "password"}
					size="small"
					margin="normal"
					className={formClasses.textField}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<PasswordIcon/>
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position="end">
								<IconButton
									aria-label="toggle password visibility"
									onClick={handleClickShowPassword}
									onMouseDown={handleMouseDownPassword}
								>
									{showPassword ? <Visibility/> : <VisibilityOff/>}
								</IconButton>
							</InputAdornment>
						)
					}}
				/>
				<TextField
					id="client-id"
					label="ID"
					onChange={(event) => setClientID(event.target.value)}
					defaultValue=""
					variant="outlined"
					fullWidth
					size="small"
					margin="normal"
					className={formClasses.textField}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<ClientIDIcon/>
							</InputAdornment>
						)
					}}
				/>
				<TextField
					id="textname"
					label="Text Name"
					onChange={(event) => setTextname(event.target.value)}
					defaultValue=""
					variant="outlined"
					fullWidth
					size="small"
					margin="normal"
					className={formClasses.textField}
				/>
				<TextField
					id="textdescription"
					label="Text description"
					onChange={(event) => setTextdescription(event.target.value)}
					defaultValue=""
					variant="outlined"
					size="small"
					margin="normal"
					fullWidth
					className={formClasses.textField}
				/>
				<SaveCancelButtons
					onSave={onSaveClient}
					saveDisabled={!validate()}
					onCancel={onCancel}
				/>
			</FormGroup>
		</ContentContainer>
	);
};

const mapStateToProps = (state) => {
	return {
		clients: state.clients?.clients
	};
};

export default connect(mapStateToProps)(ClientNew);
