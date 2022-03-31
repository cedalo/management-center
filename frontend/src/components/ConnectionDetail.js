import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import ConnectionDetailComponent from './ConnectionDetailComponent';

const PREFIX = 'ConnectionDetail';

const classes = {
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const StyledRedirect = styled(Redirect)((
    {
        theme
    }
) => ({
    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

const ConnectionDetail = (props) => {


	const { selectedConnectionToEdit: connection } = props;

	return connection ? (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/config">
					Config
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/config/connections">
					Connections
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					{connection.id}
				</Typography>
			</Breadcrumbs>
			<br />
			<ConnectionDetailComponent />
		</div>
	) : (
		<StyledRedirect to="/config/connections" push />
	);
};

const mapStateToProps = (state) => {
	return {
		selectedConnectionToEdit: state.brokerConnections?.selectedConnectionToEdit
	};
};

export default connect(mapStateToProps)(ConnectionDetail);
