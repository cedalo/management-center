import Breadcrumbs from '@mui/material/Breadcrumbs';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import HomeCard from './HomeCard';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
const PREFIX = 'Config';

const classes = {
    root: `${PREFIX}-root`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(3),
		paddingTop: theme.spacing(3)
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

function Config() {

	return (
        <Root>
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
		</Root>
    );
}

export default Config;
