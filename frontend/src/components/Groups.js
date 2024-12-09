import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
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
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import ReloadIcon from '@material-ui/icons/Replay';
import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
    updateAnonymousGroup,
    updateGroup,
    updateGroups,
    updateGroupsRowsPerPage,
    updateGroupsPage,
    updateClientsAll,
    updateRolesAll,
} from '../actions/actions';
import { WebSocketContext } from '../websockets/WebSocket';
import AnonymousGroupSelect from './AnonymousGroupSelect';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
import SelectList from './SelectList';
import { getIsAdminClient } from '../helpers/utils';

const useStyles = makeStyles((theme) => ({
    tableContainer: {
        minHeight: '500px',
    },
    select: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        border: 'thin solid rgba(255,255,255,0.5)',
        'label + &': {
            marginTop: theme.spacing(1),
        },
    },
    badges: {
        '& > *': {
            margin: theme.spacing(0.5),
        },
    },
}));

const groupShape = PropTypes.shape({
    groupname: PropTypes.string,
});

const GROUP_TABLE_COLUMNS = [
    { id: 'name', key: 'Name', width: '10%', align: 'left' },
    { id: 'textname', key: 'Text Name', width: '10%', align: 'left' },
    { id: 'textdescription', key: 'Description', width: '25%', align: 'left' },
    { id: 'clients', key: 'Clients', width: '25%', align: 'left' },
    { id: 'roles', key: 'Roles', width: '25%', align: 'left' },
    { id: 'action', key: 'Delete', width: '5%', align: 'center' },
];

const byUserName = (c1, c2) => c1.username > c2.username;

const FormattedGroupType = (props) => {
    switch (props.provider) {
        case 'local':
            return 'Local';
        default:
            return props.provider || '';
    }
};

const Groups = (props) => {
    const classes = useStyles();
    const context = useContext(WebSocketContext);
    const dispatch = useDispatch();
    const history = useHistory();
    const confirm = useConfirm();
    const { enqueueSnackbar } = useSnackbar();
    const { client } = context;
    const small = useMediaQuery((theme) => theme.breakpoints.down('xs'));
    const medium = useMediaQuery((theme) => theme.breakpoints.between('sm', 'sm'));
    const [page, setPage] = React.useState(props.page || 0);
    const [rowsPerPage, setRowsPerPage] = React.useState(props.rowsPerPage || 10);

    const handleChangePage = async (event, newPage) => {
        setPage(newPage);
        const count = rowsPerPage;
        const offset = newPage * rowsPerPage;
        const groups = await client.listGroups(true, count, offset);
        dispatch(updateGroups(groups));
        dispatch(updateGroupsPage(newPage));
    };

    const onReload = async () => {
        const count = rowsPerPage;
        const offset = page * rowsPerPage;
        const groups = await client.listGroups(true, count, offset);
        dispatch(updateGroups(groups));
    };

    const handleChangeRowsPerPage = async (event) => {
        const rowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(rowsPerPage);
        setPage(0);
        const groups = await client.listGroups(true, rowsPerPage, 0);
        dispatch(updateGroups(groups));
        dispatch(updateGroupsPage(0));
        dispatch(updateGroupsRowsPerPage(rowsPerPage));
    };

    const onUpdateGroupClients = async (group, clients = []) => {
        if (!clients) {
            clients = [];
        }

        if (clients.length === 0) {
            await confirm({
                title: 'Remove all clients',
                description: `Do you really want to remove all clients from group "${group.groupname}"?`,
            });
        }

        const clientNames = clients.map((client) => client.value);
        await client.updateGroupClients(group, clientNames);
        try {
            const groups = await client.listGroups(true, rowsPerPage, page * rowsPerPage);
            dispatch(updateGroups(groups));
        } catch (error) {
            console.error(error);
            enqueueSnackbar(`${error}`, { variant: 'error' });
        }
    };

    const onUpdateGroupRoles = async (group, roles = []) => {
        if (!roles) {
            roles = [];
        }

        if (roles.length === 0) {
            await confirm({
                title: 'Remove all roles from group',
                description: `Do you really want to remove all roles from group "${group.groupname}"?`,
            });
        }

        const rolenames = roles.map((role) => role.value);
        try {
            await client.updateGroupRoles(group, rolenames);
            const groups = await client.listGroups(true, rowsPerPage, page * rowsPerPage);
            dispatch(updateGroups(groups));
        } catch (error) {
            console.error(error);
            enqueueSnackbar(`${error}`, { variant: 'error' });
        }
    };

    const onUpdateAnonymousGroup = async (groupname) => {
        await client.setAnonymousGroup(groupname);
        try {
            const group = await client.getAnonymousGroup();
            dispatch(updateAnonymousGroup(group));
            enqueueSnackbar('Anonymous group successfully set', {
                variant: 'success',
            });
        } catch (error) {
            console.error(error);
            enqueueSnackbar(`${error}`, { variant: 'error' });
        }
    };

    const onSelectGroup = async (groupname) => {
        const group = await client.getGroup(groupname);
        dispatch(updateGroup(group));
        history.push(`/groups/${groupname}`);
    };

    const onNewGroup = () => {
        history.push('/groups/new');
    };

    const onDeleteGroup = async (groupname) => {
        await confirm({
            title: 'Confirm group deletion',
            description: `Do you really want to delete the group "${groupname}"?`,
        });
        try {
            await client.deleteGroup(groupname);
            enqueueSnackbar(`Group "${groupname}" successfully deleted`, {
                variant: 'success',
            });
            const groups = await client.listGroups(true, rowsPerPage, page * rowsPerPage);
            dispatch(updateGroups(groups));
            // const clients = await client.listClients(); //??????
            // dispatch(updateClients(clients));
            if (!groups?.groups?.length && page > 0) {
                return handleChangePage(null, page - 1);
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar(`${error}`, { variant: 'error' });
        }
    };

    const onRemoveClientFromGroup = async (username, group) => {
        try {
            await client.removeGroupClient(username, group);
            const groups = await client.listGroups(true, rowsPerPage, page * rowsPerPage);
            dispatch(updateGroups(groups));
        } catch (error) {
            console.error(error);
            enqueueSnackbar(`${error}`, { variant: 'error' });
        }
    };

    const {
        dynamicsecurityFeature,
        anonymousGroup,
        groups,
        rolesAll,
        clientsAll,
        onSort,
        sortBy,
        sortDirection,
        defaultClient,
    } = props;

    // TODO: probably extract into reducer

    const isAdminClient = getIsAdminClient(defaultClient);

    const clientSuggestions = clientsAll
        ? clientsAll
              .concat()
              .sort(byUserName)
              .map((clientname) => ({
                  label: clientname,
                  value: clientname,
                  disabled: isAdminClient(clientname),
              }))
        : [];

    const roleSuggestions = rolesAll
        ? rolesAll
              .concat()
              .sort()
              .map((rolename) => ({
                  label: rolename,
                  value: rolename,
              }))
        : [];

    React.useEffect(() => {
        const fetchData = async () => {
            const promiseClients = client.listClients(false);
            const promiseGroups = client.listGroups(true, rowsPerPage, page * rowsPerPage);
            const promiseRoles = client.listRoles(false);
            const [clientsAll, groups, rolesAll] = await Promise.all([promiseClients, promiseGroups, promiseRoles]);
            dispatch(updateClientsAll(clientsAll));
            dispatch(updateGroups(groups));
            dispatch(updateRolesAll(rolesAll));
        };
        fetchData().catch((error) => console.error(error));
    }, []);

    return (
        <ContentContainer
            dataTour="page-groups"
            breadCrumbs={
                <div>
                    <ContainerBreadCrumbs title="Groups" links={[{ name: 'Home', route: '/home' }]} />
                    <AnonymousGroupSelect onUpdateAnonymousGroup={onUpdateAnonymousGroup} />
                </div>
            }
        >
            <ContainerHeader
                title="Groups"
                subTitle="List of existing groups. Groups serve as a hub to gather multiple clients and roles. The more clients are added to your broker the harder it gets to administer them. Groups can help you structure and quickly adjust your current setup."
                connectedWarning={!props.connected}
                brokerFeatureWarning={dynamicsecurityFeature?.supported === false ? 'dynamic security' : null}
            >
                {dynamicsecurityFeature?.supported !== false && [
                    <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        id="new-group-button"
                        startIcon={<AddIcon />}
                        style={{ marginRight: '10px' }}
                        onClick={(event) => {
                            event.stopPropagation();
                            onNewGroup();
                        }}
                    >
                        New Group
                    </Button>,
                    <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        id="reload-button-groups"
                        style={{ paddingRight: '0px', minWidth: '30px' }}
                        startIcon={<ReloadIcon />}
                        onClick={(event) => {
                            event.stopPropagation();
                            onReload();
                        }}
                    />,
                ]}
            </ContainerHeader>
            {dynamicsecurityFeature?.supported !== false && groups?.groups?.length > 0 ? (
                <TableContainer>
                    <Table stickyHeader size="small" aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {GROUP_TABLE_COLUMNS.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        sortDirection={sortBy === column.id ? sortDirection : false}
                                        align={column.align}
                                        style={{
                                            width: column.width,
                                            display:
                                                (!small && !medium) ||
                                                (column.id === 'name' && (small || medium)) ||
                                                (column.id === 'roles' && (small || medium)) ||
                                                (column.id === 'action' && (small || medium)) ||
                                                (column.id === 'clients' && medium)
                                                    ? undefined
                                                    : 'none',
                                        }}
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
                            {groups && //groups.groups && groups.groups.length &&
                                groups.groups.map((group) => (
                                    <TableRow
                                        hover
                                        key={group.groupname}
                                        onClick={(event) => {
                                            if (event.target.nodeName?.toLowerCase() === 'td') {
                                                onSelectGroup(group.groupname);
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>{group.groupname}</TableCell>
                                        {small || medium
                                            ? null
                                            : [
                                                  <TableCell>{group.textname}</TableCell>,
                                                  <TableCell>{group.textdescription}</TableCell>,
                                              ]}
                                        <TableCell className={classes.badges}>
                                            <SelectList
                                                values={group.clients}
                                                getValue={(value) => value.username}
                                                onChange={(event, value) => {
                                                    onUpdateGroupClients(group, value);
                                                }}
                                                disabled={false}
                                                suggestions={clientSuggestions}
                                            />
                                        </TableCell>
                                        {small ? null : (
                                            <TableCell className={classes.badges}>
                                                <SelectList
                                                    values={group.roles}
                                                    getValue={(value) => value.rolename}
                                                    onChange={(event, value) => {
                                                        onUpdateGroupRoles(group, value);
                                                    }}
                                                    disabled={false}
                                                    suggestions={roleSuggestions}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell align="center">
                                            <Tooltip title="Delete group">
                                                <IconButton
                                                    size="small"
                                                    id={`delete-group-${group.groupname}`}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        onDeleteGroup(group.groupname);
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
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
                                    count={groups?.totalCount}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onChangePage={handleChangePage}
                                    onChangeRowsPerPage={handleChangeRowsPerPage}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            ) : props.connected ? (
                <div>No groups found</div>
            ) : null}
        </ContentContainer>
    );
};

Groups.propTypes = {
    groups: PropTypes.arrayOf(groupShape).isRequired,
    sortBy: PropTypes.string,
    sortDirection: PropTypes.string,
    onSort: PropTypes.func.isRequired,
};

Groups.defaultProps = {
    sortBy: undefined,
    sortDirection: undefined,
};

const mapStateToProps = (state) => {
    return {
        anonymousGroup: state.groups?.anonymousGroup,
        groups: state.groups?.groups,
        rowsPerPage: state.groups?.rowsPerPage,
        page: state.groups?.page,
        roles: state.roles?.roles?.roles,
        rolesAll: state.roles?.rolesAll?.roles,
        clientsAll: state.clients?.clientsAll?.clients,
        clients: state.clients?.clients?.clients,
        dynamicsecurityFeature: state.systemStatus?.features?.dynamicsecurity,
        connected: state.brokerConnections?.connected,
        defaultClient: state.brokerConnections?.defaultClient,
    };
};

export default connect(mapStateToProps)(Groups);
