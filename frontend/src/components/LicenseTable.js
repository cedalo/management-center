import {green, red} from '@material-ui/core/colors';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import FeatureDisabledIcon from '@material-ui/icons/Cancel';
import FeatureEnabledIcon from '@material-ui/icons/CheckCircle';
import Paper from '@material-ui/core/Paper';
import PremiumVersionIcon from '@material-ui/icons/VerifiedUser';
import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import {connect} from 'react-redux';
import {makeStyles} from '@material-ui/core/styles';
import moment from 'moment';
import useFetch from '../helpers/useFetch';
import {TableHead} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import {Alert, AlertTitle} from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
	tableContainer: {
		'& td:first-child': {
			width: '15%'
		}
	},
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

const createFeatureIcon = (feature, license) =>
	license.features && license.features.includes(feature) ? (
		<FeatureEnabledIcon fontSize="small" style={{color: green[500]}}/>
	) : (
		<FeatureDisabledIcon fontSize="small" style={{color: red[500]}}/>
	);

const isPremiumLicense = (license) => license && license.edition === 'pro';

const getPremium = () => {
	return (
		<span>
			<PremiumVersionIcon fontSize="small" style={{color: '#ffc107', verticalAlign: 'middle'}}/> Premium
		</span>
	);
};

const LicenseTable = (props) => {
	const classes = useStyles();
	const {license} = props;

	return (
		<div>
			{
				!license &&
				<Alert severity="info">
					<AlertTitle>No license information available</AlertTitle>
					This broker does not provide any license information.
				</Alert>
			}
			{license && license.edition && (
				<TableContainer component={Paper} className={classes.tableContainer}>
					<Table size="medium">
						<TableBody>
							<TableRow>
								<TableCell>
									<b>License</b>
								</TableCell>
								<TableCell>
									{license.edition === 'pro' ? getPremium() : license.edition}
									{` edition issued by ${license.issuedBy} to ${license.issuedTo}`}
								</TableCell>
							</TableRow>
							{isPremiumLicense(license) && (
								<TableRow>
									<TableCell>
										<b>Valid since</b>
									</TableCell>
									<TableCell>{moment(license.validSince).format('LLLL')}</TableCell>
								</TableRow>
							)}
							{isPremiumLicense(license) && (
								<TableRow>
									<TableCell>
										<b>Valid until</b>
									</TableCell>
									<TableCell>{moment(license.validUntil).format('LLLL')}</TableCell>
								</TableRow>
							)}
							{/* <TableRow>
								<TableCell>
									<b>Max. broker connections</b>
								</TableCell>
								<TableCell>{license.maxBrokerConnections}</TableCell>
							</TableRow> */}
							{/* <TableRow>
								<TableCell>
									<b>Advanced REST API</b>
								</TableCell>
								<TableCell>{createFeatureIcon('rest-api', license)}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>
									<b>Custom Theme</b>
								</TableCell>
								<TableCell>{createFeatureIcon('white-labeling', license)}</TableCell>
							</TableRow> */}
							{/* <TableRow>
				<TableCell>
				<b>🚧 Import / Export</b>
				</TableCell>
				<TableCell>
				{
					createFeatureIcon('import-export', license)
				}
				</TableCell>
			</TableRow> */}
							{/* <TableRow>
								<TableCell>
									<b>Multiple Connections</b>
								</TableCell>
								<TableCell>{createFeatureIcon('multiple-broker-connections', license)}</TableCell>
							</TableRow> */}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			<br/>
			{/* license?.features &&
				<TableContainer component={Paper} className={classes.tableContainer}>
					<Table size="medium">
						<TableHead>
							<TableRow>
								<TableCell>
									<b>Feature</b>
								</TableCell>
								<TableCell>
									<b>Version</b>
								</TableCell>
							</TableRow>
							</TableHead>
						<TableBody>
							{license?.features.map(feature => (
							<TableRow>
								<TableCell>
									{feature.name}
								</TableCell>
								<TableCell>
									{feature.version}
								</TableCell>
							</TableRow>
						))}
						</TableBody>
					</Table>
				</TableContainer>
			*/}
		</div>
	);
};

const mapStateToProps = (state) => {
	return {};
};

export default connect(mapStateToProps)(LicenseTable);
