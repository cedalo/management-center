import React from "react";

import Grid from "@material-ui/core/Grid";
// import SecurityIcon from '@material-ui/icons/VerifiedUser';
// import StreamsIcon from "@material-ui/icons/SettingsInputAntenna";
// import SystemIcon from '@material-ui/icons/Assessment';
import { makeStyles } from "@material-ui/core/styles";

import Typography from "@material-ui/core/Typography";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import { Link as RouterLink } from "react-router-dom";

import HomeCard from "./HomeCard";

const useStyles = makeStyles((theme) => ({
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink,
}));

function Security() {
  const classes = useStyles();

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink className={classes.breadcrumbLink} to="/">
          Home
        </RouterLink>
        <Typography className={classes.breadcrumbItem} color="textPrimary">Security</Typography>
      </Breadcrumbs>
      <br />
      <Grid container spacing={3}>
        <Grid item lg={4} sm={6} xl={4} xs={12}>
          <HomeCard
            title="Users"
            description="Manage users"
            image={"users.png"}
            link="/security/users"
          />
        </Grid>
        <Grid item lg={4} sm={6} xl={4} xs={12}>
          <HomeCard
            title="User Groups"
            description="Manage user groups"
            image={"groups.png"}
            link="/security/groups"
          />
        </Grid>
        <Grid item lg={4} sm={6} xl={4} xs={12}>
          <HomeCard
            title="Roles"
            description="Manage roles"
            image={"roles.png"}
            link="/security/roles"
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default Security;
