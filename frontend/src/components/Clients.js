import moment from "moment";
import PropTypes from "prop-types";
import React, { useContext } from "react";
import { connect, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useConfirm } from 'material-ui-confirm';
import Chip from "@material-ui/core/Chip";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import GroupIcon from "@material-ui/icons/Group";
import ClientIcon from "@material-ui/icons/Person";
import { Link as RouterLink } from "react-router-dom";

import AutoSuggest from './AutoSuggest';
import { WebSocketContext } from '../websockets/WebSocket';
import { updateClient, updateClients, updateGroups } from '../actions/actions';

const useStyles = makeStyles((theme) => ({
	tableContainer: {
		minHeight: '500px',
	},
	badges: {
    "& > *": {
      margin: theme.spacing(0.3),
    },
  },
  fab: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  breadcrumbItem: theme.palette.breadcrumbItem,
  breadcrumbLink: theme.palette.breadcrumbLink,
}));

const clientShape = PropTypes.shape({
  username: PropTypes.string,
//   lastName: PropTypes.string,
//   firstName: PropTypes.string,
  groups: PropTypes.array,
});

const USER_TABLE_COLUMNS = [
  { id: "clientid", key: "Client ID" },
  { id: "username", key: "username" },
  { id: "textname", key: "Text name" },
  { id: "textdescription", key: "Description" },
  { id: "groups", key: "Groups" },
  { id: "roles", key: "Roles" },
];

const FormattedClientType = (props) => {
  switch (props.provider) {
    case "local":
      return "Local";
    default:
      return props.provider || "";
  }
};

const Clients = (props) => {
  const classes = useStyles();
  const context = useContext(WebSocketContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const confirm = useConfirm();
  const { client: brokerClient } = context;

  const onUpdateClientGroups = async (client, groups = []) => {
	if (!groups) {
		groups = [];
	}
	if (groups.length === 0) {
		await confirm({
			title: 'Confirm remove client from all groups',
			description: `Do you really want to remove client "${client.username}" from all groups?`,
			cancellationButtonProps: {
				variant: 'contained',
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained',
			}
		});
	}
	const groupnames = groups.map(group => group.value);
	await brokerClient.updateClientGroups(client, groupnames);
	const clients = await brokerClient.listClients();
	dispatch(updateClients(clients));
	const groupsUpdated = await brokerClient.listGroups();
	dispatch(updateGroups(groupsUpdated));
  }

  const onUpdateClientRoles = async (client, roles = []) => {
	if (!roles) {
		roles = [];
	}
	const rolenames = roles.map(role => role.value);
	await brokerClient.updateClientRoles(client, rolenames);
	const clients = await brokerClient.listClients();
	dispatch(updateClients(clients));
  }

  const onSelectClient = async (username) => {
	const client = await brokerClient.getClient(username);
	dispatch(updateClient(client));
	history.push(`/security/clients/detail/${username}`);
  }

  const onNewClient = () => {
	history.push("/security/clients/new");
  }

  const onEditClient = async (username) => {
	const client = await brokerClient.getClient(username);
	dispatch(updateClient(client));
	history.push(`/security/clients/detail/${username}/?action=edit`);
  }

  const onDeleteClient = async (username) => {
	await confirm({
		title: 'Confirm client deletion',
		description: `Do you really want to delete client "${username}"?`,
		cancellationButtonProps: {
			variant: 'contained',
		},
		confirmationButtonProps: {
			color: 'primary',
			variant: 'contained',
		}
	});
	if (username === 'cedalo') {
		await confirm({
			title: 'Confirm default client deletion',
			description: `Are you sure? You are about to delete the default client for the current Mosquitto instance.`,
			cancellationButtonProps: {
				variant: 'contained',
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained',
			}
		});
	}
	await brokerClient.deleteClient(username);
	const clients = await brokerClient.listClients();
	dispatch(updateClients(clients));
	const groups = await brokerClient.listGroups();
	dispatch(updateGroups(groups));
  }

	const onRemoveClientFromGroup = async (client, group) => {
		await confirm({
			title: 'Remove client from group',
			description: `Do you really want to remove client "${client.username}" from group "${group}"?`
		});
		await client.removeGroupClient(client, group);
		const clients = await client.listClients();
		dispatch(updateClients(clients));
	};

  const {
	groups = [],
	roles = [],
	clients = [],
    onSort,
    sortBy,
    sortDirection,
  } = props;

  const groupSuggestions = groups
	  .map(group => group.groupname)
	  .sort()
	  .map(groupname => ({
		label: groupname,
		value: groupname,
	  }));

	const roleSuggestions = roles
	  .map(role => role.rolename)
	  .sort()
	  .map(rolename => ({
		  label: rolename,
		  value: rolename,
	  }));

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink className={classes.breadcrumbLink} to="/home">Home</RouterLink>
        <RouterLink className={classes.breadcrumbLink} color="inherit" to="/security">Security</RouterLink>
        <Typography className={classes.breadcrumbItem} color="textPrimary">Clients</Typography>
      </Breadcrumbs>
      <br />
	  {
		clients && clients.length > 0 ? 
		<div>
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
                    {/* <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortDirection}
                      onClick={() => onSort(column.id)}
                    > */}
                      {column.key}
                    {/* </TableSortLabel> */}
                  </TableCell>
                ))}
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {clients && clients.map((client) => (
                <TableRow
                  hover
                  key={client.username}
                  onClick={(event) => {
					  if (event.target.nodeName?.toLowerCase() === "td") {
						onSelectClient(client.username);
					  }
				  }}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>
                    {client.username}
                  </TableCell>
                  <TableCell>
                    {client.clientid}
                  </TableCell>
                  <TableCell>
                    {client.textname}
                  </TableCell>
                  <TableCell>
                    {client.textdescription}
                  </TableCell>
                  <TableCell className={classes.badges}>
					<AutoSuggest 
						suggestions={groupSuggestions}
						values={client.groups.map((group) => ({
							label: group.groupname,
							value: group.groupname
						}))}
						handleChange={(value) => {
							onUpdateClientGroups(client, value);
						}}
					/>
                  </TableCell>
                  <TableCell className={classes.badges}>
					<AutoSuggest 
						suggestions={roleSuggestions}
						values={client.roles.map((role) => ({
							label: role.rolename,
							value: role.rolename
						}))}
						handleChange={(value) => {
							onUpdateClientRoles(client, value);
						}}
					/>
                  </TableCell>
                  <TableCell align="right">
                        {/* <IconButton
						  size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEditClient(client.username);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton> */}
                        <IconButton
						  size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteClient(client.username);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
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
          {clients.map((client) => (
            <React.Fragment>
              <ListItem
			  	alignItems="flex-start" 
          		onClick={(event) => onSelectClient(client.username)}
			  >
                <ListItemText
                  primary={
                    <span>
                      {client.username}
                    </span>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        className={classes.inline}
                        color="textPrimary"
                      >
                        {client.textname}
                      </Typography>
					  <span> —  {client.textdescription} </span>

                      {/* <div className={classes.badges}>
                        {client.groups.map((group) => (
                          <Chip
                            // icon={<FaceIcon />}
                            size="small"
                            label={group}
                            onDelete={(event) => {
                              event.stopPropagation();
                              onRemoveClientFromGroup(client, group);
                            }}
                            color="secondary"
                          />
                        ))}
                      </div> */}
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
					<IconButton
							edge="end"
							size="small"
							onClick={(event) => {
							event.stopPropagation();
								onSelectClient(client.username);
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
								onDeleteClient(client.username);
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
		:
		<div>No clients found</div>
		}
      <Fab
		  color="primary"
		  aria-label="add"
		  className={classes.fab}
		  onClick={(event) => {
			event.stopPropagation();
			onNewClient();
		  }}
		>
        <AddIcon />
      </Fab>
    </div>
  );
};

Clients.propTypes = {
  clients: PropTypes.arrayOf(clientShape).isRequired,
  sortBy: PropTypes.string,
  sortDirection: PropTypes.string,
  onSelectClient: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
};

Clients.defaultProps = {
  sortBy: undefined,
  sortDirection: undefined,
};

const mapStateToProps = (state) => {
  return {
	  groups: state.groups?.groups,
	  roles: state.roles?.roles,
	  clients: state.clients?.clients,
  };
};

export default connect(mapStateToProps)(Clients);
