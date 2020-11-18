import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Grid from '@material-ui/core/Grid';
import HomeCard from './HomeCard';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
// import SecurityIcon from '@material-ui/icons/VerifiedUser';
// import StreamsIcon from "@material-ui/icons/SettingsInputAntenna";
// import SystemIcon from '@material-ui/icons/Assessment';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

function Security() {
	const classes = useStyles();

	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/">
					Home
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Security
				</Typography>
			</Breadcrumbs>
			<br />
			<Grid container spacing={3}>
				<Grid item lg={4} sm={4} xl={4} xs={12}>
					<HomeCard
						title="Clients"
						description="Manage clients"
						image={'clients.png'}
						link="/security/clients"
					/>
				</Grid>
				<Grid item lg={4} sm={4} xl={4} xs={12}>
					<HomeCard title="Groups" description="Manage groups" image={'groups.png'} link="/security/groups" />
				</Grid>
				<Grid item lg={4} sm={4} xl={4} xs={12}>
					<HomeCard title="Roles" description="Manage roles" image={'roles.png'} link="/security/roles" />
				</Grid>
			</Grid>
		</div>
	);
}

export default Security;
