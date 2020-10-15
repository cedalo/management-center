import { connect, useDispatch } from "react-redux";
import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import { useConfirm } from 'material-ui-confirm';
import { makeStyles } from "@material-ui/core/styles";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import Avatar from "@material-ui/core/Avatar";
import GroupIcon from "@material-ui/icons/Group";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import CredentialsIcon from "@material-ui/icons/Lock";
import GroupsIcon from "@material-ui/icons/Group";
import ClientIDIcon from "@material-ui/icons/Fingerprint";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import PasswordIcon from "@material-ui/icons/VpnKey";
import Paper from "@material-ui/core/Paper";
import UserIcon from "@material-ui/icons/Person";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import AccountCircle from "@material-ui/icons/AccountCircle";
import InputAdornment from "@material-ui/core/InputAdornment";
import { Link as RouterLink } from "react-router-dom";

import { WebSocketContext } from '../websockets/WebSocket';
import { updateGroup, updateGroups } from '../actions/actions';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-prevent-tabpanel-${index}`}
      aria-labelledby={`scrollable-prevent-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box pt={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `scrollable-prevent-tab-${index}`,
    "aria-controls": `scrollable-prevent-tabpanel-${index}`,
  };
}

const userShape = PropTypes.shape({
  username: PropTypes.string,
  lastName: PropTypes.string,
  firstName: PropTypes.string,
  groups: PropTypes.array,
});

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  form: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    // marginLeft: theme.spacing(1),
    // marginRight: theme.spacing(1),
    // width: 200,
  },
  buttons: {
	'& > *': {
		margin: theme.spacing(1),
	  },
  },
  margin: {
    margin: theme.spacing(1),
  },
  breadcrumbItem: theme.palette.breadcrumbItem,
  breadcrumbLink: theme.palette.breadcrumbLink,
}));

const GroupDetail = (props) => {
  const classes = useStyles();
  const context = useContext(WebSocketContext);
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const { client: brokerClient } = context;

  const [value, setValue] = React.useState(0);
  const [state, setState] = React.useState({
    checkedA: true,
    checkedB: true,
  });
  const { group = {} } = props;
  const [editMode, setEditMode] = React.useState(false);
  const [updatedGroup, setUpdatedGroup] = React.useState({
	...group
  });

  const validate = () => {
	const valid = (updatedGroup.groupName !== '');
	return valid;
  }



  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const onUpdateGroup = async () => {
	console.log(updatedGroup);
	await brokerClient.modifyGroup(updatedGroup);
	const groupObject = await brokerClient.getGroup(group.groupName);
	dispatch(updateGroup(groupObject));
	const groups = await brokerClient.listGroups();
	dispatch(updateGroups(groups));
	setEditMode(false);
  }

const onCancelEdit = async () => {
  await confirm({
	  title: 'Cancel group editing',
	  description: `Do you really want to cancel editing this group?`
  });
  setUpdatedGroup({
	  ...group
  });
  setEditMode(false);
}

  return (
    <div className={classes.root}>
      <Breadcrumbs maxItems={2} aria-label="breadcrumb">
        <RouterLink className={classes.breadcrumbLink} to="/home">Home</RouterLink>
        <RouterLink className={classes.breadcrumbLink} to="/security">Security</RouterLink>
        <RouterLink className={classes.breadcrumbLink} to="/security/groups">Groups</RouterLink>
  		<Typography className={classes.breadcrumbItem} color="textPrimary">{group.groupName}</Typography>
      </Breadcrumbs>
      <br />
	  <Paper>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="off"
        aria-label="User"
      >
        <Tab
          label="Details"
          icon={<GroupsIcon />}
          aria-label="details"
          {...a11yProps(0)}
        />
        <Tab
          label="Users"
          icon={<UserIcon />}
          aria-label="users"
          {...a11yProps(1)}
        />
      </Tabs>
      <TabPanel value={value} index={0}>
        <form className={classes.form} noValidate autoComplete="off">
          <div className={classes.margin}>
            <Grid container spacing={1} alignItems="flex-end">
              <Grid item xs={12}>
                <TextField
                  required
				  disabled
				  onChange={(event) => {
					  if (editMode) {
						setUpdatedGroup({
							...updatedGroup,
							groupName: event.target.value
						})
					  }
				  }}
                  id="groupName"
				  value={updatedGroup.groupName}
                  label="Groupname"
                  defaultValue=""
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
				  disabled={!editMode}
				  onChange={(event) => {
					  if (editMode) {
						setUpdatedGroup({
							...updatedGroup,
							textName: event.target.value
						})
					  }
				  }}
                  id="textname"
				  label="Text name"
				  value={updatedGroup.textName}
				//   onChange={(event) => setTextName(event.target.value)}
                  defaultValue=""
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
				  disabled={!editMode}
				  onChange={(event) => {
					  if (editMode) {
						setUpdatedGroup({
							...updatedGroup,
							textDescription: event.target.value
						})
					  }
				  }}
                  id="textdescription"
				  label="Text description"
				  value={updatedGroup.textDescription}
				//   onChange={(event) => setTextDescription(event.target.value)}
                  defaultValue=""
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
            </Grid>
          </div>
        </form>
      </TabPanel>
      <TabPanel value={value} index={1}>
	  <List className={classes.root}>
          {group.users?.map((user) => (
            <React.Fragment>
              <ListItem button>
                <ListItemText
                  primary={user}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </TabPanel>
	  { !editMode && <Grid item xs={12} className={classes.buttons} >
				<Button
					variant="contained"
					color="primary"
					className={classes.button}
					startIcon={<EditIcon />}
					onClick={() => setEditMode(true)}
				>
					Edit
				</Button>
				</Grid>
			}
			  { editMode && <Grid item xs={12} className={classes.buttons} >
				<Button
					variant="contained"
					disabled={!validate()}
					color="primary"
					className={classes.button}
					startIcon={<SaveIcon />}
					onClick={(event) => {
					  event.stopPropagation();
					  onUpdateGroup();
					}}
				>
					Save
				</Button>
				<Button
					variant="contained"
					onClick={(event) => {
					  event.stopPropagation();
					  onCancelEdit();
					}}
				>
					Cancel
				</Button>
				</Grid>
			}
	  </Paper>
    </div>
  );
};

GroupDetail.propTypes = {
  user: userShape.isRequired,
};

const mapStateToProps = (state) => {
  return {
		// TODO: check object hierarchy
		group: state.groups?.group,
	};
};

export default connect(mapStateToProps)(GroupDetail);
