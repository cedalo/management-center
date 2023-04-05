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
import CloudUpload from '@material-ui/icons/CloudUpload';
import SaveIcon from '@material-ui/icons/Save';
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import {Alert, AlertTitle} from '@material-ui/lab';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import React, {useContext, useEffect} from 'react';
import {connect, useDispatch} from 'react-redux';
import {Redirect, useHistory} from 'react-router-dom';
import {updateBrokerConfigurations, updateBrokerConnections} from '../actions/actions';
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
	marginBottom: {
		marginBottom: theme.spacing(1)
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
		backgroundColor: theme.palette.background.paper,
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
	closeIcon: {
		maxHeight: '60%',
		maxWidth: '60%',
	},
	invisible: {
		display: 'none',
	},
	notEnabledBlock: {
		opacity: '0.5',
	},
	alert: {
		textAlign: 'left',
	}
}));


const makeFileField = (fieldName) => {
	return `${fieldName}File`;
}


const ConnectionNewComponent = ({connections, tlsFeature, handleCloseDialog}) => {
	const [errors, setErrors] = React.useState({});
	const customCACertificateFieldName = 'ca';
	const clientCertificateFieldName = 'cert';
	const clientPrivateKeyFieldName = 'key';
	const verifyServerCertificateFieldName = 'rejectUnauthorized';
	const customCACertificateFileFieldName = makeFileField(customCACertificateFieldName);
	const clientCertificateFileFieldName = makeFileField(clientCertificateFieldName);
	const clientPrivateKeyFileFieldName = makeFileField(clientPrivateKeyFieldName);
	const [showPassword, setShowPassword] = React.useState(false);
	const handleClickShowPassword = () => setShowPassword(!showPassword);
	const handleMouseDownPassword = () => setShowPassword(!showPassword);

	const classes = useStyles();
	const formClasses = useFormStyles();
	const [connection, setConnection] = React.useState({
		id: 'mosquitto',
		name: 'My Mosquitto broker',
		url: `mqtt://localhost:1883`,
		credentials: {
			// username: 'cedalo',
			// password: 'eAkX29UnAs'
		},
		[verifyServerCertificateFieldName]: true,
		[customCACertificateFileFieldName]: '',
		[clientCertificateFileFieldName]: '',
		[clientPrivateKeyFileFieldName]: '',
	});
	const [connected, setConnected] = React.useState(false);
	const {enqueueSnackbar} = useSnackbar();
	const history = useHistory();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const {client: brokerClient} = context;

	const connectionExists = connections?.find((searchConnection) => {
		return searchConnection.id === connection.id;
	});

	const connectionWithNameExists = connections?.find((searchConnection) => {
		return searchConnection.name === connection.name;
	});

	const validate = () => {
		if (errors[customCACertificateFieldName] || errors[clientCertificateFieldName] || errors[clientPrivateKeyFieldName]) {
			return false;
		}

		return !connectionExists
			&& !connectionWithNameExists
			&& connection.id !== ''
			&& connection.name !== ''
			&& connection.url !== '';
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

	const onNewConnection = async (connect) => {
		try {
			await brokerClient.createConnection(connection);
			if (connect) {
				try {
					await doConnect(connection);
					await brokerClient.connectServerToBroker(connection.id);
				} catch (error) {
					enqueueSnackbar(`Error creating connection "${connection.name}". Reason: ${error.message || error}`,
						{
							variant: 'error'
						});
				}
			}
			await loadConnections();
			enqueueSnackbar('Connection successfully created', {
				variant: 'success'
			});
			history.push(`/connections`);
		} catch (error) {
			enqueueSnackbar(`Error creating connection "${connection.name}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
		} finally {
			if (handleCloseDialog) {
				handleCloseDialog();
			}
		}
	};


	const onCancel = async () => {
		await confirm({
			title: 'Cancel connection creation',
			description: `Do you really want to cancel creating this connection?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});

		if (handleCloseDialog) {
			handleCloseDialog();
			return;
		}
		history.goBack();
	};


	const checkAndSetErrors = () => {
		if (!connection[clientCertificateFileFieldName] && !connection[clientCertificateFileFieldName]) {
			setErrors({...errors, [clientCertificateFieldName]: null});
			setErrors({...errors, [clientPrivateKeyFieldName]: null});
		}
		// the !clientCertificateFile part means that clientCertificate was not loaded because the respective input
		// field hasn't been set with its name yet
		if (connection[clientPrivateKeyFieldName] && !connection[clientCertificateFileFieldName]) {
			setErrors({
				...errors,
				[clientCertificateFieldName]: {message: 'You have provided a private key but no certificate'}
			});
		} else if (connection[clientCertificateFieldName] && !connection[clientPrivateKeyFileFieldName]) {
			setErrors({
				...errors,
				[clientPrivateKeyFieldName]: {message: 'You have provided a certificate but no private key'}
			});
		} else if ((connection[clientCertificateFieldName] && connection[clientPrivateKeyFileFieldName]) || (!connection[clientCertificateFieldName] && !connection[clientPrivateKeyFileFieldName])) {
			setErrors(
				(prevState) => ({...prevState, [clientPrivateKeyFieldName]: null, [clientCertificateFieldName]: null}));
		}
	};


	useEffect(() => {
		checkAndSetErrors();
	}, [connection]);


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
		e.target.value = ''; // null out the value of input component to make it possible to trigger it on uploading
							 // the same file several times
		const encoding = 'base64';


		fileReader.onerror = (e) => {
			const errorMessage = fileReader.error || `Error occured while loading ${filename}`;
			console.error(`File loading error (${filename}):`, errorMessage);

			setErrors((prevState) => ({...prevState, [name]: {message: errorMessage}}));
		};


		fileReader.onload = (e) => {
			const base64FileData = e.target.result.split(',')[1];

			setConnection((prevState) => ({
				...prevState,
				[name]: {data: base64FileData, encoding},
				[makeFileField(name)]: filename
			}));

			setConnected(false); // ??!!
		};
	};


	const deleteFile = (fieldName) => {
		setConnection((prevState) => ({
			...prevState,
			[fieldName]: '',
			[makeFileField(fieldName)]: '',
		}));
	};


	return connection ? (
		<FormGroup>
			<TextField
				error={connectionExists}
				helperText={connectionExists && 'A connection with this ID already exists.'}
				required={true}
				size="small"
				margin="normal"
				className={formClasses.textField}
				onChange={(event) => {
					setConnection({
						...connection,
						id: event.target.value
					});
				}}
				id="id"
				label="ID"
				value={connection.id}
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
				error={connectionWithNameExists}
				helperText={connectionWithNameExists && 'A connection with this name already exists.'}
				size="small"
				margin="normal"
				className={formClasses.textField}
				required={true}
				id="name"
				label="Name"
				value={connection.name}
				defaultValue=""
				variant="outlined"
				fullWidth
				onChange={(event) => {
					setConnection({
						...connection,
						name: event.target.value
					});
				}}
			/>
			<TextField
				required={true}
				id="url"
				label="URL"
				value={connection.url}
				defaultValue=""
				variant="outlined"
				fullWidth
				size="small"
				margin="normal"
				className={formClasses.textField}
				onChange={(event) => {
					setConnection({
						...connection,
						url: event.target.value
					});
					setConnected(false);
				}}
			/>
			<TextField
				id="username"
				label="Username"
				value={connection.credentials?.username}
				defaultValue=""
				variant="outlined"
				fullWidth
				size="small"
				margin="normal"
				className={formClasses.textField}
				onChange={(event) => {
					setConnection({
						...connection,
						credentials: {
							...connection.credentials,
							username: event.target.value
						}
					});
					setConnected(false);
				}}
			/>
			<TextField
				id="password"
				type={showPassword ? "text" : "password"}
				label="Password"
				value={connection.credentials?.password}
				defaultValue=""
				variant="outlined"
				fullWidth
				size="small"
				margin="normal"
				className={formClasses.textField}
				onChange={(event) => {
					setConnection({
						...connection,
						credentials: {
							...connection.credentials,
							password: event.target.value
						}
					});
					setConnected(false);
				}}
				InputProps={{ // <-- This is where the toggle button is added.
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
				<div className={`${classes.parent} ${classes.padTop}}`}>
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
											disabled={!tlsFeature?.supported}
											size="small"
											checked={connection[verifyServerCertificateFieldName]}
											onChange={(event) => {
												setConnection({
													...connection,
													[verifyServerCertificateFieldName]: event.target.checked
												});
												setConnected(false);
											}}
										/>
									}
									label="Verify server certificate"
								/>
							</FormGroup>
						</Grid>
						<Grid item xl={6} md={6} sm={6} xs={6}>
						</Grid>
						<Grid item xl={3} md={3} sm={4} xs={4}>
							<Typography
								className={errors[customCACertificateFieldName] ? classes.verticallyPad : ''}
								align="left">CA Certificate</Typography>
						</Grid>
						<Grid item xl={7} md={7} sm={7} xs={7}>
							<FormGroup row>
								<Button
									size="small"
									onChange={handleFileUpload}
									variant="contained"
									className={`${classes.button} ${classes.restrictButtonHeight}`}
									color="primary"
									startIcon={<CloudUpload/>}
									component="label"
									disabled={!tlsFeature?.supported}
								>
									Choose File
									<input name={customCACertificateFieldName} hidden type="file"/>
								</Button>
								<TextField
									className={(errors[customCACertificateFieldName]) ? classes.filenameFieldExpanded : classes.filenameField}
									size="small"
									inputProps={{readOnly: true,}}
									id="standard-basic"
									label=""
									variant="standard"
									value={connection[customCACertificateFileFieldName]}
									error={!!errors[customCACertificateFieldName]}
									helperText={errors[customCACertificateFieldName]?.message}
									InputProps={{
										endAdornment:
											<IconButton
												className={(connection[customCACertificateFileFieldName]) ? classes.crossButton : classes.invisible}
												size="small"
												onClick={() => deleteFile(customCACertificateFieldName)}
												disabled={!tlsFeature?.supported}
											>
												<Close className={classes.closeIcon}/>
											</IconButton>,
									}}
									disabled={!tlsFeature?.supported}
								/>
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
						<Grid item xl={7} md={7} sm={7} xs={7}>
							<FormGroup row>
								<Button
									size="small"
									onChange={handleFileUpload}
									variant="contained"
									color="primary"
									className={`${classes.button} ${classes.restrictButtonHeight}`}
									startIcon={<CloudUpload/>}
									component="label"
									disabled={!tlsFeature?.supported}
								>
									Choose File
									<input name={clientCertificateFieldName} hidden type="file"/>
								</Button>
								<TextField
									className={(errors[clientCertificateFieldName]) ? classes.filenameFieldExpanded : classes.filenameField}
									size="small"
									inputProps={{readOnly: true,}}
									id="standard-basic"
									label=""
									variant="standard"
									value={connection[clientCertificateFileFieldName]}
									error={!!errors[clientCertificateFieldName]}
									helperText={errors[clientCertificateFieldName]?.message}
									InputProps={{
										endAdornment:
											<IconButton
												className={(connection[clientCertificateFileFieldName]) ? classes.crossButton : classes.invisible}
												size="small"
												onClick={() => deleteFile(clientCertificateFieldName)}
												disabled={!tlsFeature?.supported}
											>
												<Close className={classes.closeIcon}/>
											</IconButton>,
									}}
									disabled={!tlsFeature?.supported}
								/>
							</FormGroup>
						</Grid>
						<Grid item xl={2} md={2} sm={1} xs={1}>
						</Grid>


						<Grid item xl={3} md={3} sm={4} xs={4}>
							<Typography className={(errors[clientPrivateKeyFieldName]) ? classes.verticallyPad : ''}
										align="left">Private Key</Typography>
						</Grid>
						<Grid item xl={7} md={7} sm={7} xs={7}>
							<FormGroup row>
								<Button
									size="small"
									onChange={handleFileUpload}
									variant="contained"
									color="primary"
									className={`${classes.button} ${classes.restrictButtonHeight}`}
									startIcon={<CloudUpload/>}
									component="label"
									disabled={!tlsFeature?.supported}
								>
									Choose File
									<input name={clientPrivateKeyFieldName} hidden type="file"/>
								</Button>
								<TextField
									className={(errors[clientPrivateKeyFieldName]) ? classes.filenameFieldExpanded : classes.filenameField}
									size="small"
									inputProps={{readOnly: true,}}
									id="standard-basic"
									label=""
									variant="standard"
									value={connection[clientPrivateKeyFileFieldName]}
									error={!!errors[clientPrivateKeyFieldName]}
									helperText={errors[clientPrivateKeyFieldName]?.message}
									InputProps={{
										endAdornment:
											<IconButton
												className={(connection[clientPrivateKeyFileFieldName]) ? classes.crossButton : classes.invisible}
												size="small"
												onClick={() => deleteFile(clientPrivateKeyFieldName)}
												disabled={!tlsFeature?.supported}
											>
												<Close className={classes.closeIcon}/>
											</IconButton>,
									}}
									disabled={!tlsFeature?.supported}
								/>
							</FormGroup>
						</Grid>
						<Grid item xl={2} md={2} sm={1} xs={1}>
						</Grid>
					</Grid>
				</div>
			</div>
			{/* <Grid item xs={12} className={classes.buttons}>
					<Button
						variant="contained"
						disabled={!validate()}
						color="primary"
						style={ connected ? { backgroundColor: 'green' } : {}}
						className={classes.button}
						startIcon={connected ? <ConnectedIcon /> : <DisconnectedIcon />}
						onClick={(event) => {
							event.stopPropagation();
							onTestConnection(connection);
						}}
					>
						Test connection
					</Button>
				</Grid> */}
			<Grid item xs={12} spacing={0}>
				<Button
					variant="contained"
					disabled={!validate()}
					color="primary"
					size="small"
					className={formClasses.buttonTopRight}
					startIcon={<SaveIcon/>}
					onClick={(event) => {
						event.stopPropagation();
						onNewConnection(true);
					}}
				>
					{`Connect & Save`}
				</Button>
				<Button
					variant="contained"
					disabled={!validate()}
					color="primary"
					size="small"
					className={formClasses.buttonTopRight}
					startIcon={<SaveIcon/>}
					onClick={(event) => {
						event.stopPropagation();
						onNewConnection(false);
					}}
				>
					{`Save`}
				</Button>
				<Button
					variant="contained"
					className={formClasses.buttonTop}
					size="small"
					onClick={(event) => {
						event.stopPropagation();
						onCancel();
					}}
				>
					Cancel
				</Button>
			</Grid>
		</FormGroup>
	) : (
		<Redirect to="/connections" push/>
	);
};

const mapStateToProps = (state) => {
	return {
		connections: state.brokerConnections?.brokerConnections,
		selectedConnectionToEdit: state.brokerConnections?.selectedConnectionToEdit,
		tlsFeature: state.systemStatus?.features?.tls,
	};
};

export default connect(mapStateToProps)(ConnectionNewComponent);
