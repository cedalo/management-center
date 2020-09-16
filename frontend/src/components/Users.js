import { connect } from "react-redux";
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

import moment from "moment";
import PropTypes from "prop-types";
import React from "react";

const remove = (array, item) => {
  const index = array.indexOf(item);
  array.splice(index, 1);
};

const useStyles = makeStyles((theme) => ({
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
}));

const userShape = PropTypes.shape({
  username: PropTypes.string,
  lastName: PropTypes.string,
  firstName: PropTypes.string,
  groups: PropTypes.array,
});

const USER_TABLE_COLUMNS = [
  { id: "clientid", key: "Client ID" },
  { id: "username", key: "Username" },
  { id: "firstName", key: "Firstname" },
  { id: "lastName", key: "Lastname" },
  { id: "groups", key: "Groups" },
];

const FormattedUserType = (props) => {
  switch (props.provider) {
    case "local":
      return "Local";
    default:
      return props.provider || "";
  }
};

const Users = (props) => {
  const classes = useStyles();

  const {
    /* users, */ onDeleteUser,
    onSelectUser,
    onSort,
    sortBy,
    sortDirection,
  } = props;

  users = users || [];

  const handleRemoveUserFromGroup = (user, group) => {
    remove(user.groups, group);
    user.username = "tests";
  };

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/security">Security</RouterLink>
        <Typography color="textPrimary">Users</Typography>
      </Breadcrumbs>
      <br />
      <Hidden xsDown implementation="css">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {USER_TABLE_COLUMNS.map((column) => (
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
              {users && users.map((user) => (
                <TableRow
                  hover
                  key={user.id}
                  onClick={() => onSelectUser(user.id)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <b>{user.clientid}</b>
                  </TableCell>
                  <TableCell>
                    <b>{user.username}</b>
                  </TableCell>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell className={classes.badges}>
                    {user.groups && user.groups.map((group) => (
                      <Chip
                        icon={<GroupIcon />}
                        label={group.name}
                        onDelete={(event) => {
                          event.stopPropagation();
                          handleRemoveUserFromGroup(user, group.name);
                        }}
						color="secondary"
						variant="outlined"
                      />
                    ))}
                  </TableCell>
                  {/* <TableCell>{moment(user.lastModified).fromNow()}</TableCell> */}
                  <TableCell>
                    {
                      <div>
                        <IconButton
                          style={{ color: "#FF0022" }}
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteUser(user.id);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          style={{ color: "#FF0022" }}
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteUser(user.id);
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
          {users.map((user) => (
            <React.Fragment>
              <ListItem alignItems="flex-start" component={RouterLink} to="users/detail">
                <ListItemAvatar>
                  <Avatar>
                    <UserIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <span>
                      <b>{user.username}</b>
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
                        {user.username}
                      </Typography>
					  <span> —  {user.firstName} {user.lastName}</span>

                      {/* <div className={classes.badges}>
                        {user.groups.map((group) => (
                          <Chip
                            // icon={<FaceIcon />}
                            size="small"
                            label={group.name}
                            onDelete={(event) => {
                              event.stopPropagation();
                              handleRemoveUserFromGroup(user, group.name);
                            }}
                            color="secondary"
                          />
                        ))}
                      </div> */}
                    </React.Fragment>
                  }
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
      <Fab color="primary" aria-label="add" className={classes.fab}>
        <AddIcon />
      </Fab>
    </div>
  );
};

Users.propTypes = {
  users: PropTypes.arrayOf(userShape).isRequired,
  sortBy: PropTypes.string,
  sortDirection: PropTypes.string,
  onDeleteUser: PropTypes.func.isRequired,
  onSelectUser: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
};

Users.defaultProps = {
  sortBy: undefined,
  sortDirection: undefined,
};

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps)(Users);
