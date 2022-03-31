import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import { updateClients, updateGroups, updateRole, updateRoles } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@mui/icons-material/Add';
import { Alert, AlertTitle } from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
// import Fab from '@mui/material/Fab';
import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import RoleIcon from '@mui/icons-material/Policy';
import { Link as RouterLink } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import UserManagementIcon from '@mui/icons-material/SupervisedUserCircle';
import { WebSocketContext } from '../websockets/WebSocket';
import moment from 'moment';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';

const PREFIX = 'Roles';

const classes = {
    badges: `${PREFIX}-badges`,
    button: `${PREFIX}-button`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.badges}`]: {
		'& > *': {
			margin: theme.spacing(0.5)
		}
	},

    // fab: {
    // 	position: 'absolute',
    // 	bottom: theme.spacing(2),
    // 	right: theme.spacing(2)
    // },
    [`& .${classes.button}`]: {
		marginRight: 10
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

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
        <Root>
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
                size="small"
                className={classes.button}
                startIcon={<AddIcon />}
                onClick={(event) => {
					event.stopPropagation();
					onNewRole();
				}}>
				New Role
			</Button>
			<Button
                variant="outlined"
                size="small"
                className={classes.button}
                startIcon={<EditIcon />}
                onClick={onEditDefaultACLAccess}>
				Edit default ACL access
			</Button>
			<br />
			<br />
			</>}
			{dynamicsecurityFeature?.supported !== false && roles && roles.length > 0 ? (
				<div>
					<Hidden smDown implementation="css">
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
		</Root>
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
