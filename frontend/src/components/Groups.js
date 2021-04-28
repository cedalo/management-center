import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { updateAnonymousGroup, updateClients, updateGroup, updateGroups } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@material-ui/icons/Add';
import { Alert, AlertTitle } from '@material-ui/lab';
import AnonymousGroupSelect from './AnonymousGroupSelect';
import AutoSuggest from './AutoSuggest';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import ClientIcon from '@material-ui/icons/Person';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
// import Fab from '@material-ui/core/Fab';
import FormControl from '@material-ui/core/FormControl';
import GroupIcon from '@material-ui/icons/Group';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
	tableContainer: {
		minHeight: '500px'
	},
	select: {
		backgroundColor: 'rgba(255,255,255,0.2)',
		border: 'thin solid rgba(255,255,255,0.5)',
		'label + &': {
			marginTop: theme.spacing(1)
		}
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.5)
		}
	},
	// fab: {
	// 	position: 'absolute',
	// 	bottom: theme.spacing(2),
	// 	right: theme.spacing(2)
	// },
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const groupShape = PropTypes.shape({
	groupname: PropTypes.string
});

const GROUP_TABLE_COLUMNS = [
	{ id: 'groupname', key: 'Name' },
	{ id: 'textname', key: 'Text name' },
	{ id: 'textdescription', key: 'Description' },
	{ id: 'clients', key: 'Clients' },
	{ id: 'roles', key: 'Group Roles' }
];

const FormattedGroupType = (props) => {
	switch (props.provider) {
		case 'local':
			return 'Local';
		default:
			return props.provider || '';
	}
};

const Groups = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client } = context;

	const onUpdateGroupClients = async (group, clients = []) => {
		if (!clients) {
			clients = [];
		}
		const clientNames = clients.map((client) => client.value);
		await client.updateGroupClients(group, clientNames);
		const groups = await client.listGroups();
		dispatch(updateGroups(groups));
		const clientsUpdated = await client.listClients();
		dispatch(updateClients(clientsUpdated));
	};

	const onUpdateGroupRoles = async (group, roles = []) => {
		if (!roles) {
			roles = [];
		}
		const rolenames = roles.map((role) => role.value);
		await client.updateGroupRoles(group, rolenames);
		const groups = await client.listGroups();
		dispatch(updateGroups(groups));
	};

	const onUpdateAnonymousGroup = async (groupname) => {
		await client.setAnonymousGroup(groupname);
		const group = await client.getAnonymousGroup();
		dispatch(updateAnonymousGroup(group));
		enqueueSnackbar('Anonymous group successfully set', {
			variant: 'success'
		});
	}

	const onSelectGroup = async (groupname) => {
		const group = await client.getGroup(groupname);
		dispatch(updateGroup(group));
		history.push(`/security/groups/detail/${groupname}`);
	};

	const onNewGroup = () => {
		history.push('/security/groups/new');
	};

	const onDeleteGroup = async (groupname) => {
		await confirm({
			title: 'Confirm group deletion',
			description: `Do you really want to delete the group "${groupname}"?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		await client.deleteGroup(groupname);
		enqueueSnackbar(`Group "${groupname}" successfully deleted`, {
			variant: 'success'
		});
		const groups = await client.listGroups();
		dispatch(updateGroups(groups));
		const clients = await client.listClients();
		dispatch(updateClients(clients));
	};

	const onRemoveClientFromGroup = async (username, group) => {
		await client.removeGroupClient(username, group);
		const groups = await client.listGroups();
		dispatch(updateGroups(groups));
	};

	const { dynamicsecurityFeature, anonymousGroup, groups = [], roles = [], clients = [], onSort, sortBy, sortDirection } = props;

	// TODO: probably extract into reducer
	const clientSuggestions = clients
		.map((client) => client.username)
		.sort()
		.map((username) => ({
			label: username,
			value: username
		}));

	const roleSuggestions = roles
		.map((role) => role.rolename)
		.sort()
		.map((rolename) => ({
			label: rolename,
			value: rolename
		}));

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
					Groups
				</Typography>
			</Breadcrumbs>
			{/* TODO: Quick hack to detect whether feature is supported */}
			{dynamicsecurityFeature?.supported === false ? <><br/><Alert severity="warning">
				<AlertTitle>Feature not available</AlertTitle>
				Make sure that the broker connected has the dynamic security enabled.
			</Alert></> : null}
			<br />
			{dynamicsecurityFeature?.supported !== false && <><Button
				variant="outlined"
				color="default"
				size="small"
				className={classes.button}
				startIcon={<AddIcon />}
				onClick={(event) => {
					event.stopPropagation();
					onNewGroup();
				}}
			>
				New Group
			</Button>
			<br />
			<br />
			</>}
			{dynamicsecurityFeature?.supported !== false && groups && groups.length > 0 ? (
				<div>
					<Hidden xsDown implementation="css">
						<TableContainer component={Paper} className={classes.tableContainer}>
							<Table>
								<TableHead>
									<TableRow>
										{GROUP_TABLE_COLUMNS.map((column) => (
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
									{groups &&
										groups.map((group) => (
											<TableRow
												hover
												key={group.groupname}
												onClick={(event) => {
													if (event.target.nodeName?.toLowerCase() === 'td') {
														onSelectGroup(group.groupname);
													}
												}}
												style={{ cursor: 'pointer' }}
											>
												<TableCell>{group.groupname}</TableCell>
												<TableCell>{group.textname}</TableCell>
												<TableCell>{group.textdescription}</TableCell>
												<TableCell className={classes.badges}>
													<AutoSuggest
														suggestions={clientSuggestions}
														values={group.clients.map((client) => ({
															label: client.username,
															value: client.username
														}))}
														handleChange={(value) => {
															onUpdateGroupClients(group, value);
														}}
													/>
												</TableCell>
												<TableCell className={classes.badges}>
													<AutoSuggest
														suggestions={roleSuggestions}
														values={group.roles.map((role) => ({
															label: role.rolename,
															value: role.rolename
														}))}
														handleChange={(value) => {
															onUpdateGroupRoles(group, value);
														}}
													/>
												</TableCell>
												<TableCell align="right">
													{/* <IconButton
						  size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectGroup(group.groupname);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton> */}

													<Tooltip title="Delete group">
														<IconButton
															size="small"
															onClick={(event) => {
																event.stopPropagation();
																onDeleteGroup(group.groupname);
															}}
														>
															<DeleteIcon fontSize="small" />
														</IconButton>
													</Tooltip>
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</TableContainer>
					</Hidden>
					<Hidden smUp implementation="css">
						<Paper>
							<List className={classes.root}>
								{groups.map((group) => (
									<React.Fragment>
										<ListItem
											alignItems="flex-start"
											onClick={(event) => onSelectGroup(group.groupname)}
										>
											<ListItemText
												primary={<span>{group.groupname}</span>}
												secondary={
													<React.Fragment>
														<Typography
															component="span"
															variant="body2"
															className={classes.inline}
															color="textPrimary"
														>
															{group.textname}
														</Typography>
														<span> — {group.textdescription} </span>
													</React.Fragment>
												}
											/>
											<ListItemSecondaryAction>
												<IconButton
													edge="end"
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														onSelectGroup(group.groupname);
													}}
													aria-label="edit"
												>
													<EditIcon fontSize="small" />
												</IconButton>

												<IconButton
													edge="end"
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														onDeleteGroup(group.groupname);
													}}
													aria-label="delete"
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</ListItemSecondaryAction>
										</ListItem>
										<Divider />
									</React.Fragment>
								))}
							</List>
						</Paper>
					</Hidden>
					<AnonymousGroupSelect
						onUpdateAnonymousGroup={onUpdateAnonymousGroup}
					/>
				</div>
			) : (
				<div>No groups found</div>
			)}
			{/* <Fab
				color="primary"
				aria-label="add"
				className={classes.fab}
				onClick={(event) => {
					event.stopPropagation();
					onNewGroup();
				}}
			>
				<AddIcon />
			</Fab> */}
		</div>
	);
};

Groups.propTypes = {
	groups: PropTypes.arrayOf(groupShape).isRequired,
	sortBy: PropTypes.string,
	sortDirection: PropTypes.string,
	onSort: PropTypes.func.isRequired
};

Groups.defaultProps = {
	sortBy: undefined,
	sortDirection: undefined
};

const mapStateToProps = (state) => {
	return {
		anonymousGroup: state.groups?.anonymousGroup,
		groups: state.groups?.groups,
		roles: state.roles?.roles,
		clients: state.clients?.clients,
		dynamicsecurityFeature: state.systemStatus?.features?.dynamicsecurity
	};
};

export default connect(mapStateToProps)(Groups);
