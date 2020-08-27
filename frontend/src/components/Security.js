import React from "react";

import Grid from "@material-ui/core/Grid";
// import SecurityIcon from '@material-ui/icons/VerifiedUser';
// import StreamsIcon from "@material-ui/icons/SettingsInputAntenna";
// import SystemIcon from '@material-ui/icons/Assessment';

import Typography from "@material-ui/core/Typography";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import {
	Link as RouterLink,
  } from "react-router-dom";

import HomeCard from "./HomeCard";

function Security() {
  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink to="/">Home</RouterLink>
        <Typography color="textPrimary">Security</Typography>
      </Breadcrumbs>
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
            image={"usergroups.png"}
            link="/security/groups"
          />
        </Grid>
        <Grid item lg={4} sm={6} xl={4} xs={12}>
          <HomeCard
            title="Policies"
            description="Manage policies"
            image={"policies.png"}
            link="/security/policies"
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default Security;
