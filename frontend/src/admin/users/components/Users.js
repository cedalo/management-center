import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import { updateUser, updateUsers } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@mui/icons-material/Add';
import { Alert, AlertTitle } from '@mui/material';
import AutoSuggest from '../../../components/AutoSuggest';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ClientIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
// import Fab from '@mui/material/Fab';
import GroupIcon from '@mui/icons-material/Group';
import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';

const PREFIX = 'Users';

const classes = {
    root: `${PREFIX}-root`,
    tableContainer: `${PREFIX}-tableContainer`,
    badges: `${PREFIX}-badges`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.tableContainer}`]: {
		minHeight: '500px',
		'& td:nth-child(2)': {
			minWidth: '100px'
		}
	},

    [`& .${classes.badges}`]: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},

    // fab: {
    // 	position: 'absolute',
    // 	bottom: theme.spacing(2),
    // 	right: theme.spacing(2)
    // },
    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,

    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

const StyledTableRow = TableRow;

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
		return (
            <Root>
                <Hidden smDown implementation="css">
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
                                            classes={{
                                                root: classes.root
                                            }}>
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
            </Root>
        );
	} else if (userManagementFeature?.error) {
		return null;
	} else {
		return <div>No users found</div>
	}
}

const Users = (props) => {

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
                size="small"
                className={classes.button}
                startIcon={<AddIcon />}
                onClick={(event) => {
					event.stopPropagation();
					onNewUser();
				}}>
				New User
			</Button>
			<br />
			<br />
			</>}
			
			{ createUserTable(users,  props, onDeleteUser, onUpdateUserRoles, onSelectUser) }
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
