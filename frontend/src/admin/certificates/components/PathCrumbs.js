import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Breadcrumbs, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const PathCrumbs = ({ path }) => {
	const last = path.pop();
	const classes = useStyles();
	return (
		<Breadcrumbs aria-label="breadcrumb">
			{path.map((crumb) => (
				<Link className={classes.breadcrumbLink} to={`/${crumb.link}`}>
					{crumb.title || crumb.link}
				</Link>
			))}
			<Typography className={classes.breadcrumbItem} color="textPrimary">
				{last.title}
			</Typography>
		</Breadcrumbs>
	);
};
export default PathCrumbs;
