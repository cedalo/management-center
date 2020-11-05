import React from 'react';

import Grid from '@material-ui/core/Grid';
// import SecurityIcon from '@material-ui/icons/VerifiedUser';
// import StreamsIcon from "@material-ui/icons/SettingsInputAntenna";
// import SystemIcon from '@material-ui/icons/Assessment';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import HomeCard from './HomeCard';
import NewsCard from './NewsCard';

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
				<Grid item lg={6} sm={6} xl={6} xs={12}>
					<HomeCard
						title="System Monitoring"
						description="Monitor and analyse the system status of Mosquitto"
						image={'system.png'}
						link="/system"
					/>
				</Grid>
				<Grid item lg={6} sm={6} xl={6} xs={12}>
					<HomeCard
						title="Dynamic Security"
						description="Manage the security using clients, groups, roles and ACLs"
						image={'security.png'}
						link="/security"
					/>
				</Grid>
			</Grid>
			{/* <br />
	  <Typography variant="h4" gutterBottom fontWeight="fontWeightBold">
	  <Box fontWeight="fontWeightBold" m={1}>
        Latest news
      </Box>
      </Typography>
	  <Grid container spacing={3}>
		<Grid item lg={4} sm={6} xl={4} xs={12}>
		  <NewsCard
			title="2.0 Release out now!"
			description="Streamsheets 2.0 comes with many new features, functions, charts, and several enhancements."
			image={"https://cedalo.com/assets/images/newsposts/new20_release.jpg"}
			link="https://cedalo.com/newsposts/2020/08/21/Announcement-2-0.html"
		  />
		</Grid>
		<Grid item lg={4} sm={6} xl={4} xs={12}>
		  <NewsCard
			title="Freiburg University Hospital"
			description="Cedalo provides advanced Stream Processing technologies for event and data transparency in real time."
			image={"https://cedalo.com/assets/images/newsposts/uniklink_freiburg.jpg"}
			link="https://cedalo.com/newsposts/2020/08/10/Freiburg-University-Hospital.html"
		  />
		</Grid>
		<Grid item lg={4} sm={6} xl={4} xs={12}>
		  <NewsCard
			title="Open Industry Virtual Fair"
			description="The Open Industry 4.0 Alliance hosted a Virtual fair 2020 on July 16th & 17th. You can still visit the fair online."
			image={"https://cedalo.com/assets/images/newsposts/openindustryfair.jpg"}
			link="https://cedalo.com/newsposts/2020/08/01/Open-Industry-4-Virtual-Fair.html"
		  />
		</Grid>
	  </Grid> */}
		</div>
	);
}

export default Home;
