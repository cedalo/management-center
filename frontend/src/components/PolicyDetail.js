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
import UserIcon from "@material-ui/icons/Person";
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

const policyShape = PropTypes.shape({
  policyName: PropTypes.string,
});

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
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
  breadcrumbLink: {
	color: "inherit",
	textDecoration: "none",
	"&:hover": {
	  textDecoration: "underline"
	}
  },
}));

const PolicyDetail = (props) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [state, setState] = React.useState({
    checkedA: true,
    checkedB: true,
  });

  const handleBannedChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  //   const { policy } = props;
  // TODO: get current policy
  const policy = {
    policyName: "",
    features: [
      {
        name: "user-management",
        allow: true,
      },
      {
        name: "security-policy",
        allow: true,
      },
    ],
    topics: [
      {
        type: "publish-write",
        topicFilter: "",
        maxQos: 2,
        allowRetain: true,
        maxPayloadSize: 1000,
        allow: false,
      },
    ],
  };

  return (
    <div className={classes.root}>
      <Breadcrumbs maxItems={2} aria-label="breadcrumb">
        <RouterLink className={classes.breadcrumbLink} to="/">Home</RouterLink>
        <RouterLink className={classes.breadcrumbLink} to="/security">Security</RouterLink>
        <RouterLink className={classes.breadcrumbLink} to="/security/policies">Policies</RouterLink>
        <Typography color="textPrimary">{policy.policyName}</Typography>
      </Breadcrumbs>
      <br />
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="off"
        aria-label="Policy"
      >
        <Tab
          label="Details"
          icon={<UserIcon />}
          aria-label="details"
          {...a11yProps(0)}
        />
        {/* <Tab
          label="Features"
          icon={<UserIcon />}
          aria-label="features"
          {...a11yProps(1)}
        />
        <Tab
          label="Topics"
          icon={<UserIcon />}
          aria-label="topics"
          {...a11yProps(2)}
        /> */}
        <Tab
          label="Users"
          icon={<UserIcon />}
          aria-label="users"
          {...a11yProps(1)}
        />
        <Tab
          label="Groups"
          icon={<GroupsIcon />}
          aria-label="groups"
          {...a11yProps(2)}
        />
        {/* <Tab
          label="Policy"
          icon={<GroupsIcon />}
          aria-label="policy"
          {...a11yProps(3)}
        /> */}
      </Tabs>
      <TabPanel value={value} index={0}>
        <form className={classes.form} noValidate autoComplete="off">
          <div className={classes.margin}>
            <Grid container spacing={1} alignItems="flex-end">
              <Grid item xs={12}>
                <TextField
                  required
                  id="policy-name"
                  label="Name"
                  value={policy.policyName}
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
            </Grid>
          </div>
        </form>
        <List className={classes.root}>
          {policy.features?.map((feature) => (
            <React.Fragment>
              <ListItem button>
                <ListItemText
                  primary={feature.name}
                  secondary={<span>Allow: {feature.allow}</span>}
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
        <List className={classes.root}>
          {policy.topics?.map((topic) => (
            <React.Fragment>
              <ListItem button>
                <ListItemText
                  primary={topic.type}
                  secondary={<span>{topic.allow}</span>}
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
      <TabPanel value={value} index={1}>
        <form className={classes.form} noValidate autoComplete="off">
          <div className={classes.margin}>
            <Grid container spacing={1} alignItems="flex-end">
            </Grid>
          </div>
        </form>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <form className={classes.form} noValidate autoComplete="off">
          <div className={classes.margin}>
            <Grid container spacing={1} alignItems="flex-end">
            </Grid>
          </div>
        </form>
      </TabPanel>
    </div>
  );
};

PolicyDetail.propTypes = {
  policy: policyShape.isRequired,
};

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps)(PolicyDetail);
