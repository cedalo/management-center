import React from "react";

import Grid from "@material-ui/core/Grid";
// import SecurityIcon from '@material-ui/icons/VerifiedUser';
// import StreamsIcon from "@material-ui/icons/SettingsInputAntenna";
// import SystemIcon from '@material-ui/icons/Assessment';
import Typography from "@material-ui/core/Typography";
import Box from '@material-ui/core/Box';

import HomeCard from "./HomeCard";

function Home() {
  return (
	  <div>
	  <Grid container spacing={3}>
		<Grid item lg={4} sm={6} xl={4} xs={12}>
		  <HomeCard
			title="Security"
			description="Manage users, user groups and policies"
			image={"security.png"}
			link="/security"
		  />
		</Grid>
		<Grid item lg={4} sm={6} xl={4} xs={12}>
		  <HomeCard
			title="Streams"
			description="Manage streams"
			image={"streams.png"}
			link="/streams"
		  />
		</Grid>
		<Grid item lg={4} sm={6} xl={4} xs={12}>
		  <HomeCard
			title="System"
			description="Analyse the system status of Mosquitto"
			image={"system.png"}
			link="/system/status"
		  />
		</Grid>
	  </Grid>
	  <br />
	  <Typography variant="h4" gutterBottom fontWeight="fontWeightBold">
	  </div>
		  
  );
}

export default Home;
