import Breadcrumbs from '@mui/material/Breadcrumbs';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import HomeCard from './HomeCard';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
const PREFIX = 'Security';

const classes = {
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

function Security() {


	return (
        <Root>
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
		</Root>
    );
}

export default Security;
