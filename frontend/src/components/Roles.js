import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { updateClients, updateGroups, updateRole, updateRoles } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@material-ui/icons/Add';
import { Alert, AlertTitle } from '@material-ui/lab';
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
import RoleIcon from '@material-ui/icons/Policy';
import { Link as RouterLink } from 'react-router-dom';
import SecurityIcon from '@material-ui/icons/Security';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import UserManagementIcon from '@material-ui/icons/SupervisedUserCircle';
import { WebSocketContext } from '../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';

const getIconForFeature = (feature) => {
	switch (feature) {
		case 'security-policy':
			return <SecurityIcon />;
		case 'user-management':
			return <UserManagementIcon />;
	}
};
const remove = (array, item) => {
	const index = array.indexOf(item);
	array.splice(index, 1);
};

const useStyles = makeStyles((theme) => ({
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
	button: {
		marginRight: 10
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const rolesShape = PropTypes.shape({
	rolename: PropTypes.string
});

const ROLE_TABLE_COLUMNS = [
	{ id: 'rolename', key: 'Name' },
	{ id: 'textname', key: 'Text name' },
	{ id: 'textdescription', key: 'Description' }
	//   { id: "acls", key: "ACLs" },
];

const FormattedGroupType = (props) => {
	switch (props.provider) {
		case 'local':
			return 'Local';
		default:
			return props.provider || '';
	}
};

const Roles = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client } = context;

	const onEditDefaultACLAccess = () => {
		history.push('/security/acl');
	}

	const onNewRole = () => {
		history.push('/security/roles/new');
	};

	const onDeleteRole = async (rolename) => {
		await confirm({
			title: 'Confirm role deletion',
			description: `Do you really want to delete the role "${rolename}"?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		if (rolename === 'admin') {
			await confirm({
				title: 'Confirm default role deletion',
				description: `Are you sure? You are about to delete the default role for the current Mosquitto instance.`,
				cancellationButtonProps: {
					variant: 'contained'
				},
				confirmationButtonProps: {
					color: 'primary',
					variant: 'contained'
				}
			});
		}
		await client.deleteRole(rolename);
		enqueueSnackbar('Role successfully deleted', {
			variant: 'success'
		});
		const roles = await client.listRoles();
		dispatch(updateRoles(roles));
		const clients = await client.listClients();
		dispatch(updateClients(clients));
		const groups = await client.listGroups();
		dispatch(updateGroups(groups));
	};

	const onSelectRole = async (rolename) => {
		const role = await client.getRole(rolename);
		dispatch(updateRole(role));
		history.push(`/security/roles/detail/${rolename}`);
	};

	const { dynamicsecurityFeature, defaultACLAccess, roles = [], onSort, sortBy, sortDirection } = props;

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
					Roles
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
					onNewRole();
				}}
			>
				New Role
			</Button>
			<Button
				variant="outlined"
				color="default"
				size="small"
				className={classes.button}
				startIcon={<EditIcon />}
				onClick={onEditDefaultACLAccess}
			>
				Edit default ACL access
			</Button>
			<br />
			</>}
			<br />
			{dynamicsecurityFeature?.supported !== false && roles && roles.length > 0 ? (
				<div>
					<Hidden xsDown implementation="css">
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										{ROLE_TABLE_COLUMNS.map((column) => (
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
									{roles.map((role) => (
										<TableRow
											hover
											key={role.rolename}
											onClick={() => onSelectRole(role.rolename)}
											style={{ cursor: 'pointer' }}
										>
											<TableCell>{role.rolename}</TableCell>
											<TableCell>{role.textname}</TableCell>
											<TableCell>{role.textdescription}</TableCell>
											<TableCell align="right">
												{/* <IconButton
						size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteRole(role.rolename);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton> */}
												<Tooltip title="Delete role">
													<IconButton
														size="small"
														onClick={(event) => {
															event.stopPropagation();
															onDeleteRole(role.rolename);
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
								{roles.map((role) => (
									<React.Fragment>
										<ListItem alignItems="flex-start">
											<ListItemText
												primary={<span>{role.rolename}</span>}
												//   secondary={
												//     <React.Fragment>
												//       <Typography
												//         component="span"
												//         variant="body2"
												//         className={classes.inline}
												//         color="textPrimary"
												//       >
												//         Role details
												//       </Typography>
												//     </React.Fragment>
												//   }
											/>
											<ListItemSecondaryAction>
												<IconButton edge="end" size="small" aria-label="edit">
													<EditIcon fontSize="small" />
												</IconButton>
												<IconButton edge="end" size="small" aria-label="delete">
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
			) : (
				<div>No roles found</div>
			)}
			{/* <Fab
				color="primary"
				aria-label="add"
				className={classes.fab}
				onClick={(event) => {
					event.stopPropagation();
					onNewRole();
				}}
			>
				<AddIcon />
			</Fab> */}
		</div>
	);
};

Roles.propTypes = {
	roles: PropTypes.arrayOf(rolesShape).isRequired,
	sortBy: PropTypes.string,
	sortDirection: PropTypes.string,
	onSort: PropTypes.func.isRequired
};

Roles.defaultProps = {
	sortBy: undefined,
	sortDirection: undefined
};

const mapStateToProps = (state) => {
	return {
		roles: state.roles?.roles,
		dynamicsecurityFeature: state.systemStatus?.features?.dynamicsecurity
	};
};

export default connect(mapStateToProps)(Roles);
