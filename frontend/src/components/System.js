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
        <Typography color="textPrimary">System</Typography>
      </Breadcrumbs>
      <Grid container spacing={3}>
        <Grid item lg={4} sm={6} xl={4} xs={12}>
          <HomeCard
            title="Status"
            description="Analyse system status"
            image={"status.png"}
            link="/system/status"
          />
        </Grid>
        <Grid item lg={4} sm={6} xl={4} xs={12}>
          <HomeCard
            title="Topic Tree"
            description="Analyse topic tree"
            image={"topictree.png"}
            link="/system/topics"
          />
        </Grid>
        <Grid item lg={4} sm={6} xl={4} xs={12}>
          <HomeCard
            title="Settings"
            description="Manage settings"
            image={"settings.png"}
            link="/system/settings"
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default Security;
