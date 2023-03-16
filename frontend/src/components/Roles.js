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
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateClients, updateGroups, updateRole, updateRoles} from '../actions/actions';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';

const useStyles = makeStyles((theme) => ({
	badges: {
		'& > *': {
			margin: theme.spacing(0.5)
		}
	},
	button: {
		marginRight: 10
	}
}));

const rolesShape = PropTypes.shape({
	rolename: PropTypes.string
});

const ROLE_TABLE_COLUMNS = [
	{id: 'rolename', key: 'Name'},
	{id: 'textname', key: 'Text Name'},
	{id: 'textdescription', key: 'Description'}
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
	const {enqueueSnackbar} = useSnackbar();
	const {client} = context;

	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);

	const handleChangePage = async (event, newPage) => {
		setPage(newPage);
		const count = rowsPerPage;
		const offset = newPage * rowsPerPage;
		const roles = await client.listRoles(true, count, offset);
		dispatch(updateRoles(roles));
	};

	const handleChangeRowsPerPage = async (event) => {
		const rowsPerPage = parseInt(event.target.value, 10);
		setRowsPerPage(rowsPerPage);
		setPage(0);
		const roles = await client.listRoles(true, rowsPerPage, 0);
		dispatch(updateRoles(roles));
	};

	const onEditDefaultACLAccess = () => {
		history.push('/roles/acl');
	}

	const onNewRole = () => {
		history.push('/roles/new');
	};

	const onDeleteRole = async (rolename) => {
		await confirm({
			title: 'Confirm role deletion',
			description: `Do you really want to delete the role "${rolename}"?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary', variant: 'contained'
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
					color: 'primary', variant: 'contained'
				}
			});
		}
		await client.deleteRole(rolename);
		enqueueSnackbar('Role successfully deleted', {
			variant: 'success'
		});
		const roles = await client.listRoles(true, rowsPerPage, page * rowsPerPage);
		dispatch(updateRoles(roles));
		const clients = await client.listClients();
		dispatch(updateClients(clients));
		const groups = await client.listGroups();
		dispatch(updateGroups(groups));
	};

	const onSelectRole = async (rolename) => {
		const role = await client.getRole(rolename);
		dispatch(updateRole(role));
		history.push(`/roles/${rolename}`);
	};

	const {dynamicsecurityFeature, defaultACLAccess, roles = [], onSort, sortBy, sortDirection} = props;

	return (<div style={{height: '100%'}}>
		<ContainerBreadCrumbs title="Roles" links={[{name: 'Home', route: '/home'}]}/>
		<div style={{height: 'calc(100% - 26px)'}}>
			<div style={{display: 'grid', gridTemplateRows: 'max-content auto', height: '100%'}}>
				<ContainerHeader
					title="Roles"
					buttonsWidth="350px"
					subTitle="List of existing roles. A role contains a number of ACLs, which either specifically allow or deny an action. Add as many ACLs as you need to a role."
					connectedWarning={!props.connected}
					brokerFeatureWarning={dynamicsecurityFeature?.supported === false ? "dynamic security" : null}
				>
					{dynamicsecurityFeature?.supported !== false && <Button
						variant="outlined"
						color="primary"
						style={{marginRight: '10px'}}
						size="small"
						startIcon={<AddIcon/>}
						onClick={(event) => {
							event.stopPropagation();
							onNewRole();
						}}
					>
						New Role
					</Button>}
					<Button
						variant="outlined"
						color="primary"
						size="small"
						startIcon={<EditIcon/>}
						onClick={onEditDefaultACLAccess}
					>
						Edit default ACL access
					</Button>
				</ContainerHeader>
				{dynamicsecurityFeature?.supported !== false && roles?.roles?.length > 0 ? (
					<div style={{height: '100%', overflowY: 'auto'}}>
						<Hidden xsDown implementation="css">
							<div style={{height: '100%', overflowY: 'auto'}}>
								<TableContainer>
									<Table stickyHeader size="small" aria-label="sticky table">
										<TableHead>
											<TableRow>
												{ROLE_TABLE_COLUMNS.map((column) => (<TableCell
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
												</TableCell>))}
												<TableCell/>
											</TableRow>
										</TableHead>
										<TableBody>
											{roles.roles.map((role) => (<TableRow
												hover
												key={role.rolename}
												onClick={() => onSelectRole(role.rolename)}
												style={{cursor: 'pointer'}}
											>
												<TableCell>{role.rolename}</TableCell>
												<TableCell>{role.textname}</TableCell>
												<TableCell>{role.textdescription}</TableCell>
												<TableCell align="right">
													<Tooltip title="Delete role">
														<IconButton
															size="small"
															onClick={(event) => {
																event.stopPropagation();
																onDeleteRole(role.rolename);
															}}
														>
															<DeleteIcon fontSize="small"/>
														</IconButton>
													</Tooltip>
												</TableCell>
											</TableRow>))}
										</TableBody>
										<TableFooter>
											<TableRow>
												<TablePagination
													rowsPerPageOptions={[5, 10, 25]}
													colSpan={8}
													count={roles?.totalCount}
													rowsPerPage={rowsPerPage}
													page={page}
													onChangePage={handleChangePage}
													onChangeRowsPerPage={handleChangeRowsPerPage}
												/>
											</TableRow>
										</TableFooter>
									</Table>
								</TableContainer>
							</div>
						</Hidden>
						<Hidden smUp implementation="css">
							<Paper>
								<List className={classes.root}>
									{roles.roles.map((role) => (<React.Fragment>
										<ListItem alignItems="flex-start">
											<ListItemText
												primary={<span>{role.rolename}</span>}
											/>
											<ListItemSecondaryAction>
												<IconButton edge="end" size="small" aria-label="edit">
													<EditIcon fontSize="small"/>
												</IconButton>
												<IconButton edge="end" size="small" aria-label="delete">
													<DeleteIcon fontSize="small"/>
												</IconButton>
											</ListItemSecondaryAction>
										</ListItem>
										<Divider/>
									</React.Fragment>))}
								</List>
							</Paper>
						</Hidden>
					</div>
					) : (
						props.connected ? <div>No roles found</div> : null
					)}
			</div>
		</div>
	</div>);
};

Roles.propTypes = {
	roles: PropTypes.arrayOf(rolesShape).isRequired,
	sortBy: PropTypes.string,
	sortDirection: PropTypes.string,
	onSort: PropTypes.func.isRequired
};

Roles.defaultProps = {
	sortBy: undefined, sortDirection: undefined
};

const mapStateToProps = (state) => {
	return {
		roles: state.roles?.roles,
		dynamicsecurityFeature: state.systemStatus?.features?.dynamicsecurity,
		connected: state.brokerConnections?.connected,
	};
};

export default connect(mapStateToProps)(Roles);
