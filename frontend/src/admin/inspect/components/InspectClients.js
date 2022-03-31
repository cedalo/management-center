import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import { updateInspectClient, updateInspectClients } from '../actions/actions';
import { useSnackbar } from 'notistack';

import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { Alert, AlertTitle } from '@mui/material';
import AutoSuggest from '../../../components/AutoSuggest';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ClientIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
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

const PREFIX = 'InspectClients';

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

const CLIENTS_TABLE_COLUMNS = [
	{ id: 'username', key: 'Username' },
	{ id: 'clientid', key: 'Client ID' },
	{ id: 'protocol', key: 'Protocol' },
	{ id: 'protocol_version', key: 'Protocol Version' },
	{ id: 'address', key: 'Address' },
];

const createClientsTable = (clients, classes, props, onUpdateUserRoles, onSelectClient) => {
	const { inspectFeature, onSort, sortBy, sortDirection } = props;

	if (!inspectFeature?.error && inspectFeature?.supported !== false && clients && clients.length > 0) {
		return (
            <Root>
                <Hidden smDown implementation="css">
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table size="medium">
                            <TableHead>
                                <TableRow>
                                    {CLIENTS_TABLE_COLUMNS.map((column) => (
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
                                {clients &&
                                    clients.map((client) => (
                                        <StyledTableRow
                                            hover
                                            key={client.username}
                                            onClick={(event) => {
                                                onSelectClient(client.username);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                            classes={{
                                                root: classes.root
                                            }}>
                                            <TableCell>{client.username}</TableCell>
                                            <TableCell>{client.clientid}</TableCell>
                                            <TableCell>{client.protocol}</TableCell>
                                            <TableCell>{client.protocol_version}</TableCell>
                                            <TableCell>{client.address}</TableCell>
                                        </StyledTableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Hidden>
                <Hidden smUp implementation="css">
                    <Paper>
                        <List className={classes.root}>
                            {clients.map((client) => (
                                <React.Fragment>
                                    <ListItem
                                        alignItems="flex-start"
                                        onClick={(event) => onSelectClient(client.username)}
                                    >
                                        <ListItemText
                                            primary={<span>{client.username}</span>}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        className={classes.inline}
                                                        color="textPrimary"
                                                    >
                                                        {client.username}
                                                    </Typography>
                                                    <span> — {client.clientid} </span>
                                                </React.Fragment>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            {/* <IconButton
                                                edge="end"
                                                size="small"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onSelectClient(client.username);
                                                }}
                                                aria-label="edit"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton> */}
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
	} else if (inspectFeature?.error) {
		return null;
	} else {
		return <div>No clients connected</div>
	}
}

const Clients = (props) => {

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;

	const { inspectFeature, userProfile, roles = [], clients = [], onSort, sortBy, sortDirection } = props;

	const onUpdateUserRoles = async (user, roles = []) => {
		if (!roles) {
			roles = [];
		}
		const rolenames = roles.map((role) => role.value);
		await brokerClient.updateUserRoles(user, rolenames);
		const clients = await brokerClient.inspectListClients();
		dispatch(updateInspectClients(clients));
	};

	const onSelectClient = async (username) => {
		const client = await brokerClient.inspectGetClient(username);
		dispatch(updateInspectClient(client));
		history.push(`/admin/inspect/clients/detail/${username}`);
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
					Inspect
				</Typography>
			</Breadcrumbs>
			{/* TODO: Quick hack to detect whether feature is supported */}
			{inspectFeature?.error ? <><br/><Alert severity="warning">
				<AlertTitle>{inspectFeature.error.title}</AlertTitle>
				{inspectFeature.error.message}
			</Alert></> : null}
			{!inspectFeature?.error && inspectFeature?.supported === false ? <><br/><Alert severity="warning">
				<AlertTitle>Feature not available</AlertTitle>
				Make sure that this feature is included in your MMC license.
			</Alert></> : null}
			<br />
			<br />
			
			{ createClientsTable(clients,  props, onUpdateUserRoles, onSelectClient) }
		</div>
	);
};

Clients.propTypes = {
	sortBy: PropTypes.string,
	sortDirection: PropTypes.string,
	onSelectClient: PropTypes.func.isRequired,
	onSort: PropTypes.func.isRequired
};

Clients.defaultProps = {
	sortBy: undefined,
	sortDirection: undefined
};

const mapStateToProps = (state) => {
	return {
		clients: state.inspectClients?.clients,
		inspectFeature: state.systemStatus?.features?.inspect
	};
};

export default connect(mapStateToProps)(Clients);
