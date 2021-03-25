import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import HomeCard from './HomeCard';
import NewsCard from './NewsCard';
import React from 'react';
// import SecurityIcon from '@material-ui/icons/VerifiedUser';
// import StreamsIcon from "@material-ui/icons/SettingsInputAntenna";
// import SystemIcon from '@material-ui/icons/Assessment';
import Typography from '@material-ui/core/Typography';

function Home() {
	return (
		<div>
			<Grid container spacing={3}>
				{/* <Grid item lg={4} sm={6} xl={4} xs={12}>
		  <HomeCard
			title="Streams"
			description="Manage streams"
			image={"streams.png"}
			link="/streams"
		  />
		</Grid> */}
				<Grid item lg={4} sm={4} xl={4} xs={12}>
					<HomeCard
						title="System Monitoring"
						description="Monitor and analyse the system status of Mosquitto"
						image={'system.png'}
						link="/system"
					/>
				</Grid>
				<Grid item lg={4} sm={4} xl={4} xs={12}>
					<HomeCard
						title="Dynamic Security"
						description="Manage the security using clients, groups, roles and ACLs"
						image={'security.png'}
						link="/security"
					/>
				</Grid>
			</Grid>
		</div>
	);
}

export default Home;
