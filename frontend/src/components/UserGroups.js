import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateUserGroup, updateUserGroups} from '../admin/users/actions/actions';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBox from './ContainerBox';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
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
	{id: 'name', key: 'Name', sortable: true, width: '10%', align: 'left'},
	{id: 'role', key: 'Role', sortable: true, width: '10%', align: 'left'},
	{id: 'description', key: 'Description', sortable: true, width: '20%', align: 'left'},
	{id: 'users', key: 'Users', sortable: false, width: '25%', align: 'left'},
	{id: 'connections', key: 'Connections', sortable: false, width: '25%', align: 'left'},
	{id: 'delete', key: 'Delete', sortable: false, width: '5%', align: 'center'}
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
	const small = useMediaQuery(theme => theme.breakpoints.down('xs'));
	const medium = useMediaQuery(theme => theme.breakpoints.between('sm', 'sm'));

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

		if (users.length === 0) {
			await confirm({
				title: 'Remove all users from group',
				description: `Do you really want to remove all users from group "${group.name}"?`
			});
		}

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

		if (connections.length === 0) {
			await confirm({
				title: 'Remove all connections from group',
				description: `Do you really want to remove all connections from group "${group.name}"?`
			});
		}

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
			description: `Do you really want to delete the group "${groupname}"?`
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
		<ContentContainer
			breadCrumbs={<ContainerBreadCrumbs title="User Groups" links={[{name: 'Home', route: '/home'}]}/>}
			dataTour="page-user-groups"

		>
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
						id="new-user-group-button"
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
													align={column.align}
													style={{
														width: column.width,
														display: (!small && !medium) ||
														(column.id === 'name' && (small || medium)) ||
														(column.id === 'delete' && (small || medium)) ||
														(column.id === 'connections' && medium) ||
														(column.id === 'users' && (small || medium)) ? undefined : 'none'
													}}
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
													{small || medium ? null : [
														<TableCell>{group.role}</TableCell>,
														<TableCell>{group.description}</TableCell>
													]}
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
													{small ? null :
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
														</TableCell>}
													<TableCell align="center">
														<Tooltip title="Delete group">
															<IconButton
																size="small"
																id={`delete-user-group-${group.name}`}
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
								</Table>
							</TableContainer>
						</div>
					) : (
						<div>No groups found</div>
					)
				)
			}
		</ContentContainer>
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
		users: state.users?.users?.filter(user => (!(user.editable === false) && !user.isRoot)),
		connections: state.brokerConnections && state.brokerConnections.brokerConnections,
		userGroups: state.userGroups && state.userGroups.userGroups,
		userManagementFeature: state.systemStatus?.features?.usermanagement
	};
};

export default connect(mapStateToProps)(UserGroups);
