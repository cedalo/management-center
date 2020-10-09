import { connect } from "react-redux";
import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Avatar from "@material-ui/core/Avatar";
import GroupIcon from "@material-ui/icons/Group";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Paper from "@material-ui/core/Paper";
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
import ClientIcon from "@material-ui/icons/Person";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import AccountCircle from "@material-ui/icons/AccountCircle";
import InputAdornment from "@material-ui/core/InputAdornment";
import { Link as RouterLink } from "react-router-dom";

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

const clientShape = PropTypes.shape({
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
  margin: {
    margin: theme.spacing(1),
  },
  breadcrumbItem: theme.palette.breadcrumbItem,
  breadcrumbLink: theme.palette.breadcrumbLink,
}));

const ClientDetail = (props) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
	const { client = {} } = props;
	const { match: {
		params: {
			clientId
		}
	}} = props;
	// TODO: get client by id if current client is not defined

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink className={classes.breadcrumbLink} to="/home">Home</RouterLink>
        <RouterLink className={classes.breadcrumbLink} to="/security">Security</RouterLink>
        <RouterLink className={classes.breadcrumbLink} to="/security/clients">Clients</RouterLink>
        <Typography className={classes.breadcrumbItem} color="textPrimary">{client.username}</Typography>
      </Breadcrumbs>
      <br />
    <Paper>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="off"
        aria-label="Client"
      >
        <Tab
          label="Details"
          icon={<ClientIcon />}
          aria-label="details"
          {...a11yProps(0)}
        />
        <Tab
          label="Credentials"
          icon={<CredentialsIcon />}
          aria-label="credentials"
          {...a11yProps(1)}
        />
        <Tab
          label="Groups"
          icon={<GroupsIcon />}
          aria-label="groups"
          {...a11yProps(2)}
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
                  id="client-id"
                  label="Client ID"
				  value={client.clientid}
                  defaultValue=""
                  variant="outlined"
				  fullWidth
                  className={classes.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ClientIDIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
				  disabled
                  id="username"
				  label="username"
				  value={client.username}
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
				  disabled
                  id="textname"
				  label="Text name"
				  value={client.textName}
				//   onChange={(event) => setTextName(event.target.value)}
                  defaultValue=""
                  variant="outlined"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
				  disabled
                  id="textdescription"
				  label="Text description"
				  value={client.textDescription}
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
        <form className={classes.form} noValidate autoComplete="off">
          <div className={classes.margin}>
            <Grid container spacing={1} alignItems="flex-end">
              <Grid item xs={12}>
                <TextField
                  required
				  disabled
                  id="password"
                  label="Password"
				  value={client.password}
                  defaultValue=""
                  variant="outlined"
                  fullWidth
                  type="password"
                  className={classes.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PasswordIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
				  disabled
                  id="password-confirm"
				  label="Confirm password"
				  value={client.password}
                  defaultValue=""
                  variant="outlined"
                  fullWidth
                  type="password"
                  className={classes.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PasswordIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </div>
        </form>
      </TabPanel>
      <TabPanel value={value} index={2}>
	  <List className={classes.root}>
          {client.groups?.map((group) => (
            <React.Fragment>
              <ListItem button>
                <ListItemText
                  primary={group.groupName}
                  secondary={group.textDescription}
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
	  </Paper>
    </div>
  );
};

ClientDetail.propTypes = {
  client: clientShape.isRequired,
};

const mapStateToProps = (state) => {
  return {
	// TODO: check object hierarchy
	client: state.clients?.client,
  };
};

export default connect(mapStateToProps)(ClientDetail);
