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
import GroupIcon from "@material-ui/icons/Group";
import UserIcon from "@material-ui/icons/Person";
import { Link as RouterLink } from "react-router-dom";

import { WebSocketContext } from '../websockets/WebSocket';
import { updateUser, updateUsers } from '../actions/actions';

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
  breadcrumbItem: theme.palette.breadcrumbItem,
  breadcrumbLink: theme.palette.breadcrumbLink,
}));

const userShape = PropTypes.shape({
  username: PropTypes.string,
//   lastName: PropTypes.string,
//   firstName: PropTypes.string,
  groups: PropTypes.array,
});

const USER_TABLE_COLUMNS = [
  { id: "clientid", key: "Client ID" },
  { id: "username", key: "Username" },
  { id: "textName", key: "Text name" },
  { id: "textDescription", key: "Description" },
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
  const context = useContext(WebSocketContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const { client } = context;

  const onSelectUser = async (userName) => {
	const user = await client.getUser(userName);
	dispatch(updateUser(user));
	history.push(`/security/users/detail/${userName}`);
  }

  const onNewUser = () => {
	history.push("/security/users/new");
  }

  const onEditUser = async (userName) => {
	const user = await client.getUser(userName);
	dispatch(updateUser(user));
	history.push(`/security/users/detail/${userName}/?action=edit`);
  }

  const onDeleteUser = async (username) => {
	  await client.deleteUser(username);
	  const users = await client.listUsers();
	  dispatch(updateUsers(users));
  }

	const onDeleteUserFromGroup = async (user, group) => {
		await client.deleteUserFromGroup(user, group);
		const users = await client.listUsers();
		dispatch(updateUsers(users));
	};

  const {
	users = [],
    onSort,
    sortBy,
    sortDirection,
  } = props;



  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink className={classes.breadcrumbLink} to="/">Home</RouterLink>
        <RouterLink className={classes.breadcrumbLink} color="inherit" to="/security">Security</RouterLink>
        <Typography className={classes.breadcrumbItem} color="textPrimary">Users</Typography>
      </Breadcrumbs>
      <br />
	  {
		users && users.length > 0 ? 
		<div>
      <Hidden xsDown implementation="css">
        <TableContainer component={Paper}>
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
              {users && users.map((user) => (
                <TableRow
                  hover
                  key={user.username}
                  onClick={() => onSelectUser(user.username)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>
                    {user.clientid}
                  </TableCell>
                  <TableCell>
                    {user.username}
                  </TableCell>
                  <TableCell>
                    {user.textName}
                  </TableCell>
                  <TableCell>
                    {user.textDescription}
                  </TableCell>
                  {/* <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell> */}
                  <TableCell className={classes.badges}>
                    {user.groups && user.groups.map((group) => (
                      <Chip
					    size="small"
                        icon={<GroupIcon />}
                        label={group.groupName}
                        onDelete={(event) => {
                          event.stopPropagation();
                          onDeleteUserFromGroup(user.username, group.groupName);
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
						  size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEditUser(user.username);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
						  size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteUser(user.username);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
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
					  {/* <span> —  {user.firstName} {user.lastName}</span> */}

                      {/* <div className={classes.badges}>
                        {user.groups.map((group) => (
                          <Chip
                            // icon={<FaceIcon />}
                            size="small"
                            label={group}
                            onDelete={(event) => {
                              event.stopPropagation();
                              onDeleteUserFromGroup(user, group);
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
	  </div>
		:
		<div>No users found</div>
		}
      <Fab
		  color="primary"
		  aria-label="add"
		  className={classes.fab}
		  onClick={(event) => {
			event.stopPropagation();
			onNewUser();
		  }}
		>
        <AddIcon />
      </Fab>
    </div>
  );
};

Users.propTypes = {
  users: PropTypes.arrayOf(userShape).isRequired,
  sortBy: PropTypes.string,
  sortDirection: PropTypes.string,
  onSelectUser: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
};

Users.defaultProps = {
  sortBy: undefined,
  sortDirection: undefined,
};

const mapStateToProps = (state) => {
  return {
	  // TODO: check object hierarchy
	  users: state.users?.users,
  };
};

export default connect(mapStateToProps)(Users);
