import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import ContainerBox from '../../../components/ContainerBox';
import ContainerBreadCrumbs from '../../../components/ContainerBreadCrumbs';
import ContainerHeader from '../../../components/ContainerHeader';
import SelectList from '../../../components/SelectList';
import {WebSocketContext} from '../../../websockets/WebSocket';
import {updateUser, updateUsers} from '../actions/actions';

const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.tables?.odd
		}
	}
}))(TableRow);

const useStyles = makeStyles((theme) => ({
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
}));

const USER_TABLE_COLUMNS = [
	{id: 'username', key: 'Name', align: 'left', width: '25%'},
	{id: 'roles', key: 'Roles', align: 'left', width: '65%'},
	{id: 'delete', key: 'Delete', align: 'center', width: '5%'}
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
		return (<div style={{height: '100%', overflowY: 'auto'}}>
				<TableContainer>
					<Table stickyHeader size="small" aria-label="sticky table">
						<TableHead>
							<TableRow>
								{USER_TABLE_COLUMNS.map((column) => (
									<TableCell
										key={column.id}
										sortDirection={sortBy === column.id ? sortDirection : false}
										align={column.align}
										style={{
											width: column.width,
										}}
									>
										{column.key}
									</TableCell>
								))}
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
											if (event.target.nodeName?.toLowerCase() === 'td') {
												onSelectUser(user.username);
											}
										}}
										style={{cursor: 'pointer'}}
									>
										<TableCell>{user.username}</TableCell>
										<TableCell className={classes.badges}>
											<SelectList
												values={user.roles}
												getValue={value => value}
												onChange={(event, value) => {
													onUpdateUserRoles(user, value);
												}}
												disabled={user.editable === false}
												suggestions={roleSuggestions}
											/>
										</TableCell>
										<TableCell align="center">
											<Tooltip title="Delete user">
												<IconButton
													disabled={user.editable === false}
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														onDeleteUser(user.username);
													}}
												>
													<DeleteIcon fontSize="small"/>
												</IconButton>
											</Tooltip>
										</TableCell>
									</StyledTableRow>
								))}
						</TableBody>
					</Table>
				</TableContainer>
		</div>)
	} else if (userManagementFeature?.error) {
		return null;
	} else {
		return <div>No Users found</div>
	}
}

const Users = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const {enqueueSnackbar} = useSnackbar();
	const {client: brokerClient} = context;

	const {userManagementFeature, userProfile, roles = [], users = [], onSort, sortBy, sortDirection} = props;

	const onUpdateUserRoles = async (user, roles = []) => {
		if (!roles) {
			roles = [];
		}
		const rolenames = roles.map((role) => role.value);
		try {
			await brokerClient.updateUserRoles(user, rolenames);
		} catch (error) {
			enqueueSnackbar(`Error updating the user "${user.username}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error;
		}
		const users = await brokerClient.listUsers();
		dispatch(updateUsers(users));
		enqueueSnackbar(`User "${user.username}" successfully updated`, {
			variant: 'success'
		});
	};

	const onReload = async () => {
		const users = await brokerClient.listUsers();
		dispatch(updateUsers(users));
	}

	const onSelectUser = async (username) => {
		const user = await brokerClient.getUser(username);
		dispatch(updateUser(user));
		history.push(`/users/${username}`);
	};

	const onNewUser = () => {
		history.push('/users/new');
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
		try {
			await brokerClient.deleteUser(username);
		} catch (error) {
			enqueueSnackbar(`Error deleting the user "${username}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error
		}
		enqueueSnackbar(`User "${username}" successfully deleted`, {
			variant: 'success'
		});
		const users = await brokerClient.listUsers();
		dispatch(updateUsers(users));
	};

	return (
		<ContainerBox>
			<ContainerBreadCrumbs title="Users" links={[{name: 'Home', route: '/home'}]}/>
			<div style={{height: 'calc(100% - 26px)'}}>
				<div style={{display: 'grid', gridTemplateRows: 'max-content auto', height: '100%'}}>
					<ContainerHeader
						title="Users"
						subTitle="List of users. You can configure different users and assign roles like 'admin', 'editor and 'viewer' to restrict or give access to specific features."
						featureWarning={!userManagementFeature?.error && userManagementFeature?.supported === false ? "Users" : undefined}
						warnings={() => {
							const alerts = [];
							if (userManagementFeature?.error) {
								alerts.push({
									severity: 'error',
									title: userManagementFeature.error.title,
									error: userManagementFeature.error.message
								});
							}
							return alerts;
						}}
					>
						{!userManagementFeature?.error && userManagementFeature?.supported !== false && [
							<Button
								variant="outlined"
								color="primary"
								size="small"
								startIcon={<AddIcon/>}
								onClick={(event) => {
									event.stopPropagation();
									onNewUser();
								}}
								>
									New User
							</Button>,
						]}
					</ContainerHeader>
					{createUserTable(users, classes, props, onDeleteUser, onUpdateUserRoles, onSelectUser)}
				</div>
			</div>
		</ContainerBox>
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
