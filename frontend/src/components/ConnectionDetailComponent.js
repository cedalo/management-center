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
	}
}));

const ConnectionDetailComponent = (props) => {
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
		...connection
	});

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const history = useHistory();
	const { client: brokerClient } = context;

	const validate = () => {
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
					await doConnect(connection);
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


	const [verifyServerCertificate, setVerifyServerCertificate] = React.useState(false);

	const [clientPrivateKeyFileName, setClientPrivateKeyFileName] = React.useState('');
	const [customCACertificateFileName, setCustomCACertificateFileName] = React.useState('');
	const [clientCertificateFileName, setClientCertificateFileName] = React.useState('');

	const [errors, setErrors] = React.useState({});


	const handleFileUpload = (e) => {
		console.log('handle file is kinda called');

        const fileReader = new FileReader();
        const name = e.target.getAttribute('name');
		const filename = e.target.files[0].name;
		
		if (!name) {
			console.error('No "name" (e.target.getAttribute("name") passed into handleFileUpload')
		}
		
		
		console.log("name === 'clientPrivateKey' && !clientCertificateFileName", name === 'clientPrivateKey' && !clientCertificateFileName)
		console.log("name === 'clientCertificate' && !clientPrivateKeyFileName", name === 'clientCertificate' && !clientPrivateKeyFileName)
		if (name === 'clientPrivateKey' && !clientCertificateFileName) {
			setErrors({...errors, clientCertificate: {message: 'You have provided a private key but no certificate'}}, () => {console.log('state set 1'); console.log('errors:', errors); });
		}
		else if (name === 'clientCertificate' && !clientPrivateKeyFileName) {
			setErrors({...errors, clientPrivateKey: {message: 'You have provided a certificate but no private key'}}, () => {console.log('state set 1'); console.log('errors:', errors);});
		}

        fileReader.readAsDataURL(e.target.files[0]);


		fileReader.onerror = (e) => {
			const errorMessage = '';

			console.log('onerrorcalled')

			switch (name) {
				case 'clientPrivateKey':
					setClientPrivateKeyFileName('');
					setErrors((prevState) => ({...prevState, clientPrivateKey: {message: errorMessage}}));
					break;
				case 'customCACertificate':
					setCustomCACertificateFileName('');
					setErrors((prevState) => ({...prevState, customCACertificate: {message: errorMessage}}));
					break;
				case 'clientCertificate':
					setClientCertificateFileName('');
					setErrors((prevState) => ({...prevState, clientCertificate: {message: errorMessage}}));
					break;
				default:
					;
			}
		};


        fileReader.onload = (e) => {
			setUpdatedConnection((prevState) => ({
				...prevState,
				[name]: e.target.result
			}));
			
			switch (name) {
				case 'clientPrivateKey':
					setClientPrivateKeyFileName(filename);
					setErrors((prevState) => ({...prevState, clientPrivateKey: null}));
					break;
				case 'customCACertificate':
					setCustomCACertificateFileName(filename);
					setErrors((prevState) => ({...prevState, customCACertificate: null}));
					break;
				case 'clientCertificate':
					setClientCertificateFileName(filename);
					setErrors((prevState) => ({...prevState, clientCertificate: null}));
					break;
				default:
					;
			}

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
														value={verifyServerCertificate}
														onChange={(event) => {
															if (editMode) {
																setVerifyServerCertificate({
																	...updatedConnection,
																	verifyServerCertificate: event.target.value
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
									<Typography align="left">CA Certificate</Typography>
								</Grid>
								<Grid item xl={7} md={7} sm={7} xs={7}>
									<FormGroup row>
										<Button
											disabled={!editMode}
											size="small"
											onChange={handleFileUpload}
											variant="contained"
											className={classes.button}
											color="secondary"
											startIcon={<CloudUpload />}
											component="label"
										>
											Choose File
											<input name="customCACertificate" hidden type="file" />
										</Button>
										<TextField
											disabled={!editMode}
											className={ (errors?.customCACertificate) ? classes.filenameFieldExpanded : classes.filenameField }
											size="small"
											inputProps={{ readOnly: true, }}
											id="standard-basic"
											label=""
											variant="standard"
											value={customCACertificateFileName}
											error={!!errors.customCACertificate}
											helperText={errors?.customCACertificate?.message}
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
									<Typography align="left">Certificate</Typography>
								</Grid>
								<Grid item xl={7} md={7} sm={7} xs={7}>
									<FormGroup row>
										<Button
											disabled={!editMode}
											size="small"
											onChange={handleFileUpload}
											variant="contained"
											color="secondary"
											className={classes.button}
											startIcon={<CloudUpload />}
											component="label"
										>
											Choose File
											<input name="clientCertificate" hidden type="file" />
										</Button>
										<TextField 
											disabled={!editMode}
											className={ (errors?.clientCertificate) ? classes.filenameFieldExpanded : classes.filenameField }
											size="small"
											inputProps={{ readOnly: true, }}
											id="standard-basic"
											label=""
											variant="standard"
											value={clientCertificateFileName}
											error={!!errors.clientCertificate}
											helperText={errors?.clientCertificate?.message}
										/>
									</FormGroup>
								</Grid>
								<Grid item xl={2} md={2} sm={1} xs={1}>
								</Grid>


								<Grid item xl={3} md={3} sm={4} xs={4}>
									<Typography align="left">Private Key</Typography>
								</Grid>
								<Grid item xl={7} md={7} sm={7} xs={7}>
									<FormGroup row>
										<Button
											disabled={!editMode}
											size="small"
											onChange={handleFileUpload}
											variant="contained"
											color="secondary"
											className={classes.button}
											startIcon={<CloudUpload />}
											component="label"
										>
											Choose File
											<input name="clientPrivateKey" hidden type="file" />
										</Button>
										<TextField
											disabled={!editMode}
											className={ (errors?.clientPrivateKey) ? classes.filenameFieldExpanded : classes.filenameField }
											size="small"
											inputProps={{ readOnly: true, }}
											id="standard-basic"
											label=""
											variant="standard"
											value={clientPrivateKeyFileName}
											error={!!errors.clientPrivateKey}
											helperText={errors?.clientPrivateKey?.message}
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
