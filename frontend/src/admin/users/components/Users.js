import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { updateUser, updateUsers } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@material-ui/icons/Add';
import { Alert, AlertTitle } from '@material-ui/lab';
import AutoSuggest from '../../../components/AutoSuggest';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import ClientIcon from '@material-ui/icons/Person';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
// import Fab from '@material-ui/core/Fab';
import GroupIcon from '@material-ui/icons/Group';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';

const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.tables?.odd
		}
	}
}))(TableRow);

const useStyles = makeStyles((theme) => ({
	tableContainer: {
		minHeight: '500px',
		'& td:nth-child(2)': {
			minWidth: '100px'
		}
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
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

const USER_TABLE_COLUMNS = [
	{ id: 'username', key: 'Username' },
	{ id: 'roles', key: 'User Roles' }
];

const createUserTable = (users, classes, props, onDeleteUser, onUpdateUserRoles, onSelectUser) => {
	const { userManagementFeature, userRoles = [], roles = [], onSort, sortBy, sortDirection } = props;

	const roleSuggestions = userRoles
		.sort()
		.map((rolename) => ({
			label: rolename,
			value: rolename
		}));

	if (!userManagementFeature?.error && userManagementFeature?.supported !== false && users && users.length > 0) {
		return <div>
			<Hidden xsDown implementation="css">
				<TableContainer component={Paper} className={classes.tableContainer}>
					<Table size="medium">
						<TableHead>
							<TableRow>
								{USER_TABLE_COLUMNS.map((column) => (
									<TableCell
										key={column.id}
										sortDirection={sortBy === column.id ? sortDirection : false}
									>
										{column.key}
									</TableCell>
								))}
								<TableCell />
							</TableRow>
						</TableHead>
						<TableBody>
							{users &&
								users.map((user) => (
									<StyledTableRow
										disabled={user.editable === false}
										hover
										key={user.username}
										onClick={(event) => {
											onSelectUser(user.username);
										}}
										style={{ cursor: 'pointer' }}
									>
										<TableCell>{user.username}</TableCell>
										<TableCell className={classes.badges}>
											<AutoSuggest
												disabled={user.editable === false}
												suggestions={roleSuggestions}
												values={user.roles?.map((role) => ({
													label: role,
													value: role
												}))}
												handleChange={(value) => {
													onUpdateUserRoles(user, value);
												}}
											/>
										</TableCell>
										<TableCell align="right">
											<Tooltip title="Delete user">
												<IconButton
													disabled={user.editable === false}
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														onDeleteUser(user.username);
													}}
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</TableCell>
									</StyledTableRow>
								))}
						</TableBody>
					</Table>
				</TableContainer>
			</Hidden>
			<Hidden smUp implementation="css">
				<Paper>
					<List className={classes.root}>
						{users.map((user) => (
							<React.Fragment>
								<ListItem
									alignItems="flex-start"
									onClick={(event) => onSelectUser(user.username)}
								>
									<ListItemText
										primary={<span>{user.username}</span>}
										secondary={
											<React.Fragment>
												<Typography
													component="span"
													variant="body2"
													className={classes.inline}
													color="textPrimary"
												>
													{user.textname}
												</Typography>
												<span> — {user.textdescription} </span>
											</React.Fragment>
										}
									/>
									<ListItemSecondaryAction>
										<IconButton
											edge="end"
											size="small"
											onClick={(event) => {
												event.stopPropagation();
												onSelectUser(user.username);
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
												onDeleteUser(user.username);
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
		</div>
	} else if (userManagementFeature?.error) {
		return null;
	} else {
		return <div>No users found</div>
	}
}

const Users = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;

	const { userManagementFeature, userProfile, roles = [], users = [], onSort, sortBy, sortDirection } = props;

	const onUpdateUserRoles = async (user, roles = []) => {
		if (!roles) {
			roles = [];
		}
		const rolenames = roles.map((role) => role.value);
		await brokerClient.updateUserRoles(user, rolenames);
		const users = await brokerClient.listUsers();
		dispatch(updateUsers(users));
	};

	const onSelectUser = async (username) => {
		const user = await brokerClient.getUser(username);
		dispatch(updateUser(user));
		history.push(`/admin/users/detail/${username}`);
	};

	const onNewUser = () => {
		history.push('/admin/users/new');
	};

	const onDeleteUser = async (username) => {
		await confirm({
			title: 'Confirm user deletion',
			description: `Do you really want to delete user "${username}"?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		if (username === userProfile.username) {
			await confirm({
				title: 'Confirm user deletion',
				description: `Are you sure? You are about to delete the user that you are currently using. If you proceed you will be logged out and cannot access the system any longer with that user.`,
				cancellationButtonProps: {
					variant: 'contained'
				},
				confirmationButtonProps: {
					color: 'primary',
					variant: 'contained'
				}
			});
			window.location.href = '/logout';
		}
		await brokerClient.deleteUser(username);
		enqueueSnackbar(`User "${username}" successfully deleted`, {
			variant: 'success'
		});
		const users = await brokerClient.listUsers();
		dispatch(updateUsers(users));
	};

	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} color="inherit" to="/admin">
					Admin
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Users
				</Typography>
			</Breadcrumbs>
			{/* TODO: Quick hack to detect whether feature is supported */}
			{userManagementFeature?.error ? <><br/><Alert severity="warning">
				<AlertTitle>{userManagementFeature.error.title}</AlertTitle>
				{userManagementFeature.error.message}
			</Alert></> : null}
			{!userManagementFeature?.error && userManagementFeature?.supported === false ? <><br/><Alert severity="warning">
				<AlertTitle>Feature not available</AlertTitle>
				Make sure that this feature is included in your MMC license.
			</Alert></> : null}
			<br />
			{!userManagementFeature?.error && userManagementFeature?.supported !== false && <><Button
				variant="outlined"
				color="default"
				size="small"
				className={classes.button}
				startIcon={<AddIcon />}
				onClick={(event) => {
					event.stopPropagation();
					onNewUser();
				}}
			>
				New User
			</Button>
			<br />
			<br />
			</>}
			
			{ createUserTable(users, classes, props, onDeleteUser, onUpdateUserRoles, onSelectUser) }
		</div>
	);
};

Users.propTypes = {
	sortBy: PropTypes.string,
	sortDirection: PropTypes.string,
	onSelectUser: PropTypes.func.isRequired,
	onSort: PropTypes.func.isRequired
};

Users.defaultProps = {
	sortBy: undefined,
	sortDirection: undefined
};

const mapStateToProps = (state) => {
	return {
		userProfile: state.userProfile?.userProfile,
		userRoles: state.userRoles?.userRoles,
		users: state.users?.users,
		userManagementFeature: state.systemStatus?.features?.usermanagement
	};
};

export default connect(mapStateToProps)(Users);
