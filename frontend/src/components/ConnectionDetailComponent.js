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
		margin: theme.spacing(1)
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
