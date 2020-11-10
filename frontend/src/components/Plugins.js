import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import PluginDisabledIcon from '@material-ui/icons/Cancel';
import PluginEnabledIcon from '@material-ui/icons/CheckCircle';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { red, green } from '@material-ui/core/colors';

import { Link as RouterLink } from 'react-router-dom';

import useFetch from '../helpers/useFetch';

const useStyles = makeStyles((theme) => ({
	updateButton: {
		marginLeft: '20px'
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const Plugins = (props) => {
	const classes = useStyles();
	const [response, loading, hasError] = useFetch(`http://${window.location.hostname}:8088/api/plugins`);

	if (response) {
		return (
			<div>
				<Breadcrumbs aria-label="breadcrumb">
					<RouterLink className={classes.breadcrumbLink} to="/home">
						Home
					</RouterLink>
					<Typography className={classes.breadcrumbItem} color="textPrimary">
						Plugins
					</Typography>
				</Breadcrumbs>
				<br />
					<TableContainer component={Paper} className={classes.tableContainer}>
						<Table size="medium">
							<TableHead>
								<TableRow>
									<TableCell>ID</TableCell>
									<TableCell>Version</TableCell>
									<TableCell>Name</TableCell>
									<TableCell>Description</TableCell>
									<TableCell>Feature</TableCell>
									<TableCell>Status</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{response.map((plugin) => (
									<TableRow>
										<TableCell>
											{plugin.id}
										</TableCell>
										<TableCell>
											{plugin.version}
										</TableCell>
										<TableCell>
											{plugin.name}
										</TableCell>
										<TableCell>
											{plugin.description}
										</TableCell>
										<TableCell>
											{plugin.feature}
										</TableCell>
										<TableCell>
											{
												plugin.status === 'loaded' 
												? <PluginEnabledIcon fontSize="small" style={{ color: green[500] }} /> 
												: <PluginDisabledIcon fontSize="small" style={{ color: red[500] }} />
											}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
			</div>
		);
	} else {
		return null;
	}
};

const mapStateToProps = (state) => {
	return {
		license: state.license?.license,
		version: state.version?.version
	};
};

export default connect(mapStateToProps)(Plugins);
