import { connect, useDispatch } from 'react-redux';
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Paper from '@material-ui/core/Paper';
import ClientIDIcon from '@material-ui/icons/Fingerprint';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import PasswordIcon from '@material-ui/icons/VpnKey';
import ClientIcon from '@material-ui/icons/Person';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import AccountCircle from '@material-ui/icons/AccountCircle';
import SaveIcon from '@material-ui/icons/Save';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Link as RouterLink } from 'react-router-dom';
import { WebSocketContext } from '../websockets/WebSocket';
import { updateClient, updateClients } from '../actions/actions';

const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
			margin: theme.spacing(1)
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
			width: '75ch'
		}
	},
	buttons: {
		'& > *': {
			margin: theme.spacing(1)
		}
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
	margin: {
		margin: theme.spacing(2)
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const ClientNew = (props) => {
	const classes = useStyles();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [clientID, setClientID] = useState('');
	const [textname, setTextname] = useState('');
	const [textdescription, setTextdescription] = useState('');

	const usernameExists = props?.clients?.find((searchClient) => {
		return searchClient.username === username;
	});

	const validate = () => {
		const valid = !usernameExists && password !== '';
		return valid;
	};

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { client } = context;

	const onSaveClient = async () => {
		await client.createClient(username, password, clientID, '', textname, textdescription);
		const clients = await client.listClients();
		dispatch(updateClients(clients));
		history.push(`/security/clients`);
	};

	const onCancel = async () => {
		await confirm({
			title: 'Cancel client creation',
			description: `Do you really want to cancel creating this client?`,
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
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security">
					Security
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Clients
				</Typography>
			</Breadcrumbs>
			<br />
			<div className={classes.root}>
				<Paper>
					<form className={classes.form} noValidate autoComplete="off">
						<div className={classes.margin}>
							<Grid container spacing={1} alignItems="flex-end">
								<Grid item xs={12}>
									<TextField
										error={usernameExists}
										helperText={usernameExists && 'A client with this username already exists.'}
										required
										id="username"
										label="username"
										onChange={(event) => setUsername(event.target.value)}
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
										required
										id="password"
										label="Password"
										onChange={(event) => setPassword(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										type="password"
										className={classes.textField}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<PasswordIcon />
												</InputAdornment>
											)
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										id="client-id"
										label="Client ID"
										onChange={(event) => setClientID(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<ClientIDIcon />
												</InputAdornment>
											)
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										id="textname"
										label="Text name"
										onChange={(event) => setTextname(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
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
										className={classes.textField}
									/>
								</Grid>
								<Grid container xs={12} alignItems="flex-start">
									<Grid item xs={12} className={classes.buttons}>
										<Button
											variant="contained"
											disabled={!validate()}
											color="primary"
											className={classes.button}
											startIcon={<SaveIcon />}
											onClick={(event) => {
												event.stopPropagation();
												onSaveClient();
											}}
										>
											Save
										</Button>
										<Button
											variant="contained"
											onClick={(event) => {
												event.stopPropagation();
												onCancel();
											}}
										>
											Cancel
										</Button>
									</Grid>
								</Grid>
							</Grid>
						</div>
					</form>
				</Paper>
			</div>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		clients: state.clients?.clients
	};
};

export default connect(mapStateToProps)(ClientNew);
