import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import {makeStyles} from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Close from '@material-ui/icons/Close';
import CloudDownload from '@material-ui/icons/CloudDownload';
import CloudUpload from '@material-ui/icons/CloudUpload';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import {Alert, AlertTitle} from '@material-ui/lab';
import {Buffer} from 'buffer';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import React, {useContext, useEffect} from 'react';
import {connect, useDispatch} from 'react-redux';
import {Redirect, useHistory} from 'react-router-dom';
import {updateBrokerConfigurations, updateBrokerConnections} from '../actions/actions';
import {handleConnectionChange} from '../utils/connectionUtils/connections';
import {WebSocketContext} from '../websockets/WebSocket';
import {useFormStyles} from '../styles';

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%'
	},
	form: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	buttons: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},
	margin: {
		margin: theme.spacing(1),
	},
	container: {
		borderStyle: 'solid',
		borderWidth: '1px',
		borderColor: theme.palette.mode === 'dark' ? '#1A2027' : '#6e6e6e', // '#6e6e6e' : '#c7c7c7'
		borderRadius: '5px',
		padding: theme.spacing(1),
		paddingLeft: theme.spacing(2),
		marginTop: '-1px', //!!
	},
	overlayed: {
		position: "absolute",
		top: 0,
		left: "10px",
		backgroundColor: theme.palette.background.default,
		paddingLeft: "5px",
		paddingRight: "5px",
		zIndex: 3,
		userSelect: 'none',
		// backgroundColor: 'red',

	},
	parent: {
		position: "relative",
		// backgroundColor: 'green',
		marginBottom: '1px',
	},
	paper: {
		padding: theme.spacing(2),
		textAlign: 'center',
		color: theme.palette.text.secondary,
	},
	padSidesSmall: {
		paddingLeft: '3px',
		paddingRight: '3px'
	},
	padTop: {
		paddingTop: '10px',
		zIndex: 1,
	},
	padTop2: {
		paddingTop: '20px',
		zIndex: 1,
	},
	filenameField: {
		width: '50%',
		paddingLeft: '10px',
		maxWidth: '150px'
	},
	filenameFieldExpanded: {
		width: '100%',
		paddingLeft: '10px',
		maxWidth: '300px'
	},
	smallFont: {
		fontSize: '12px',
	},
	restrictButtonHeight: {
		maxHeight: '27px',
	},
	verticallyPad: {
		paddingBottom: '14%',
	},
	crossButton: {
		// fontSize: '0.8em',
		borderRadius: "100%"
	},
	closeIcon: {
		maxHeight: '60%',
		maxWidth: '60%'
	},
	invisible: {
		display: 'none',
	},
	notEnabledBlock: {
		opacity: '0.5',
	},
	alert: {
		textAlign: 'left',
	},
	fileDownloadButton: {
		marginLeft: '10px',
		opacity: '75%',
		borderRadius: '6px'
	},
}));

const makeFileField = (fieldName) => {
	return `${fieldName}File`;
}


const ConnectionDetailComponent = (props) => {
	const [errors, setErrors] = React.useState({});
	const customCACertificateFieldName = 'ca';
	const clientCertificateFieldName = 'cert';
	const clientPrivateKeyFieldName = 'key';
	const verifyServerCertificateFieldName = 'rejectUnauthorized';
	const customCACertificateFileFieldName = makeFileField(customCACertificateFieldName);
	const clientCertificateFileFieldName = makeFileField(clientCertificateFieldName);
	const clientPrivateKeyFileFieldName = makeFileField(clientPrivateKeyFieldName);
	const [connected, setConnected] = React.useState(false);
	const { selectedConnectionToEdit: connection = {}, tlsFeature, currentConnectionName, alreadyConnected, connected: brokerCurrentlyConnected } = props;
	let editModeEnabledByDefault = false;
	if (!connection.id) {
		connection.id = 'default';
		editModeEnabledByDefault = true;
	}
	if (!connection.credentials) {
		connection.credentials = {};
	}

	const classes = useStyles();
	const formClasses = useFormStyles();
	const [value, setValue] = React.useState(0);
	const [showPassword, setShowPassword] = React.useState(false);
	const [externalEncryptedUrl, setExternalEncryptedUrl] = React.useState(connection.externalEncryptedUrl || 'None');
	const [externalUnencryptedUrl, setExternalUnencryptedUrl] = React.useState(connection.externalUnencryptedUrl || 'None');
	const [websocketUrl, setExternalWebsocketUrl] = React.useState(connection.websocketsUrl || 'None');
	const [internalUrl, setInternalUrl] = React.useState(connection.internalUrl || 'None');
	const handleClickShowPassword = () => setShowPassword(!showPassword);
	const handleMouseDownPassword = () => setShowPassword(!showPassword);
	const [editMode, setEditMode] = React.useState(editModeEnabledByDefault);
	const {enqueueSnackbar} = useSnackbar();

	const [updatedConnection, setUpdatedConnection] = React.useState({
		...connection,
		[verifyServerCertificateFieldName]: connection[verifyServerCertificateFieldName],
		[customCACertificateFileFieldName]: connection[customCACertificateFileFieldName],
		[clientCertificateFileFieldName]: connection[clientCertificateFileFieldName],
		[clientPrivateKeyFileFieldName]: connection[clientPrivateKeyFileFieldName],
	});

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const history = useHistory();
	const {client: brokerClient} = context;


	const validate = () => {
		if (errors[customCACertificateFieldName] || errors[clientCertificateFieldName] || errors[clientPrivateKeyFieldName]) {
			return false;
		}

		if (editMode) {
			return connection.id !== ''
				&& connection.name !== ''
				&& connection.url !== '';
		} else {
			return connection.id !== '';
		}
	};

	const onTestConnection = async (connection) => {
		try {
			const response = await brokerClient.testConnection(connection);
			if (response.connected) {
				setConnected(response.connected);
				enqueueSnackbar('Connection successfully tested', {
					variant: 'success'
				});
			} else {
				const {error} = response;
				setConnected(false);
				enqueueSnackbar(`Error connecting "${connection.name}". Reason: ${error.message || error}`, {
					variant: 'error'
				});
			}
		} catch (error) {
			setConnected(false);
			enqueueSnackbar(`Error connecting "${connection.name}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
	};

	const doConnect = async (connection) => {
		const response = await brokerClient.testConnection(connection);
		if (response.connected) {
			setConnected(response.connected);
		} else {
			const {error} = response;
			throw error;
		}
	}


	const loadConnections = async () => {
		const brokerConnections = await brokerClient.getBrokerConnections();

		dispatch(updateBrokerConnections(brokerConnections));
		const brokerConfigurations = await brokerClient.getBrokerConfigurations();
		dispatch(updateBrokerConfigurations(brokerConfigurations));
	}

	const onUpdateConnection = async (connect) => {
		try {
			await brokerClient.disconnectServerFromBroker(connection.id);
			await brokerClient.modifyConnection(connection.id, updatedConnection);

			await loadConnections();
			enqueueSnackbar('Connection successfully updated', {
				variant: 'success'
			});
			setEditMode(false);
			if (connect) {
				try {
					// await doConnect(connection);
					await doConnect(updatedConnection);
					await brokerClient.connectServerToBroker(connection.id);
					if (!alreadyConnected) {
						handleConnectionChange(dispatch, brokerClient, currentConnectionName,
							currentConnectionName, brokerCurrentlyConnected).catch((error) => console.error(
							'Error while pulling information from the broker on reconnect: ' + error));
						// await brokerClient.connectToBroker(name);
						// dispatch(updateBrokerConnected(true, name));
					}
					await loadConnections();
					history.push(`/connections`);
				} catch (error) {
					enqueueSnackbar(`Error creating connection "${connection.name}". Reason: ${error.message || error}`,
						{
							variant: 'error'
						});
				}
			}
		} catch (error) {
			enqueueSnackbar(`Error creating connection "${connection.name}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
	};

	const onCancelEdit = async () => {
		await confirm({
			title: 'Cancel editing connection',
			description: `Do you really want to cancel editing this connection?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		setUpdatedConnection({
			...connection
		});
		setEditMode(false);
	};


	const checkAndSetErrors = () => {
		if (!updatedConnection[clientCertificateFileFieldName] && !updatedConnection[clientCertificateFileFieldName]) {
			setErrors({...errors, [clientCertificateFieldName]: null});
			setErrors({...errors, [clientPrivateKeyFieldName]: null});
		}
		// the !clientCertificateFile part means that clientCertificate was not loaded because the respective input field hasn't been set with its name yet
		if (updatedConnection[clientPrivateKeyFieldName] && !updatedConnection[clientCertificateFileFieldName]) {
			setErrors({...errors, [clientCertificateFieldName]: {message: 'You have provided a private key but no certificate'}});
		}
		else if (updatedConnection[clientCertificateFieldName] && !updatedConnection[clientPrivateKeyFileFieldName]) {
			setErrors({...errors, [clientPrivateKeyFieldName]: {message: 'You have provided a certificate but no private key'}});
		}
		else if ((updatedConnection[clientCertificateFieldName] && updatedConnection[clientPrivateKeyFileFieldName]) || (!updatedConnection[clientCertificateFieldName] && !updatedConnection[clientPrivateKeyFileFieldName])) {
			setErrors((prevState) => ({...prevState, [clientPrivateKeyFieldName]: null, [clientCertificateFieldName]: null}));
		}
	};


	useEffect(() => {
		checkAndSetErrors();
	}, [updatedConnection]);


	const handleFileUpload = (e) => {
		const fileReader = new FileReader();
		const name = e.target.getAttribute('name');

		if (!e.target.files[0]) {
			return;
		}

		const filename = e.target.files[0].name;

		if (!name) {
			console.error('No "name" (e.target.getAttribute("name") passed into handleFileUpload')
		}

        fileReader.readAsDataURL(e.target.files[0]);
		e.target.value = ''; // null out the value of input component to make it possible to trigger it on uploading the same file several times
		const encoding = 'base64';


		fileReader.onerror = (e) => {
			const errorMessage = fileReader.error || `Error occured while loading ${filename}`;
			console.error(`File loading error (${filename}):`, errorMessage);

			setErrors((prevState) => ({...prevState, [name]: {message: errorMessage}}));
		};


		fileReader.onload = (e) => {
			const base64FileData = e.target.result.split(',')[1];

			setUpdatedConnection((prevState) => ({
				...prevState,
				[name]: {data: base64FileData, encoding},
				[makeFileField(name)]: filename
			}));

			setConnected(false); // ??!!
		};
	};

	const deleteFile = (fieldName) => {
		setUpdatedConnection((prevState) => ({
			...prevState,
			[fieldName]: '',
			[makeFileField(fieldName)]: '',
		}));
	};


	const handleFileDownload = (fieldName) => {
		const fileContent = Buffer.from(updatedConnection[fieldName].data, 'base64'); // base64 to string
		const fileString = new TextDecoder().decode(fileContent);

		const element = document.createElement('a');
		const file = new Blob([fileString], {type: 'text/plain'});
		element.href = URL.createObjectURL(file);
		element.download = updatedConnection[makeFileField(fieldName)];
		document.body.appendChild(element); // Required for this to work in FireFox

		element.click();
	};


	return connection?.id ? (
		<FormGroup>
						<TextField
							required={editMode}
							disabled
							size="small"
							margin="normal"
							className={formClasses.textField}
							onChange={(event) => {
								if (editMode) {
									setUpdatedConnection({
										...updatedConnection,
										id: event.target.value
									});
								}
							}}
							id="id"
							label="ID"
							value={updatedConnection.id}
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
							required={editMode}
							disabled
							id="name"
							size="small"
							margin="normal"
							className={formClasses.textField}
							label="Name"
							value={updatedConnection.name}
							defaultValue=""
							variant="outlined"
							fullWidth
							onChange={(event) => {
								if (editMode) {
									setUpdatedConnection({
										...updatedConnection,
										name: event.target.value
									});
								}
							}}
						/>
					{ !connection.internalUrl ?
						<TextField
							required={editMode}
							disabled={!editMode}
							id="url"
							label="URL"
							value={updatedConnection.url}
							size="small"
							margin="normal"
							className={formClasses.textField}
							defaultValue=""
							variant="outlined"
							fullWidth
							onChange={(event) => {
								if (editMode) {
									setExternalEncryptedUrl('');
									setExternalUnencryptedUrl('');
									setExternalWebsocketUrl('');
									setInternalUrl('');
									setUpdatedConnection({
										...updatedConnection,
										url: event.target.value
									});
									setConnected(false);
								}
							}}
						/>
					 : null}
					{ connection.internalUrl ?
						<TextField
							disabled
							id="external-url"
							label="Internal URL"
							value={internalUrl}
							// helperText="Not editable"
							defaultValue=""
							size="small"
							margin="normal"
							variant="outlined"
							fullWidth
							className={formClasses.textField}
						/>
					 : null}
					{ connection.externalEncryptedUrl ?
						<TextField
							disabled
							id="external-url"
							label="External MQTTS URL"
							value={externalEncryptedUrl}
							// helperText="Not editable"
							defaultValue=""
							variant="outlined"
							fullWidth
							size="small"
							margin="normal"
							className={formClasses.textField}
						/>
					 : null}
					{ connection.externalUnencryptedUrl ?
						<TextField
							disabled
							id="external-url"
							label="External MQTT URL"
							value={externalUnencryptedUrl}
							// helperText="Not editable"
							defaultValue=""
							variant="outlined"
							fullWidth
							size="small"
							margin="normal"
							className={formClasses.textField}
						/>
					: null}
					{ connection.websocketsUrl ?
						<TextField
							disabled
							id="external-url"
							label="Websocket URL"
							value={websocketUrl}
							// helperText="Not editable"
							defaultValue=""
							variant="outlined"
							fullWidth
							size="small"
							margin="normal"
							className={formClasses.textField}
							style={{paddingBottom: '10px'}}
						/>
					: null}
						<TextField
							required={false}
							disabled={!editMode}
							id="username"
							label="Username"
							value={updatedConnection.credentials?.username}
							size="small"
							margin="normal"
							className={formClasses.textField}
							defaultValue=""
							variant="outlined"
							fullWidth
							onChange={(event) => {
								if (editMode) {
									setUpdatedConnection({
										...updatedConnection,
										credentials: {
											username: event.target.value || undefined,
											password: updatedConnection.credentials.password,
										}
									});
									setConnected(false);
								}
							}}
						/>
						<TextField
							required={false}
							disabled={!editMode}
							id="password"
							type={showPassword ? "text" : "password"}
							label="Password"
							size="small"
							margin="normal"
							className={formClasses.textField}
							value={updatedConnection.credentials?.password}
							defaultValue=""
							variant="outlined"
							fullWidth
							onChange={(event) => {
								if (editMode) {
									setUpdatedConnection({
										...updatedConnection,
										credentials: {
											username: updatedConnection.credentials.username,
											password: event.target.value || undefined,
										}
									});
									setConnected(false);
								}
							}}
							InputProps={{ // <-- This is where the toggle button is added.
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											disabled={!editMode}
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

				{!(tlsFeature?.supported) ?
					(<>
						<div style={{padding: '10px'}}></div>
						<Alert severity="warning" className={classes.alert}>
							<AlertTitle>TLS feature is not available</AlertTitle>
							Make sure that support for custom TLS certificates is included in your MMC license.
						</Alert>
					</>) : (<></>)
				}

				<div className={(!tlsFeature?.supported) ? classes.notEnabledBlock : ''}>
					<div style={{padding: '5px'}}></div>
					<div className={`${classes.parent} ${classes.padTop}`}>
						<div className={classes.overlayed}>
							<Typography className={classes.smallFont}>
								Server certificate
							</Typography>
						</div>
						<Grid container direction={'row'} spacing={0} alignItems="flex-end"
							  className={`${classes.container} ${classes.parent} ${classes.padTop2}`}>
							<Grid item xl={6} md={6} sm={6} xs={6}>
								<FormGroup>
									<FormControlLabel
										control={
											<Switch
												color="primary"
												size="small"
												disabled={!editMode || !tlsFeature?.supported}
												checked={updatedConnection[verifyServerCertificateFieldName]}
												onChange={(event) => {
													if (editMode) {
														setUpdatedConnection({
															...updatedConnection,
															[verifyServerCertificateFieldName]: event.target.checked
														});
														setConnected(false);
													}
												}}
											/>
										}
										label="Verify server certificate"
									/>
								</FormGroup>
							</Grid>
							<Grid item xl={6} md={6} sm={6} xs={6}>
							</Grid>
							<Grid item xl={3} md={3} sm={4} xs={4} style={{marginTop: '8px'}}>
								<Typography
									className={errors[customCACertificateFieldName] ? classes.verticallyPad : ''}
									align="left">CA Certificate</Typography>
							</Grid>
							<Grid item xl={7} md={7} sm={7} xs={7}>
								<FormGroup row>
									<Button
										disabled={!editMode || !tlsFeature?.supported}
										size="small"
										onChange={handleFileUpload}
										variant="contained"
										className={`${classes.button} ${classes.restrictButtonHeight}`}
										color="primary"
										startIcon={<CloudUpload/>}
										component="label"
									>
										Choose File
										<input name={customCACertificateFieldName} hidden type="file"/>
									</Button>
									<TextField
										disabled={!editMode || !tlsFeature?.supported}
										className={(errors[customCACertificateFieldName]) ? classes.filenameFieldExpanded : classes.filenameField}
										size="small"
										inputProps={{readOnly: true,}}
										id="standard-basic"
										label=""
										variant="standard"
										value={updatedConnection[customCACertificateFileFieldName]}
										error={!!errors[customCACertificateFieldName]}
										helperText={errors[customCACertificateFieldName]?.message}
										InputProps={{
											endAdornment:
												<IconButton
													className={(editMode && updatedConnection[customCACertificateFileFieldName]) ? classes.crossButton : classes.invisible}
													style={{backgroundColor: 'transparent'}}
													size="small"
													onClick={() => deleteFile(customCACertificateFieldName)}
													disabled={!tlsFeature?.supported}
												>
													<Close className={classes.closeIcon}/>
												</IconButton>,
										}}
									/>
									<IconButton
										disabled={!tlsFeature?.supported || !updatedConnection[customCACertificateFieldName]}
										// style={{marginLeft: '10px', opacity: '75%', borderRadius: '6px'}}
										style={{backgroundColor: 'transparent'}}
										className={`${classes.fileDownloadButton}`}
										size="small"
										onClick={() => handleFileDownload(customCACertificateFieldName)}
									>
										<CloudDownload></CloudDownload>
									</IconButton>
								</FormGroup>
							</Grid>
							<Grid item xl={2} md={2} sm={1} xs={1}>
							</Grid>
						</Grid>
					</div>
					<div style={{padding: '7px'}}></div>
					<div className={`${classes.parent} ${classes.padTop}`}>
						<div className={classes.overlayed}>
							<Typography className={classes.smallFont}>
								Client certificate
							</Typography>
						</div>
						<Grid container direction={'row'} spacing={0} alignItems="flex-end"
							  className={`${classes.container} ${classes.parent} ${classes.padTop2}`}>
							<Grid item xl={3} md={3} sm={4} xs={4}>
								<Typography className={errors[clientCertificateFieldName] ? classes.verticallyPad : ''}
											align="left">Certificate</Typography>
							</Grid>
							<Grid item xl={7} md={7} sm={7} xs={7} style={{marginTop: '8px'}}>
								<FormGroup row>
									<Button
										disabled={!editMode || !tlsFeature?.supported}
										size="small"
										onChange={handleFileUpload}
										variant="contained"
										color="primary"
										className={`${classes.button} ${classes.restrictButtonHeight}`}
										startIcon={<CloudUpload/>}
										component="label"
									>
										Choose File
										<input name={clientCertificateFieldName} hidden type="file"/>
									</Button>
									<TextField
										disabled={!editMode || !tlsFeature?.supported}
										className={(errors[clientCertificateFieldName]) ? classes.filenameFieldExpanded : classes.filenameField}
										size="small"
										inputProps={{readOnly: true,}}
										id="standard-basic"
										label=""
										variant="standard"
										value={updatedConnection[clientCertificateFileFieldName]}
										error={!!errors[clientCertificateFieldName]}
										helperText={errors[clientCertificateFieldName]?.message}
										InputProps={{
											endAdornment:
												<IconButton
													className={(editMode && updatedConnection[clientCertificateFileFieldName]) ? classes.crossButton : classes.invisible}
													style={{backgroundColor: 'transparent'}}
													size="small"
													onClick={() => deleteFile(clientCertificateFieldName)}
													disabled={!tlsFeature?.supported}
												>
													<Close className={classes.closeIcon}/>
												</IconButton>,
										}}
									/>
									<IconButton
										disabled={!tlsFeature?.supported || !updatedConnection[clientCertificateFieldName]}
										// style={{marginLeft: '10px', opacity: '75%', borderRadius: '6px'}}
										style={{backgroundColor: 'transparent'}}
										className={`${classes.fileDownloadButton}`}
										size="small"
										onClick={() => handleFileDownload(clientCertificateFieldName)}
									>
										<CloudDownload></CloudDownload>
									</IconButton>
								</FormGroup>
							</Grid>
							<Grid item xl={2} md={2} sm={1} xs={1}>
							</Grid>


							<Grid item xl={3} md={3} sm={4} xs={4}>
								<Typography className={(errors[clientPrivateKeyFieldName]) ? classes.verticallyPad : ''}
											align="left">Private Key</Typography>
							</Grid>
							<Grid item xl={7} md={7} sm={7} xs={7} style={{marginTop: '8px'}}>
								<FormGroup row>
									<Button
										disabled={!editMode || !tlsFeature?.supported}
										size="small"
										onChange={handleFileUpload}
										variant="contained"
										color="primary"
										className={`${classes.button} ${classes.restrictButtonHeight}`}
										startIcon={<CloudUpload/>}
										component="label"
									>
										Choose File
										<input name={clientPrivateKeyFieldName} hidden type="file"/>
									</Button>
									<TextField
										disabled={!editMode || !tlsFeature?.supported}
										className={(errors[clientPrivateKeyFieldName]) ? classes.filenameFieldExpanded : classes.filenameField}
										size="small"
										inputProps={{readOnly: true,}}
										id="standard-basic"
										label=""
										variant="standard"
										value={updatedConnection[clientPrivateKeyFileFieldName]}
										error={!!errors[clientPrivateKeyFieldName]}
										helperText={errors[clientPrivateKeyFieldName]?.message}
										InputProps={{
											endAdornment:
												<IconButton
													className={(editMode && updatedConnection[clientPrivateKeyFileFieldName]) ? classes.crossButton : classes.invisible}
													style={{backgroundColor: 'transparent'}}
													size="small"
													onClick={() => deleteFile(clientPrivateKeyFieldName)}
													disabled={!tlsFeature?.supported}
												>
													<Close className={classes.closeIcon}/>
												</IconButton>,
											// classes: {
											// 		   adornedEnd: classes.adornedEnd
											// 		  }
										}}
									/>
									<IconButton
										disabled={!tlsFeature?.supported || !updatedConnection[clientPrivateKeyFieldName]}
										style={{backgroundColor: 'transparent'}}
										// style={{marginLeft: '10px', opacity: '75%', borderRadius: '6px'}}
										className={`${classes.fileDownloadButton}`}
										size="small"
										onClick={() => handleFileDownload(clientPrivateKeyFieldName)}
									>
										<CloudDownload></CloudDownload>
									</IconButton>
								</FormGroup>
							</Grid>
							<Grid item xl={2} md={2} sm={1} xs={1}>
							</Grid>
						</Grid>
					</div>
			</div>
			<Grid item xs={12} spacing={0} style={{paddingTop: '15px'}}>
				{/* <Button
							variant="contained"
							disabled={!validate()}
							color="primary"
							style={ connected ? { backgroundColor: 'green' } : {}}
							className={classes.button}
							startIcon={connected ? <ConnectedIcon /> : <DisconnectedIcon />}
							onClick={(event) => {
								event.stopPropagation();
								onTestConnection(updatedConnection);
							}}
						>
							Test connection
						</Button> */}
				{!editMode && (
					<Button
						variant="contained"
						size="small"
						color="primary"
						startIcon={<EditIcon/>}
						onClick={() => setEditMode(true)}
					>
						Edit
					</Button>
				)}
				{editMode && (
					<>
						<Button
							variant="contained"
							disabled={!validate()}
							size="small"
							color="primary"
							style={{marginRight: '10px'}}
							startIcon={<SaveIcon/>}
							onClick={(event) => {
								event.stopPropagation();
								onUpdateConnection(true);
							}}
						>
							{`Connect & Save`}
						</Button>
						<Button
							variant="contained"
							disabled={!validate()}
							color="primary"
							size="small"
							style={{marginRight: '10px'}}
							startIcon={<SaveIcon/>}
							onClick={(event) => {
								event.stopPropagation();
								onUpdateConnection();
							}}
						>
							Save
						</Button>
						<Button
							variant="contained"
							size="small"
							onClick={(event) => {
								event.stopPropagation();
								onCancelEdit();
							}}
						>
							Cancel
						</Button>
					</>
				)}
			</Grid>
		</FormGroup>
	) : (
		<Redirect to="/connections" push/>
	);
};

const mapStateToProps = (state) => {
	return {
		selectedConnectionToEdit: state.brokerConnections?.selectedConnectionToEdit,
		tlsFeature: state.systemStatus?.features?.tls,
		alreadyConnected: state.brokerConnections.connected,
		currentConnectionName: state.brokerConnections?.currentConnectionName,
		connected: state.brokerConnections?.connected,
	};
};

export default connect(mapStateToProps)(ConnectionDetailComponent);
