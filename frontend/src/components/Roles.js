import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import ReloadIcon from '@material-ui/icons/Replay';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateRole, updateRoles, updateRolesRowsPerPage, updateRolesPage} from '../actions/actions';
import {getAdminRoles} from '../helpers/utils';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
import StyledTypography from './StyledTypography';

const useStyles = makeStyles((theme) => ({
	button: {
		marginRight: 10
	}
}));

const rolesShape = PropTypes.shape({
	rolename: PropTypes.string
});

const ROLE_TABLE_COLUMNS = [
	{id: 'name', key: 'Name'},
	{id: 'textname', key: 'Text Name'},
	{id: 'textdescription', key: 'Description'},
	{id: "action", key: ""},
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
	const [page, setPage] = React.useState(props.page || 0);
	const [rowsPerPage, setRowsPerPage] = React.useState(props.rowsPerPage || 10);
	const small = useMediaQuery(theme => theme.breakpoints.down('xs'));
	const medium = useMediaQuery(theme => theme.breakpoints.between('sm', 'sm'));
	const handleChangePage = async (event, newPage) => {
		setPage(newPage);
		const count = rowsPerPage;
		const offset = newPage * rowsPerPage;
		const roles = await client.listRoles(true, count, offset);
		dispatch(updateRoles(roles));
		dispatch(updateRolesPage(newPage));
	};

	const onReload = async () => {
		const count = rowsPerPage;
		const offset = page * rowsPerPage;
		const roles = await client.listRoles(true, count, offset);
		dispatch(updateRoles(roles));
	}

	const handleChangeRowsPerPage = async (event) => {
		const rowsPerPage = parseInt(event.target.value, 10);
		setPage(0);
		setRowsPerPage(rowsPerPage);
		const roles = await client.listRoles(true, rowsPerPage, 0);
		dispatch(updateRolesPage(0));
		dispatch(updateRoles(roles));
		dispatch(updateRolesRowsPerPage(rowsPerPage));
	};

	const onEditDefaultACLAccess = () => {
		history.push('/roles/acl');
	}

	const onNewRole = () => {
		history.push('/roles/new');
	};

	React.useEffect(() => {
		const fetchData = async () => {
			const roles = await client.listRoles(true, rowsPerPage, page * rowsPerPage);
			dispatch(updateRoles(roles));
		};
		fetchData().catch(error => console.error(error));
	}, []);

	const onDeleteRole = async (rolename) => {
		try {
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
		} catch (_) {
			return;
		}

		if (rolename === 'admin') {
			try {
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
			} catch (_) {
				return;
			}
		}
		try {
			await client.deleteRole(rolename);
			enqueueSnackbar('Role successfully deleted', {
				variant: 'success'
			});
			const roles = await client.listRoles(true, rowsPerPage, page * rowsPerPage);
			dispatch(updateRoles(roles));
			// const clients = await client.listClients();
			// dispatch(updateClients(clients));
			// const groups = await client.listGroups();
			// dispatch(updateGroups(groups));
		} catch(error) {
			console.error(error);
			enqueueSnackbar(`${error}`, { variant: 'error' });
		}
	};

	const onSelectRole = async (rolename) => {
		const role = await client.getRole(rolename);
		dispatch(updateRole(role));
		history.push(`/roles/${rolename}`);
	};

	const {dynamicsecurityFeature,
			roles = [],
			onSort,
			sortBy,
			sortDirection,
			clients,
			defaultClient
		} = props;

	const adminRoles = getAdminRoles(defaultClient, clients);

	return (
		<ContentContainer
			breadCrumbs={<ContainerBreadCrumbs title="Roles" links={[{name: 'Home', route: '/home'}]}/>}
			dataTour="page-roles"
		>
			<ContainerHeader
				title="Roles"
				buttonsWidth="420px"
				subTitle="List of existing roles. A role contains a number of ACLs, which either specifically allow or deny an action. Add as many ACLs as you need to a role."
				connectedWarning={!props.connected}
				brokerFeatureWarning={dynamicsecurityFeature?.supported === false ? 'dynamic security' : null}
			>
				{dynamicsecurityFeature?.supported !== false && (
					<Button
						variant="outlined"
						color="primary"
						style={{marginRight: '10px'}}
						size="small"
						id="new-role-button"
						startIcon={<AddIcon/>}
						onClick={(event) => {
							event.stopPropagation();
							onNewRole();
						}}
					>
						New Role
					</Button>
				)}
				<Button
					variant="outlined"
					color="primary"
					style={{marginRight: '10px'}}
					size="small"
					startIcon={<EditIcon/>}
					onClick={onEditDefaultACLAccess}
				>
					Edit default ACL access
				</Button>
				{dynamicsecurityFeature?.supported !== false && (
					<Button
						variant="outlined"
						color="primary"
						size="small"
						style={{paddingRight: '0px', minWidth: '30px'}}
						startIcon={<ReloadIcon/>}
						onClick={(event) => {
							event.stopPropagation();
							onReload();
						}}
					/>
				)}
			</ContainerHeader>
			{dynamicsecurityFeature?.supported !== false && roles?.roles?.length > 0 ? (
				<div style={{height: '100%', overflowY: 'auto'}}>
					<div style={{height: '100%', overflowY: 'auto'}}>
						<TableContainer>
							<Table stickyHeader size="small" aria-label="sticky table">
								<TableHead>
									<TableRow>
										{ROLE_TABLE_COLUMNS.map((column) => (
											<TableCell
												key={column.id}
												style={{
													display:
														(!small && !medium) ||
														(column.id === 'name' && (small || medium)) ||
														(column.id === 'action' && (small || medium)) ||
														(column.id === 'textdescription' && (small || medium))
															? undefined
															: 'none'
												}}
												sortDirection={sortBy === column.id ? sortDirection : false}
											>
												{/*<TableSortLabel*/}
												{/*	active={sortBy === column.id}*/}
												{/*	direction={sortDirection}*/}
												{/*	onClick={() => onSort(column.id)}*/}
												{/*>*/}
												{column.key}
												{/*</TableSortLabel>*/}
											</TableCell>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{roles.roles.map((role) => (
										<TableRow
											hover
											key={role.rolename}
											onClick={() => onSelectRole(role.rolename)}
											style={{cursor: 'pointer'}}
										>
											<TableCell>
												<StyledTypography
													disabled={adminRoles.includes(role.rolename)}
													text={role.rolename}
												/>
											</TableCell>
											{small || medium ? null : (
												<TableCell>
													<StyledTypography
														disabled={adminRoles.includes(role.rolename)}
														text={role.textname}
													/>
												</TableCell>
											)}

											<TableCell>
												<StyledTypography
													disabled={adminRoles.includes(role.rolename)}
													text={role.textdescription}
												/>
											</TableCell>

											<TableCell align="right">
												<Tooltip title="Delete role">
													<IconButton
														size="small"
														disabled={adminRoles.includes(role.rolename)}
														onClick={(event) => {
															event.stopPropagation();
															onDeleteRole(role.rolename);
														}}
													>
														<DeleteIcon fontSize="small"/>
													</IconButton>
												</Tooltip>
											</TableCell>
										</TableRow>
									))}
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
				</div>
			) : props.connected ? (
				<div>No roles found</div>
			) : null}
		</ContentContainer>
	);
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
		rowsPerPage: state.roles?.rowsPerPage,
		page: state.roles?.page,
		defaultClient: state.brokerConnections?.defaultClient,
		clients: state.clients?.clients?.clients,
		dynamicsecurityFeature: state.systemStatus?.features?.dynamicsecurity,
		connected: state.brokerConnections?.connected,
	};
};

export default connect(mapStateToProps)(Roles);
