import React, { useContext, useState } from 'react';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateEditDefaultClient, updateRole, updateRoles } from '../actions/actions';
import { useSnackbar } from 'notistack';

import ACLIcon from '@material-ui/icons/Security';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ACLTypesHelpDialog from './ACLTypesHelpDialog';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import ClientIDIcon from '@material-ui/icons/Fingerprint';
import CredentialsIcon from '@material-ui/icons/Lock';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import GroupIcon from '@material-ui/icons/Group';
import GroupsIcon from '@material-ui/icons/Group';
import HelpIcon from '@material-ui/icons/Help';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import PasswordIcon from '@material-ui/icons/VpnKey';
import PropTypes from 'prop-types';
import RoleIcon from '@material-ui/icons/Policy';
import SaveIcon from '@material-ui/icons/AddCircle';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import Tab from '@material-ui/core/Tab';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';

const ACL_TABLE_COLUMNS = [
	{ id: 'type', key: 'Type' },
	{ id: 'topic', key: 'Topic' },
	{ id: 'priority', key: 'Priority' },
	{ id: 'allow', key: 'Allow / Deny' }
];

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

const roleShape = PropTypes.shape({
	rolename: PropTypes.string
});

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%',
		backgroundColor: theme.palette.background.paper
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


const RoleDetail = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;

	const { defaultClient, role = {}, onSort, sortBy, sortDirection } = props;

	const [aclTypesHelpDialogOpen, setACLTypesHelpDialogOpen] = React.useState(false);

	const handleOpenACLTypesHelpDialog = () => {
		setACLTypesHelpDialogOpen(true);
	};

	const handleCloseACLTypesHelpDialog = () => {
		setACLTypesHelpDialogOpen(false);
	};

	const [selectedTab, setSelectedTab] = React.useState(0);
	const [newACL, setNewACL] = React.useState({
		acltype: 'publishClientReceive',
		allow: true,
		topic: '',
		priority: 0
	});

	const [editMode, setEditMode] = React.useState(false);
	const [updatedRole, setUpdatedRole] = React.useState({
		...role
	});

	const validate = () => {
		const valid = updatedRole.rolename !== '';
		return valid;
	};

	const validateACL = () => {
		const valid = newACL.topic !== '' && newACL.priority !== '';
		return valid;
	};

	const handleChange = (event, newSelectedTab) => {
		setSelectedTab(newSelectedTab);
	};

	const onUpdateRole = async () => {
		// TODO: quick hack
		delete updatedRole.groups;
		delete updatedRole.roles;
		await brokerClient.modifyRole(updatedRole);
		enqueueSnackbar('Role successfully updated', {
			variant: 'success'
		});
		const roleObject = await brokerClient.getRole(role.rolename);
		dispatch(updateRole(roleObject));
		const roles = await brokerClient.listRoles();
		dispatch(updateRoles(roles));
		setEditMode(false);
	};

	const onCancelEdit = async () => {
		await confirm({
			title: 'Cancel role editing',
			description: `Do you really want to cancel editing this role?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		setUpdatedRole({
			...role
		});
		setEditMode(false);
	};

	const showConfirm = async () => {
		const hasRole = await brokerClient.clientHasRole(defaultClient.username, role.rolename);
		if (hasRole) {
			await confirm({
				title: 'Edit role',
				description: `You are about to edit a role associated with the user that is used by the Management Center server to connect to your broker instance. 
				The Management Center server will therefore be disconnected from the broker and automatically reconnected when the changes are applied.`,
				cancellationButtonProps: {
					variant: 'contained'
				},
				confirmationButtonProps: {
					color: 'primary',
					variant: 'contained'
				}
			});
			dispatch(updateEditDefaultClient(true));
		}
	}

	const onAddACL = async (acl) => {
		await showConfirm();
		await brokerClient.addRoleACL(role.rolename, acl);
		const updatedRole = await brokerClient.getRole(role.rolename);
		dispatch(updateRole(updatedRole));
		setNewACL({
			acltype: 'publishClientReceive',
			allow: true,
			topic: '',
			priority: 0
		});
		const roles = await brokerClient.listRoles();
		dispatch(updateRoles(roles));
	};

	const onRemoveACL = async (acl) => {
		// await confirm({
		// 	title: 'Confirm ACL deletion',
		// 	description: `Do you really want to delete the ACL "${acl.topic}"?`,
		// 	cancellationButtonProps: {
		// 		variant: 'contained'
		// 	},
		// 	confirmationButtonProps: {
		// 		color: 'primary',
		// 		variant: 'contained'
		// 	}
		// });
		await showConfirm();
		await brokerClient.removeRoleACL(role.rolename, acl);
		const updatedRole = await brokerClient.getRole(role.rolename);
		dispatch(updateRole(updatedRole));
		const roles = await brokerClient.listRoles();
		dispatch(updateRoles(roles));
	};

	return role.rolename ? (
		<div>
			<ACLTypesHelpDialog open={aclTypesHelpDialogOpen} handleClose={handleCloseACLTypesHelpDialog} />
			<Breadcrumbs maxItems={2} aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security">
					Security
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security/roles">
					Roles
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					{role.rolename}
				</Typography>
			</Breadcrumbs>
			<br />
			<Paper className={classes.paper}>
				<Tabs
					value={selectedTab}
					onChange={handleChange}
					variant="scrollable"
					scrollButtons="off"
					aria-label="Role"
				>
					<Tab label="Details" icon={<RoleIcon />} aria-label="details" {...a11yProps(0)} />
					{/* <Tab
          label="Features"
          icon={<UserIcon />}
          aria-label="features"
          {...a11yProps(1)}
        />
        <Tab
          label="Topics"
          icon={<UserIcon />}
          aria-label="topics"
          {...a11yProps(2)}
        /> */}
					<Tab label="ACLs" icon={<ACLIcon />} aria-label="acls" {...a11yProps(1)} />
					{/* <Tab
          label="Groups"
          icon={<GroupsIcon />}
          aria-label="groups"
          {...a11yProps(2)}
        /> */}
				</Tabs>
				<TabPanel value={selectedTab} index={0}>
					<form className={classes.form} noValidate autoComplete="off">
						<div className={classes.margin}>
							<Grid container spacing={1} alignItems="flex-end">
								<Grid item xs={12}>
									<TextField
										required
										disabled
										id="role-name"
										label="Name"
										value={updatedRole.rolename}
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
										disabled={!editMode}
										onChange={(event) => {
											if (editMode) {
												setUpdatedRole({
													...updatedRole,
													textname: event.target.value
												});
											}
										}}
										id="textname"
										label="Text name"
										value={updatedRole.textname}
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
												setUpdatedRole({
													...updatedRole,
													textdescription: event.target.value
												});
											}
										}}
										id="textdescription"
										label="Text description"
										value={updatedRole.textdescription}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid>
							</Grid>
						</div>
					</form>
					{/* <List className={classes.root}>
          {role.features?.map((feature) => (
            <React.Fragment>
              <ListItem button>
                <ListItemText
                  primary={feature.name}
                  secondary={<span>Allow: {feature.allow}</span>}
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
        </List> */}
				</TabPanel>
				<TabPanel value={selectedTab} index={1}>
					<form className={classes.form} noValidate autoComplete="off">
						<div className={classes.margin}>
							<Grid container spacing={1} alignItems="flex-end">
								<Hidden xsDown implementation="css">
									<TableContainer component={Paper}>
										<Table>
											<TableHead>
												<TableRow>
													{ACL_TABLE_COLUMNS.map((column) => (
														<TableCell
															key={column.id}
															sortDirection={sortBy === column.id ? sortDirection : false}
														>
															<TableSortLabel
																active={sortBy === column.id}
																direction={sortDirection}
																onClick={() => onSort(column.id)}
															>
																{column.key}
															</TableSortLabel>
														</TableCell>
													))}
													<TableCell />
												</TableRow>
											</TableHead>
											<TableBody>
												{role &&
													role.acls &&
													role.acls.map((acl) => (
														<TableRow
															hover
															// TODO: add key
															// key={role.rolename}
														>
															<TableCell>{acl.acltype}</TableCell>

															<TableCell>{acl.topic}</TableCell>

															<TableCell>{acl.priority}</TableCell>

															<TableCell>
																{/* <Checkbox
						checked={acl.allow}
						disabled
					/> */}
																<Select disabled value={acl.allow ? 'allow' : 'deny'}>
																	<MenuItem value="allow">allow</MenuItem>
																	<MenuItem value="deny">deny</MenuItem>
																</Select>
															</TableCell>

															<TableCell align="right">
																<IconButton
																	size="small"
																	onClick={(event) => {
																		event.stopPropagation();
																		onRemoveACL(acl);
																	}}
																>
																	<DeleteIcon fontSize="small" />
																</IconButton>
															</TableCell>
														</TableRow>
													))}
												<TableRow
												// TODO: add key
												// key={role.rolename}
												>
													<TableCell>
														<FormControl>
															<InputLabel id="new-acl-type-label">ACL Type</InputLabel>
															<Select
																labelId="new-acl-type-label"
																id="new-acl-type"
																value={newACL.acltype}
																defaultValue="publishClientToBroker"
																onChange={(event) =>
																	setNewACL({
																		...newACL,
																		acltype: event.target.value
																	})
																}
															>
																<MenuItem value={'publishClientSend'}>
																	publishClientSend
																</MenuItem>
																<MenuItem value={'publishClientReceive'}>
																	publishClientReceive
																</MenuItem>
																<MenuItem value={'subscribeLiteral'}>
																	subscribeLiteral
																</MenuItem>
																<MenuItem value={'subscribePattern'}>
																	subscribePattern
																</MenuItem>
																<MenuItem value={'unsubscribeLiteral'}>
																	unsubscribeLiteral
																</MenuItem>
																<MenuItem value={'unsubscribePattern'}>
																	unsubscribePattern
																</MenuItem>
															</Select>
														</FormControl>
														<IconButton
															variant="contained"
															edge="end" aria-label="help"
															onClick={handleOpenACLTypesHelpDialog}
														>
															<HelpIcon fontSize="small" />
														</IconButton>
													</TableCell>

													<TableCell>
														<TextField
															required
															id="new-acl-topic"
															label="Topic"
															value={newACL.topic}
															onChange={(event) =>
																setNewACL({
																	...newACL,
																	topic: event.target.value
																})
															}
														/>
													</TableCell>

													<TableCell>
														<TextField
															required
															id="new-acl-priority"
															label="Priority"
															value={newACL.priority}
															type="number"
															onChange={(event) =>
																setNewACL({
																	...newACL,
																	priority:
																		event.target.value !== ''
																			? parseInt(event.target.value)
																			: ''
																})
															}
														/>
													</TableCell>

													<TableCell>
														{/* <Checkbox
						checked={newACL.allow}
						onChange={(event) => setNewACL({
							...newACL,
							allow: event.target.checked
						})}
					/> */}

														<FormControl>
															<InputLabel id="allow-deny-label"></InputLabel>
															<Select
																value={newACL.allow ? 'allow' : 'deny'}
																onChange={(event) => {
																	setNewACL({
																		...newACL,
																		allow: event.target.value === 'allow'
																	});
																}}
															>
																<MenuItem value="allow">allow</MenuItem>
																<MenuItem value="deny">deny</MenuItem>
															</Select>
														</FormControl>
													</TableCell>

													<TableCell align="right">
														<Button
															disabled={!validateACL()}
															variant="contained"
															color="primary"
															startIcon={<SaveIcon />}
															onClick={(event) => {
																event.stopPropagation();
																onAddACL(newACL);
															}}
														>
															Add
														</Button>
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</TableContainer>
								</Hidden>
								<Hidden smUp implementation="css">
									<Paper>
										<List className={classes.root}>
											{role &&
												role.acls &&
												role.acls.map((acl) => (
													<React.Fragment>
														<ListItem button>
															<ListItemText
																primary={acl.acltype}
																secondary={
																	<React.Fragment>
																		<Typography
																			component="span"
																			variant="body2"
																			className={classes.inline}
																			color="textPrimary"
																		>
																			Topic: {acl.topic}
																		</Typography>
																		<br />
																		<Typography
																			component="span"
																			variant="body2"
																			className={classes.inline}
																			color="textPrimary"
																		>
																			Priority: {acl.priority}
																		</Typography>
																		<br />
																		<Typography
																			component="span"
																			variant="body2"
																			className={classes.inline}
																			color="textPrimary"
																		>
																			Allow:{' '}
																			<Checkbox checked={acl.allow} disabled />
																		</Typography>
																	</React.Fragment>
																}
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
									</Paper>
								</Hidden>
							</Grid>
						</div>
					</form>
				</TabPanel>
				{!editMode && selectedTab === 0 && (
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
				{editMode && selectedTab === 0 && (
					<Grid item xs={12} className={classes.buttons}>
						<Button
							variant="contained"
							disabled={!validate()}
							color="primary"
							className={classes.button}
							startIcon={<SaveIcon />}
							onClick={(event) => {
								event.stopPropagation();
								onUpdateRole();
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
		<Redirect to="/security/roles" push />
	);
};

RoleDetail.propTypes = {
	role: roleShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		role: state.roles?.role,
		roles: state.roles?.roles,
		defaultClient: state.brokerConnections?.defaultClient
	};
};

export default connect(mapStateToProps)(RoleDetail);
