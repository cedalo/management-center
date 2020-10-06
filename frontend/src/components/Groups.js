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
import { updateGroup, updateGroups, updateClients } from '../actions/actions';

const useStyles = makeStyles((theme) => ({
  badges: {
    "& > *": {
      margin: theme.spacing(0.5),
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

const groupShape = PropTypes.shape({
  groupName: PropTypes.string,
});

const GROUP_TABLE_COLUMNS = [
  { id: "groupName", key: "Name" },
  { id: "textName", key: "Text name" },
  { id: "textDescription", key: "Description" },
  { id: "clients", key: "Clients" },
];

const FormattedGroupType = (props) => {
  switch (props.provider) {
    case "local":
      return "Local";
    default:
      return props.provider || "";
  }
};

const Groups = (props) => {
  const classes = useStyles();
  const context = useContext(WebSocketContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const confirm = useConfirm();
  const { client } = context;

  const onUpdateGroupClients = async (group, clients = []) => {
	if (!clients) {
		clients = [];
	}
	const clientNames = clients.map(client => client.value);
	await client.updateGroupClients(group, clientNames);
	const groups = await client.listGroups();
	dispatch(updateGroups(groups));
	const clientsUpdated = await client.listClients();
	dispatch(updateClients(clientsUpdated));
  }

  const onUpdateGroupRoles = async (group, roles = []) => {
	if (!roles) {
		roles = [];
	}
	const roleNames = roles.map(role => role.value);
	await client.updateGroupRoles(group, roleNames);
	const groups = await client.listGroups();
	dispatch(updateGroups(groups));
  }

  const onSelectGroup = async (groupName) => {
	const group = await client.getGroup(groupName);
	dispatch(updateGroup(group));
	history.push(`/security/groups/detail/${groupName}`);
  }

  const onNewGroup = () => {
	history.push("/security/groups/new");
  }
  
  const onDeleteGroup = async (groupName) => {
		await confirm({
			title: 'Confirm group deletion',
			description: `Do you really want to delete the group "${groupName}"?`
		});
	  await client.deleteGroup(groupName);
	  const groups = await client.listGroups();
	  dispatch(updateGroups(groups));
	  const clients = await client.listClients();
	  dispatch(updateClients(clients));
  }

  const onRemoveClientFromGroup = async (username, group) => {
	await client.removeClientFromGroup(username, group);
	const groups = await client.listGroups();
	dispatch(updateGroups(groups));
};

  const {
	groups = [],
	roles = [],
	clients = [],
    onSort,
    sortBy,
    sortDirection,
  } = props;

  // TODO: probably extract into reducer
  const clientSuggestions = clients
	.map(client => client.username)
	.sort()
	.map(username => ({
		label: username,
		value: username,
	}));

	const roleSuggestions = roles
	.map(role => role.roleName)
	.sort()
	.map(roleName => ({
		label: roleName,
		value: roleName,
	}));

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink className={classes.breadcrumbLink} to="/home">Home</RouterLink>
        <RouterLink className={classes.breadcrumbLink} to="/security">Security</RouterLink>
        <Typography className={classes.breadcrumbItem} color="textPrimary">Client Groups</Typography>
      </Breadcrumbs>
      <br />
	  { groups && groups.length > 0 ? 
	  <div>
      <Hidden xsDown implementation="css">
		<TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {GROUP_TABLE_COLUMNS.map((column) => (
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
              {groups && groups.map((group) => (
                <TableRow
                  hover
				  key={group.groupName}
                  onClick={(event) => {
					if (event.target.nodeName?.toLowerCase() === "td") {
						onSelectGroup(group.groupName);
					}
				  }}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>
                    {group.groupName}
                  </TableCell>
                  <TableCell>
                    {group.textName}
                  </TableCell>
                  <TableCell>
                    {group.textDescription}
                  </TableCell>
                  {/* <TableCell>{moment(group.lastModified).fromNow()}</TableCell> */}
                  <TableCell className={classes.badges}>
					<AutoSuggest 
						suggestions={clientSuggestions}
						values={group.clients.map((client) => ({
							label: client.username,
							value: client.username
						}))}
						handleChange={(value) => {
							onUpdateGroupClients(group, value);
						}}
					/>
                  </TableCell>
                  <TableCell className={classes.badges}>
					<AutoSuggest 
						suggestions={roleSuggestions}
						values={group.roles.map((role) => ({
							label: role.roleName,
							value: role.roleName
						}))}
						handleChange={(value) => {
							onUpdateGroupUsers(group, value);
						}}
					/>
                    {/* {group.users && group.users.map((user) => (
                      <Chip
					    size="small"
                        icon={<UserIcon />}
                        label={user.username}
                        onDelete={(event) => {
                          event.stopPropagation();
                          onRemoveUserFromGroup(user.username, group.groupName);
                        }}
                        color="secondary"
                      />
                    ))} */}
                  </TableCell>
                  <TableCell align="right">
                        <IconButton
						  size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectGroup(group.groupName);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
						  size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteGroup(group.groupName);
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
          {groups.map((group) => (
            <React.Fragment>
			<ListItem
				alignItems="flex-start" 
          		onClick={(event) => onSelectGroup(group.groupname)}
			>
                <ListItemText
                  primary={
                    <span>
                      {group.groupName}
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
                        {group.textName}
                      </Typography>
					  <span> —  {group.textDescription} </span>
                      </React.Fragment>
                    }
                />
                <ListItemSecondaryAction>
					<IconButton
							edge="end"
							size="small"
							onClick={(event) => {
							event.stopPropagation();
								onSelectGroup(group.groupName);
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
								onDeleteGroup(group.groupName);
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
		<div>No groups found</div>
		}
      <Fab
		  color="primary"
		  aria-label="add"
		  className={classes.fab}
		  onClick={(event) => {
			event.stopPropagation();
			onNewGroup();
		  }}
	  >
        <AddIcon />
      </Fab>
    </div>
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
		groups: state.groups?.groups,
		roles: state.roles?.roles,
		clients: state.clients?.clients,
  };
};

export default connect(mapStateToProps)(Groups);
