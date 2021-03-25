import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Grid from '@material-ui/core/Grid';
import HomeCard from './HomeCard';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';

// import SecurityIcon from '@material-ui/icons/VerifiedUser';
// import StreamsIcon from "@material-ui/icons/SettingsInputAntenna";
// import SystemIcon from '@material-ui/icons/Assessment';



const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(3),
		paddingTop: theme.spacing(3)
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

function Config() {
	const classes = useStyles();
	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Config
				</Typography>
			</Breadcrumbs>
			<br />
			<Grid container spacing={3}>
				<Grid item lg={4} sm={4} xl={4} xs={12}>
					<HomeCard
						title="Connections"
						description="Manage connections"
						image={'settings.png'}
						link="/config/connections"
					/>
				</Grid>
				<Grid item lg={4} sm={4} xl={4} xs={12}>
					<HomeCard
						title="Settings"
						description="Manage settings"
						image={"settings.png"}
						link="/config/settings"
					/>
				</Grid>
			</Grid>
		</div>
	);
}

export default Config;
