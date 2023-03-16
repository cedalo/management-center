import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import {Alert, AlertTitle} from '@material-ui/lab';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateUserGroup, updateUserGroups} from '../admin/users/actions/actions';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import SelectList from './SelectList';

const useStyles = makeStyles((theme) => ({
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
}));

const GROUP_TABLE_COLUMNS = [
	{id: 'name', key: 'Name', sortable: true, width: '10%'},
	{id: 'role', key: 'Role', sortable: true, width: '10%'},
	{id: 'description', key: 'Description', sortable: true, width: '20%'},
	{id: 'users', key: 'Users', sortable: false, width: '25%'},
	{id: 'connections', key: 'Connections', sortable: false, width: '25%'}
];

const loadUserGroups = async (client, dispatch) => {
	try {
		const userGroups = await client.listUserGroups();
		dispatch(updateUserGroups(userGroups));
	} catch (error) {
		console.error('User groups:', error.message);
	}
};

const UserGroups = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const {enqueueSnackbar} = useSnackbar();
	const {client} = context;

	const {
		userManagementFeature,
		userGroups = {},
		users = [],
		connections = [],
		onSort,
		sortBy,
		sortDirection,
		disableSort,
		doSort
	} = props;

	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
	const [userGroupsEntries, setUserGroupsEntries] = React.useState([]);
	const [userGroupsEntriesPaginated, setUserGroupsEntriesPaginated] = React.useState([]);

	React.useEffect(() => {
		loadUserGroups(client, dispatch);
		setUserGroupsEntries(Object.entries(props.userGroups));
		return () => {
		};
	}, []);


	React.useEffect(() => {
		let _userGroupsEntries = userGroupsEntries;

		if (sortBy) {
			_userGroupsEntries = doSort([...userGroupsEntries], sortDirection, (a) => a[1][sortBy])
			setUserGroupsEntries(_userGroupsEntries);
		} else {
			_userGroupsEntries = Object.entries(userGroups)
			setUserGroupsEntries(_userGroupsEntries);
		}

		// let offset = 0; // page * rowsPerPage;
		const groups = _userGroupsEntries; // .slice(offset, (offset) + rowsPerPage);

		// if (groups.length === 0 && page > 0) { // if current page has zero entries move to the previous page
		// 	setPage(page - 1);
		// 	offset = (page - 1) * rowsPerPage;
		// 	const groups = _userGroupsEntries.slice(offset, (offset) + rowsPerPage);
		// 	setUserGroupsEntriesPaginated(groups);
		// } else {
		// 	setUserGroupsEntriesPaginated(groups);
		// }
		setUserGroupsEntriesPaginated(groups);
	}, [props.userGroups, sortDirection, sortBy]);


	const handleChangePage = async (event, newPage) => {
		setPage(newPage);
		const count = rowsPerPage;
		const offset = newPage * rowsPerPage;
		const groups = userGroupsEntries.slice(offset, (offset) + count);
		setUserGroupsEntriesPaginated(groups);
		// dispatch(updateUserGroups(groups));
	};

	const handleChangeRowsPerPage = async (event) => {
		const rowsPerPage = parseInt(event.target.value, 10);
		setRowsPerPage(rowsPerPage);
		setPage(0);
		const groups = userGroupsEntries.slice(0, rowsPerPage);
		setUserGroupsEntriesPaginated(groups);
		// dispatch(updateGroups(groups));
	};

	const onUpdateGroupUsers = async (group, users = []) => {
		if (!users) {
			users = [];
		}

		const updatedGroup = {
			...group,
			users: [...users.map(el => el.value)]
		};

		try {
			const groups = await client.updateUserGroup(updatedGroup);
			dispatch(updateUserGroups(groups));
		} catch (error) {
			enqueueSnackbar(`Error updating "${group.name}": ${error}`, {
				variant: 'error'
			});
		}
	};

	const onUpdateGroupConnections = async (group, connections = []) => {
		if (!connections) {
			connections = [];
		}

		const updatedGroup = {
			...group,
			connections: [...connections.map(el => el.value)]
		};

		try {
			const groups = await client.updateUserGroup(updatedGroup);
			dispatch(updateUserGroups(groups));
		} catch (error) {
			enqueueSnackbar(`Error updating "${group.name}": ${error}`, {
				variant: 'error'
			});
		}
	};


	const onSelectGroup = async (groupname) => { //!!!
		const group = userGroups[groupname];
		dispatch(updateUserGroup({...group}));
		history.push(`/user-groups/${groupname}`);
	};

	const onNewGroup = () => {
		history.push('/user-groups/new');
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

		let groups;
		try {
			groups = await client.deleteUserGroup(groupname);
			enqueueSnackbar(`Group "${groupname}" successfully deleted`, {
				variant: 'success'
			});
			// disableSort();
			dispatch(updateUserGroups(groups));
		} catch (error) {
			enqueueSnackbar(`Error deleting "${groupname}": ${error}`, {
				variant: 'error'
			});
		}
	};


	// TODO: probably extract into reducer
	const userSuggestions = users//.filter(el => !el.isSuperAdmin) // superadmin cannot be restricted and added to a group
		.map(el => el.username)
		.sort()
		.map((username) => ({
			label: username,
			value: username
		}));

	const connectionsMap = new Map();
	connections.forEach((el) => {
		connectionsMap.set(el.id, el);
	});

	const connectionSuggestions = connections
		.sort((a, b) => {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		})
		.map(el => ({
			label: el.name,
			value: el.id
		}));


	return (
		<div style={{height: '100%'}}>
			<ContainerBreadCrumbs title="User Groups" links={[{name: 'Home', route: '/home'}]}/>
			<div style={{height: 'calc(100% - 26px)'}}>
				<div style={{display: 'grid', gridTemplateRows: 'max-content auto', height: '100%'}}>
					<ContainerHeader
						title="User Groups"
						subTitle="You can create user groups for specific connections. Only those connections that are in the group
							will be accessible to the user. The role specified in the group will override the user's role for
							the connections assigned to said group.
							A user can be added to more than one group. In this case if some of the connections in two or more
							groups are the same, a user will get the highest permissions among those overlapping connections"
						featureWarning={userManagementFeature?.supported === false ? "User Groups" : undefined}
					>
						{userManagementFeature?.supported !== false &&
							<Button
								variant="outlined"
								color="primary"
								size="small"
								startIcon={<AddIcon/>}
								onClick={(event) => {
									event.stopPropagation();
									onNewGroup();
								}}
							>
								New User Group
							</Button>
						}
					</ContainerHeader>
					{
						userManagementFeature?.supported === false ? (
							<></>
						) : (
							Object.keys(userGroups).length > 0 ? (
								<div style={{height: '100%', overflowY: 'auto'}}>
									<Hidden xsDown implementation="css">
										<TableContainer>
											<Table stickyHeader size="small" aria-label="sticky table">
												<colgroup>
													{GROUP_TABLE_COLUMNS.map((column) => (
														<col style={{width: column.width}}/>
													))}
												</colgroup>
												<TableHead>
													<TableRow>
														{GROUP_TABLE_COLUMNS.map((column) => (
															<TableCell
																key={column.id}
																sortDirection={sortBy === column.id ? sortDirection : false}
															>
																{column.sortable ? <TableSortLabel
																		active={sortBy === column.id}
																		direction={sortDirection}
																		onClick={() => onSort(column.id)}
																	>
																		{column.key}
																	</TableSortLabel> :
																	<>
																		{column.key}
																	</>}
															</TableCell>
														))}
														<TableCell/>
													</TableRow>
												</TableHead>
												<TableBody>
													{userGroupsEntriesPaginated &&
														userGroupsEntriesPaginated.map((item) => {
															const group = item[1];

															return <TableRow
																hover
																key={group.name}
																onClick={(event) => {
																	if (event.target.nodeName?.toLowerCase() === 'td') {
																		onSelectGroup(group.name);
																	}
																}}
																style={{cursor: 'pointer'}}
															>
																<TableCell>{group.name}</TableCell>
																<TableCell>{group.role}</TableCell>
																<TableCell>{group.description}</TableCell>
																<TableCell className={classes.badges}>
																	<SelectList
																		values={group?.users}
																		getValue={value => value}
																		onChange={(event, value) => {
																			onUpdateGroupUsers(group, value);
																		}}
																		disabled={false}
																		suggestions={userSuggestions}
																	/>
																</TableCell>
																<TableCell className={classes.badges}>
																	<SelectList
																		values={group?.connections
																			.filter(
																				(brokerid) => !!connectionsMap.get(
																					brokerid))}
																		getValue={value => connectionsMap.get(value).id}
																		getLabel={value => connectionsMap.get(value).name}
																		onChange={(event, value) => {
																			onUpdateGroupConnections(group, value);
																		}}
																		disabled={false}
																		suggestions={connectionSuggestions}
																	/>
																</TableCell>
																<TableCell align="right">
																	<Tooltip title="Delete group">
																		<IconButton
																			size="small"
																			onClick={(event) => {
																				event.stopPropagation();
																				onDeleteGroup(group.name);
																			}}
																		>
																			<DeleteIcon fontSize="small"/>
																		</IconButton>
																	</Tooltip>
																</TableCell>
															</TableRow>
														})}
												</TableBody>
												{/*<TableFooter>*/}
												{/*	<TableRow>*/}
												{/*		<TablePagination*/}
												{/*			rowsPerPageOptions={[5, 10, 25]}*/}
												{/*			colSpan={8}*/}
												{/*			count={userGroupsEntries.length}*/}
												{/*			rowsPerPage={rowsPerPage}*/}
												{/*			page={page}*/}
												{/*			onPageChange={handleChangePage}*/}
												{/*			onRowsPerPageChange={handleChangeRowsPerPage}*/}
												{/*		/>*/}
												{/*	</TableRow>*/}
												{/*</TableFooter>*/}
											</Table>
										</TableContainer>
									</Hidden>
									<Hidden smUp implementation="css">
										<Paper>
											<List className={classes.root}>
												{Object.entries(userGroups).map((el) => {
													const group = el[1];
													return <React.Fragment key={group.name}>
														<ListItem
															alignItems="flex-start"
															onClick={(event) => onSelectGroup(group.name)}

														>
															<ListItemText
																primary={<span>{group.name}</span>}
																secondary={
																	<React.Fragment>
																		<Typography
																			component="span"
																			variant="body2"
																			className={classes.inline}
																			color="textPrimary"
																		>
																			{group.role}
																		</Typography>
																		<span> — {group.description} </span>
																	</React.Fragment>
																}
															/>
															<ListItemSecondaryAction>
																<IconButton
																	edge="end"
																	size="small"
																	onClick={(event) => {
																		event.stopPropagation();
																		onSelectGroup(group.name);
																	}}
																	aria-label="edit"
																>
																	<EditIcon fontSize="small"/>
																</IconButton>

																<IconButton
																	edge="end"
																	size="small"
																	onClick={(event) => {
																		event.stopPropagation();
																		onDeleteGroup(group.name);
																	}}
																	aria-label="delete"
																>
																	<DeleteIcon fontSize="small"/>
																</IconButton>
															</ListItemSecondaryAction>
														</ListItem>
														<Divider/>
													</React.Fragment>
												})}
											</List>
										</Paper>
									</Hidden>
								</div>
							) : (
								<div>No groups found</div>
							)
						)
					}
				</div>
			</div>
		</div>
	);
};

UserGroups.propTypes = {
	sortBy: PropTypes.string,
	sortDirection: PropTypes.string,
	disableSort: PropTypes.func,
	doSort: PropTypes.func,
	onSort: PropTypes.func.isRequired,
};

UserGroups.defaultProps = {
	sortBy: undefined,
	sortDirection: undefined
};

const mapStateToProps = (state) => {
	return {
		users: state.users && state.users.users,
		connections: state.brokerConnections && state.brokerConnections.brokerConnections,
		userGroups: state.userGroups && state.userGroups.userGroups,
		userManagementFeature: state.systemStatus?.features?.usermanagement
	};
};

export default connect(mapStateToProps)(UserGroups);
