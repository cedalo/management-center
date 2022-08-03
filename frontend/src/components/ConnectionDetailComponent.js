import React, { useContext, useState } from 'react';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import useLocalStorage from '../helpers/useLocalStorage';


import AccountCircle from '@material-ui/icons/AccountCircle';
import DisconnectedIcon from '@material-ui/icons/Cloud';
import ConnectedIcon from '@material-ui/icons/CloudDone';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import SaveIcon from '@material-ui/icons/Save';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import { updateBrokerConfigurations, updateBrokerConnections } from '../actions/actions';


import CloudUpload from '@material-ui/icons/CloudUpload';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';


const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%'
	},
	paper: {
		padding: '15px'
	},
	form: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	textField: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
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
	}
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

	const customCACertificateFileFieldName 	= makeFileField(customCACertificateFieldName);
	const clientCertificateFileFieldName 	= makeFileField(clientCertificateFieldName);
	const clientPrivateKeyFileFieldName 	= makeFileField(clientPrivateKeyFieldName);

	const [connected, setConnected] = React.useState(false);
	const { selectedConnectionToEdit: connection = {} } = props;
	let editModeEnabledByDefault = false;
	if (!connection.id) {
		connection.id = 'default';
		editModeEnabledByDefault = true;
	}

	const classes = useStyles();
	const [value, setValue] = React.useState(0);
	const [showPassword, setShowPassword] = React.useState(false);
	const [editMode, setEditMode] = React.useState(editModeEnabledByDefault);
	const { enqueueSnackbar } = useSnackbar();

	const [updatedConnection, setUpdatedConnection] = React.useState({
		...connection,
		[verifyServerCertificateFieldName]: true,
		[customCACertificateFileFieldName]: connection[customCACertificateFileFieldName],
		[clientCertificateFileFieldName]: connection[clientCertificateFileFieldName],
		[clientPrivateKeyFileFieldName]: connection[clientPrivateKeyFileFieldName],
	});

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const history = useHistory();
	const { client: brokerClient } = context;


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
				const { error } = response;
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
			const { error } = response;
			throw error;
		}
	}

	// const fs = require('fs');

	const loadConnections = async () => {
		const brokerConnections = await brokerClient.getBrokerConnections();
		// fs.appendFileSync('logFront.txt', `(((((((((((((((((((((((((((((((BROKER CONNECTIONS ${JSON.stringify(brokerConnections)}\n`)
		dispatch(updateBrokerConnections(brokerConnections));
		const brokerConfigurations = await brokerClient.getBrokerConfigurations();
		dispatch(updateBrokerConfigurations(brokerConfigurations));
	}

	const onUpdateConnection = async (connect) => {
		try {
			await brokerClient.disconnectServerFromBroker(connection.id);
			await brokerClient.modifyConnection(connection.id, updatedConnection);
			// fs.appendFileSync('logFront.txt', `(((((((((((((((((((((((((((((((loading connections\n`)
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
					await loadConnections();
					history.push(`/config/connections`);
				} catch (error) {
					enqueueSnackbar(`Error creating connection "${connection.name}". Reason: ${error.message || error}`, {
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


	const handleFileUpload = (e) => {
        const fileReader = new FileReader();
        const name = e.target.getAttribute('name');
		const filename = e.target.files[0].name;
		
		if (!name) {
			console.error('No "name" (e.target.getAttribute("name") passed into handleFileUpload')
		}
		
		// the !clientCertificateFile part means that clientCertificate was not loaded because the respective input field hasn't been set with its name yet
		if (name === clientPrivateKeyFieldName && !updatedConnection[clientCertificateFileFieldName]) {
			setErrors({...errors, [clientCertificateFieldName]: {message: 'You have provided a private key but no certificate'}});
		}
		else if (name === clientCertificateFieldName && !updatedConnection[clientPrivateKeyFileFieldName]) {
			setErrors({...errors, [clientPrivateKeyFieldName]: {message: 'You have provided a certificate but no private key'}});
		}

        fileReader.readAsText(e.target.files[0]);


		fileReader.onerror = (e) => {
			const errorMessage = '';

			setUpdatedConnection((prevState) => ({
				...prevState,
				[makeFileField(name)]: ''
			}));

			setErrors((prevState) => ({...prevState, [name]: {message: errorMessage}}));
		};


        fileReader.onload = (e) => {
			setUpdatedConnection((prevState) => ({
				...prevState,
				[name]: e.target.result,
				[makeFileField(name)]: filename
			}));

			setErrors((prevState) => ({...prevState, [name]: null}));
			setConnected(false); // ??!!
    	};
    };


	return connection?.id ? (
		<div>
			<Paper className={classes.paper}>
				<form className={classes.form} noValidate autoComplete="off">
					<div className={classes.margin}>
						<Grid container spacing={1} alignItems="flex-end">
							<Grid item xs={12}>
								<TextField
									required={editMode}
									disabled
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
									className={classes.textField}
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
									required={editMode}
									disabled
									id="name"
									label="Name"
									value={updatedConnection.name}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
									onChange={(event) => {
										if (editMode) {
											setUpdatedConnection({
												...updatedConnection,
												name: event.target.value
											});
										}
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									required={editMode}
									disabled={!editMode}
									id="url"
									label="URL"
									value={updatedConnection.url}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
									onChange={(event) => {
										if (editMode) {
											setUpdatedConnection({
												...updatedConnection,
												url: event.target.value
											});
											setConnected(false);
										}
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									required={false}
									disabled={!editMode}
									id="username"
									label="Username"
									value={updatedConnection.credentials?.username}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
									onChange={(event) => {
										if (editMode) {
											setUpdatedConnection({
												...updatedConnection,
												credentials: {
													username: event.target.value,
													password: updatedConnection.credentials.password,
												}
											});
											setConnected(false);
										}
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									required={false}
									disabled={!editMode}
									id="password"
									type="password"
									label="Password"
									value={updatedConnection.credentials?.password}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
									onChange={(event) => {
										if (editMode) {
											setUpdatedConnection({
												...updatedConnection,
												credentials: {
													username: updatedConnection.credentials.username,
													password: event.target.value
												}
											});
											setConnected(false);
										}
									}}
								/>
							</Grid>
						</Grid>

						<div style={{padding: '5px'}}></div>
						<div className={`${classes.parent} ${classes.padTop} ${classes.padSidesSmall}`}>
							<div className={classes.overlayed}><Typography className={classes.smallFont}>Server certificate</Typography></div>
							<Grid container direction={'row'} spacing={1} alignItems="flex-end" className={`${classes.container} ${classes.parent} ${classes.padTop2}`}>
								<Grid item xl={6} md={6} sm={6} xs={6}>
									<FormGroup>
										<FormControlLabel
											control={
													<Switch
														size="small"
														disabled={!editMode}
														checked={updatedConnection[verifyServerCertificateFieldName]}
														onChange={(event) => {
															console.log('connection:', connection);
															console.log('updatedConnection:', updatedConnection);

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
								<Grid item xl={3} md={3} sm={4} xs={4}>
									<Typography className={errors[customCACertificateFieldName] ? classes.verticallyPad : ''} align="left">CA Certificate</Typography>
								</Grid>
								<Grid item xl={7} md={7} sm={7} xs={7}>
									<FormGroup row>
										<Button
											disabled={!editMode}
											size="small"
											onChange={handleFileUpload}
											variant="contained"
											className={`${classes.button} ${classes.restrictButtonHeight}`}
											color="secondary"
											startIcon={<CloudUpload />}
											component="label"
										>
											Choose File
											<input name={customCACertificateFieldName} hidden type="file" />
										</Button>
										<TextField
											disabled={!editMode}
											className={ (errors[customCACertificateFieldName]) ? classes.filenameFieldExpanded : classes.filenameField }
											size="small"
											inputProps={{ readOnly: true, }}
											id="standard-basic"
											label=""
											variant="standard"
											value={updatedConnection[customCACertificateFileFieldName]}
											error={!!errors[customCACertificateFieldName]}
											helperText={errors[customCACertificateFieldName]?.message}
										/>
									</FormGroup>
								</Grid>
								<Grid item xl={2} md={2} sm={1} xs={1}>
								</Grid>
							</Grid>
						</div>
						<div className={`${classes.parent} ${classes.padTop} ${classes.padSidesSmall}`}>
							<div className={classes.overlayed}><Typography className={classes.smallFont}>Client certificate</Typography></div>
							<Grid container direction={'row'} spacing={1} alignItems="flex-end" className={`${classes.container} ${classes.parent} ${classes.padTop2}`}>
								<Grid item xl={3} md={3} sm={4} xs={4}>
									<Typography className={errors[clientCertificateFieldName] ? classes.verticallyPad : ''} align="left">Certificate</Typography>
								</Grid>
								<Grid item xl={7} md={7} sm={7} xs={7}>
									<FormGroup row>
										<Button
											disabled={!editMode}
											size="small"
											onChange={handleFileUpload}
											variant="contained"
											color="secondary"
											className={`${classes.button} ${classes.restrictButtonHeight}`}
											startIcon={<CloudUpload />}
											component="label"
										>
											Choose File
											<input name={clientCertificateFieldName} hidden type="file" />
										</Button>
										<TextField 
											disabled={!editMode}
											className={ (errors[clientCertificateFieldName]) ? classes.filenameFieldExpanded : classes.filenameField }
											size="small"
											inputProps={{ readOnly: true, }}
											id="standard-basic"
											label=""
											variant="standard"
											value={updatedConnection[clientCertificateFileFieldName]}
											error={!!errors[clientCertificateFieldName]}
											helperText={errors[clientCertificateFieldName]?.message}
										/>
									</FormGroup>
								</Grid>
								<Grid item xl={2} md={2} sm={1} xs={1}>
								</Grid>


								<Grid item xl={3} md={3} sm={4} xs={4}>
									<Typography className={(errors[clientPrivateKeyFieldName]) ? classes.verticallyPad : ''} align="left">Private Key</Typography>
								</Grid>
								<Grid item xl={7} md={7} sm={7} xs={7}>
									<FormGroup row>
										<Button
											disabled={!editMode}
											size="small"
											onChange={handleFileUpload}
											variant="contained"
											color="secondary"
											className={`${classes.button} ${classes.restrictButtonHeight}`}
											startIcon={<CloudUpload />}
											component="label"
										>
											Choose File
											<input name={clientPrivateKeyFieldName} hidden type="file" />
										</Button>
										<TextField
											disabled={!editMode}
											className={ (errors[clientPrivateKeyFieldName]) ? classes.filenameFieldExpanded : classes.filenameField }
											size="small"
											inputProps={{ readOnly: true, }}
											id="standard-basic"
											label=""
											variant="standard"
											value={updatedConnection[clientPrivateKeyFileFieldName]}
											error={!!errors[clientPrivateKeyFieldName]}
											helperText={errors[clientPrivateKeyFieldName]?.message}
										/>
									</FormGroup>
								</Grid>
								<Grid item xl={2} md={2} sm={1} xs={1}>
								</Grid>
							</Grid>
						</div>
					</div>
				</form>
					<Grid item xs={12} className={classes.buttons}>
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
								color="primary"
								className={classes.button}
								startIcon={<EditIcon />}
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
									color="primary"
									className={classes.button}
									startIcon={<SaveIcon />}
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
									className={classes.button}
									startIcon={<SaveIcon />}
									onClick={(event) => {
										event.stopPropagation();
										onUpdateConnection();
									}}
								>
									Save
								</Button>
								<Button
									variant="contained"
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
			</Paper>
		</div>
	) : (
		<Redirect to="/config/connections" push />
	);
};

const mapStateToProps = (state) => {
	return {
		selectedConnectionToEdit: state.brokerConnections?.selectedConnectionToEdit
	};
};

export default connect(mapStateToProps)(ConnectionDetailComponent);
