import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import AddIcon from '@material-ui/icons/Add';
import { Alert, AlertTitle } from '@material-ui/lab';
import AutoSuggest from './AutoSuggest';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
// import Fab from '@material-ui/core/Fab';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';


import { updateUserGroups, updateUserGroup } from '../admin/users/actions/actions';


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
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));


const GROUP_TABLE_COLUMNS = [
	{ id: 'name', key: 'Name', sortable: true },
	{ id: 'role', key: 'Role', sortable: true },
	{ id: 'description', key: 'Group\'s Description', sortable: true },
	{ id: 'users', key: 'Users', sortable: false },
	{ id: 'connections', key: 'Connections', sortable: false }
];



const loadUserGroups = async (client, dispatch) => {
	try {
		const userGroups = await client.listUserGroups();
		dispatch(updateUserGroups(userGroups));
	} catch(error) {
		console.error('User groups:', error.message);
	}
};



const UserGroups = (props) => {
    const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client } = context;

    const { userManagementFeature, userGroups={}, users=[], connections=[], onSort, sortBy, sortDirection, disableSort, doSort } = props;

	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [userGroupsEntries, setUserGroupsEntries] = React.useState([]);
    const [userGroupsEntriesPaginated, setUserGroupsEntriesPaginated] = React.useState([]);

	React.useEffect(() => {
		loadUserGroups(client, dispatch);
		setUserGroupsEntries(Object.entries(props.userGroups));
		return () => {};
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

        let offset = page * rowsPerPage;
        const groups = _userGroupsEntries.slice(offset, (offset) + rowsPerPage);
        
		if (groups.length === 0 && page > 0) { // if current page has zero entries move to the previous page
			setPage(page - 1);
			offset = (page - 1) * rowsPerPage;
			const groups = _userGroupsEntries.slice(offset, (offset) + rowsPerPage);
			setUserGroupsEntriesPaginated(groups);
		} else {
			setUserGroupsEntriesPaginated(groups);
		}
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

	const onUpdateGroupUsers = async (group, users=[]) => {
		if (!users) {
			users = [];
		}

        const updatedGroup = {
            ...group,
            users: [...users.map(el => el.value)]
        };

		const groups = await client.updateUserGroup(updatedGroup);
		dispatch(updateUserGroups(groups));
	};

	const onUpdateGroupConnections = async (group, connections=[]) => {
		if (!connections) {
			connections = [];
		}

        const updatedGroup = {
            ...group,
            connections: [...connections.map(el => el.value)]
        };

        const groups = await client.updateUserGroup(updatedGroup);
		dispatch(updateUserGroups(groups));
	};


	const onSelectGroup = async (groupname) => { //!!!
		const group = userGroups[groupname];
		dispatch(updateUserGroup({...group}));
		history.push(`/admin/user-groups/detail/${groupname}`);
	};

	const onNewGroup = () => {
		history.push('/admin/user-groups/new');
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
		const groups = await client.deleteUserGroup(groupname);
		enqueueSnackbar(`Group "${groupname}" successfully deleted`, {
			variant: 'success'
		});

		// disableSort();
		dispatch(updateUserGroups(groups));
	};


	// TODO: probably extract into reducer
	const userSuggestions = users.map(el => el.username)
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
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/admin">
					Admin
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					User Groups
				</Typography>
			</Breadcrumbs>
			{/* TODO: Quick hack to detect whether feature is supported */}
			{userManagementFeature?.supported === false ? <><br/>
				<Alert severity="warning">
					<AlertTitle>Feature not available</AlertTitle>
					Make sure that the feature is enabled in the license.
				</Alert>
			</> : <><br/>
				<Alert severity="info" style={{marginBottom: '15px'}}>
					<AlertTitle>User Groups Feature</AlertTitle>
					You can create user groups for specific connections. Only those connections that are in the group will be accessible to the user. The role specified in the group will override the user's role for the connections assigned to said group.
					A user can be added to more than one group. In this case if some of the connections in two or more groups are the same, a user will get the hightest permissions among those overlapping connections
				</Alert>
			</>}
			<br />
			{userManagementFeature?.supported !== false && <><Button
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
				New User Group
			</Button>
			{Object.keys(userGroups).length > 0 ? (
				<Button size="small"
						color="primary"
						variant="outlined"
						style={{marginLeft: "20px"}}
						onClick={() => {disableSort()}}
				>
					Unsort
				</Button>
			) : ""}
			<br />
			<br />
			</>}
			{
				userManagementFeature?.supported === false ? (
					<></>
				) : (
					Object.keys(userGroups).length > 0 ? (
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
												<TableCell />
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
														style={{ cursor: 'pointer' }}
													>
														<TableCell>{group.name}</TableCell>
														<TableCell>{group.role}</TableCell>
														<TableCell>{group.description}</TableCell>
														<TableCell className={classes.badges}>
															<AutoSuggest
																suggestions={userSuggestions}
																values={group.users.map((username) => ({
																	label: username,
																	value: username
																}))}
																handleChange={(value) => {
																	onUpdateGroupUsers(group, value);
																}}
															/>
														</TableCell>
														<TableCell className={classes.badges}>
															<AutoSuggest
																suggestions={connectionSuggestions}
																values={group.connections
																		.filter((brokerid) => !!connectionsMap.get(brokerid))
																		.map((brokerid) => ({
																	label: connectionsMap.get(brokerid).name,
																	value: connectionsMap.get(brokerid).id
																}))}
																handleChange={(value) => {
																	onUpdateGroupConnections(group, value);
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
																		onDeleteGroup(group.name);
																	}}
																>
																	<DeleteIcon fontSize="small" />
																</IconButton>
															</Tooltip>
														</TableCell>
													</TableRow>
												})}
										</TableBody>
										<TableFooter>
											<TableRow>
												<TablePagination
													rowsPerPageOptions={[5, 10, 25]}
													colSpan={8}
													count={userGroupsEntries.length}
													rowsPerPage={rowsPerPage}
													page={page}
													onPageChange={handleChangePage}
													onRowsPerPageChange={handleChangeRowsPerPage}
												/>
											</TableRow>
										</TableFooter>
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
															<EditIcon fontSize="small" />
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
															<DeleteIcon fontSize="small" />
														</IconButton>
													</ListItemSecondaryAction>
												</ListItem>
												<Divider />
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
