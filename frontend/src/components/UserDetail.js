import { connect } from "react-redux";
import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import CredentialsIcon from "@material-ui/icons/Lock";
import GroupsIcon from "@material-ui/icons/Group";
import UserIcon from "@material-ui/icons/Person";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import AccountCircle from "@material-ui/icons/AccountCircle";
import InputAdornment from '@material-ui/core/InputAdornment';
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
        <Box p={3}>
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
}));

const UserDetail = (props) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const { user } = props;

  return (
    <div className={classes.root}>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/security">Security</RouterLink>
        <Typography color="textPrimary">Users</Typography>
      </Breadcrumbs>
      <br />
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="off"
        aria-label="User"
      >
        <Tab
          label="Details"
          icon={<UserIcon />}
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
                id="client-id"
                label="Client ID"
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
                required
                id="username"
                label="Username"
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
                required
                id="firstname"
                label="First name"
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
                required
                id="lastname"
                label="Last name"
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
          </Grid>
		  </div>
        </form>
      </TabPanel>
      <TabPanel value={value} index={1}>
        Credentials
      </TabPanel>
      <TabPanel value={value} index={2}>
        Groups
      </TabPanel>
    </div>
  );
};

UserDetail.propTypes = {
  user: userShape.isRequired,
};

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps)(UserDetail);
