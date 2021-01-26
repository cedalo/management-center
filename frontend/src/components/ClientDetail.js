import React, { useContext, useState } from 'react';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateClient, updateClients } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AccountCircle from '@material-ui/icons/AccountCircle';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import ClientIDIcon from '@material-ui/icons/Fingerprint';
import ClientIcon from '@material-ui/icons/Person';
import CredentialsIcon from '@material-ui/icons/Lock';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import GroupIcon from '@material-ui/icons/Group';
import GroupsIcon from '@material-ui/icons/Group';
import HidePasswordIcon from '@material-ui/icons/VisibilityOff';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PasswordIcon from '@material-ui/icons/VpnKey';
import PropTypes from 'prop-types';
import SaveIcon from '@material-ui/icons/Save';
import ShowPasswordIcon from '@material-ui/icons/Visibility';
import Switch from '@material-ui/core/Switch';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import qs from 'qs';
import { useConfirm } from 'material-ui-confirm';

function TabPanel(props) {
	const { children, value, index, ...other } = props;

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
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const ClientDetail = (props) => {
	const classes = useStyles();
	const [value, setValue] = React.useState(0);
	const [showPassword, setShowPassword] = React.useState(false);
	const [editMode, setEditMode] = React.useState(false);
	const { enqueueSnackbar } = useSnackbar();

	const { client = {}, defaultClient } = props;
	const [updatedClient, setUpdatedClient] = React.useState({
		...client
	});

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const { client: brokerClient } = context;

	const validate = () => {
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
		const clients = await brokerClient.listClients();
		dispatch(updateClients(clients));
		setEditMode(false);
	};

	const onCancelEdit = async () => {
		await confirm({
			title: 'Cancel client editing',
			description: `Do you really want to cancel editing this client?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		setUpdatedClient({
			...client
		});
		setEditMode(false);
	};
	const {
		match: {
			params: { clientId }
		}
	} = props;
	// TODO: get client by id if current client is not defined

	return client.username ? (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security">
					Security
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security/clients">
					Clients
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					{client.username}
				</Typography>
			</Breadcrumbs>
			<br />
			<Paper className={classes.paper}>
				{/* <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="off"
        aria-label="Client"
      >
        <Tab
          label="Details"
          icon={<ClientIcon />}
          aria-label="details"
          {...a11yProps(0)}
        />
        <Tab
          label="Groups"
          icon={<GroupsIcon />}
          aria-label="groups"
          {...a11yProps(1)}
        />
      </Tabs> */}
				{/* <TabPanel value={value} index={0}> */}
				<form className={classes.form} noValidate autoComplete="off">
					<div className={classes.margin}>
						<Grid container spacing={1} alignItems="flex-end">
							<Grid item xs={12}>
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
									label="username"
									value={updatedClient.username}
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
									disabled={!editMode}
									  onChange={(event) => {
										  if (editMode) {
											setUpdatedClient({
												...updatedClient,
												password: event.target.value
											})
										  }
									  }}
									id="password"
									label="Password"
									value={client.password}
									// defaultValue="*****"
									variant="outlined"
									fullWidth
									type={showPassword ? 'text' : 'password'}
									className={classes.textField}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<PasswordIcon />
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
							</Grid>
							<Grid item xs={12}>
								<TextField
									disabled={!editMode}
									id="client-id"
									label="Client ID"
									value={updatedClient.clientid}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
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
												<ClientIDIcon />
											</InputAdornment>
										)
									}}
								/>
							</Grid>
							<Grid item xs={12}>
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
									label="Text name"
									value={updatedClient.textname}
									//   onChange={(event) => setTextName(event.target.value)}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
								/>
							</Grid>
							<Grid item xs={12}>
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
									label="Text description"
									value={updatedClient.textdescription}
									//   onChange={(event) => setTextDescription(event.target.value)}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
								/>
							</Grid>
						</Grid>
					</div>
				</form>
				{/* </TabPanel> */}
				{/* <TabPanel value={value} index={1}>
	  <List className={classes.root}>
          {client.groups?.map((group) => (
            <React.Fragment>
              <ListItem button>
                <ListItemText
                  primary={group.groupname}
                  secondary={group.textdescription}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </TabPanel> */}
				{!editMode && defaultClient?.username !== client.username && (
					<Grid item xs={12} className={classes.buttons}>
						<Button
							variant="contained"
							color="primary"
							className={classes.button}
							startIcon={<EditIcon />}
							onClick={() => setEditMode(true)}
						>
							Edit
						</Button>
					</Grid>
				)}
				{editMode && defaultClient?.username !== client.username && (
					<Grid item xs={12} className={classes.buttons}>
						<Button
							variant="contained"
							disabled={!validate()}
							color="primary"
							className={classes.button}
							startIcon={<SaveIcon />}
							onClick={(event) => {
								event.stopPropagation();
								onUpdateClient();
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
					</Grid>
				)}
			</Paper>
		</div>
	) : (
		<Redirect to="/security/clients" push />
	);
};

ClientDetail.propTypes = {
	client: clientShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		client: state.clients?.client,
		defaultClient: state.brokerConnections?.defaultClient
	};
};

export default connect(mapStateToProps)(ClientDetail);
