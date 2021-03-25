import React, { useContext, useState } from 'react';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ConnectionDetailComponent from './ConnectionDetailComponent';

const useStyles = makeStyles((theme) => ({
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const ConnectionDetail = (props) => {
	const classes = useStyles();

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
		<Redirect to="/config/connections" push />
	);
};

const mapStateToProps = (state) => {
	return {
		selectedConnectionToEdit: state.brokerConnections?.selectedConnectionToEdit
	};
};

export default connect(mapStateToProps)(ConnectionDetail);
