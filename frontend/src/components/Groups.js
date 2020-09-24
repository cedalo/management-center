import moment from "moment";
import PropTypes from "prop-types";
import React, { useContext } from "react";
import { connect, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
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
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import GroupIcon from "@material-ui/icons/Group";
import UserIcon from "@material-ui/icons/Person";
import { Link as RouterLink } from "react-router-dom";

import { WebSocketContext } from '../websockets/WebSocket';
import { updateGroup, updateGroups } from '../actions/actions';

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
  groupname: PropTypes.string,
});

const GROUP_TABLE_COLUMNS = [
  { id: "groupname", key: "Name" },
  { id: "users", key: "Users" },
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
  const { client } = context;

  const onSelectGroup = async (groupName) => {
	const group = await client.getGroup(groupName);
	dispatch(updateGroup(group));
	history.push(`/security/groups/${groupName}`);
  }

  const onDeleteGroup = async (groupname) => {
	  await client.deleteGroup(groupname);
	  const groups = await client.listGroups();
	  dispatch(updateGroups(groups));
  }

  const onRemoveUserFromGroup = async (username, group) => {
	await client.removeUserFromGroup(username, group);
	const groups = await client.listGroups();
	dispatch(updateGroups(groups));
};

  const {
	groups = [],
    onSort,
    sortBy,
    sortDirection,
  } = props;

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink className={classes.breadcrumbLink} to="/">Home</RouterLink>
        <RouterLink className={classes.breadcrumbLink} to="/security">Security</RouterLink>
        <Typography className={classes.breadcrumbItem} color="textPrimary">User Groups</Typography>
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
                  key={group.groupname}
                  onClick={() => onSelectGroup(group.groupname)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <b>{group.groupname}</b>
                  </TableCell>
                  {/* <TableCell>{moment(group.lastModified).fromNow()}</TableCell> */}
                  <TableCell className={classes.badges}>
                    {group.users && group.users.map((user) => (
                      <Chip
                        icon={<UserIcon />}
                        label={user}
                        onDelete={(event) => {
                          event.stopPropagation();
                          onRemoveUserFromGroup(user, group.groupname);
                        }}
                        color="secondary"
						variant="outlined"
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    {
                      <div>
                        <IconButton
                          style={{ color: "#FF0022" }}
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteGroup(group.groupname);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          style={{ color: "#FF0022" }}
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteGroup(group.groupname);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Hidden>
      <Hidden smUp implementation="css">
        <List className={classes.root}>
          {groups.map((group) => (
            <React.Fragment>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    <GroupIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <span>
                      <b>{group.groupname}</b>
                    </span>
                  }
                  //   secondary={
                  //     <React.Fragment>
                  //       <Typography
                  //         component="span"
                  //         variant="body2"
                  //         className={classes.inline}
                  //         color="textPrimary"
                  //       >
                  //         Group details
                  //       </Typography>
                  //     </React.Fragment>
                  //   }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </Hidden>
	  </div>
		:
		<div>No groups found</div>
		}
      <Fab color="primary" aria-label="add" className={classes.fab}>
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
		// TODO: check object hierarchy
		groups: state.groups?.groups,
  };
};

export default connect(mapStateToProps)(Groups);
