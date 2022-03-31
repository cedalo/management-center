import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateEditDefaultClient, updateRole, updateRoles } from '../actions/actions';
import { useSnackbar } from 'notistack';

import ACLIcon from '@mui/icons-material/Security';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ACLTypesHelpDialog from './ACLTypesHelpDialog';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import ClientIDIcon from '@mui/icons-material/Fingerprint';
import CredentialsIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import GroupIcon from '@mui/icons-material/Group';
import GroupsIcon from '@mui/icons-material/Group';
import HelpIcon from '@mui/icons-material/Help';
import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import PasswordIcon from '@mui/icons-material/VpnKey';
import PropTypes from 'prop-types';
import RoleIcon from '@mui/icons-material/Policy';
import SaveIcon from '@mui/icons-material/AddCircle';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';

const PREFIX = 'RoleDetail';

const classes = {
    root: `${PREFIX}-root`,
    form: `${PREFIX}-form`,
    textField: `${PREFIX}-textField`,
    buttons: `${PREFIX}-buttons`,
    margin: `${PREFIX}-margin`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const StyledRedirect = styled(Redirect)((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
		width: '100%',
		backgroundColor: theme.palette.background.paper
	},

    [`& .${classes.form}`]: {
		display: 'flex',
		flexWrap: 'wrap'
	},

    [`& .${classes.textField}`]: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
	},

    [`& .${classes.buttons}`]: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},

    [`& .${classes.margin}`]: {
		margin: theme.spacing(1)
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

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


const RoleDetail = (props) => {

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
					scrollButtons={false}
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
								<Hidden smDown implementation="css">
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
                                                            edge="end"
                                                            aria-label="help"
                                                            onClick={handleOpenACLTypesHelpDialog}
                                                            size="large">
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
																<IconButton edge="end" aria-label="delete" size="large">
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
		<StyledRedirect to="/security/roles" push />
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
