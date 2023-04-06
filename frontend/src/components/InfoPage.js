import Button from '@material-ui/core/Button';
import {green, red} from '@material-ui/core/colors';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import {makeStyles} from '@material-ui/core/styles';
import AppsIcon from '@material-ui/icons/Apps';
import FeatureDisabledIcon from '@material-ui/icons/Cancel';
import FeatureEnabledIcon from '@material-ui/icons/CheckCircle';
import InfoIcon from '@material-ui/icons/Info';
import PremiumVersionIcon from '@material-ui/icons/VerifiedUser';
import LicenseIcon from '@material-ui/icons/VerifiedUser';
import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';
import useFetch from '../helpers/useFetch';
import ContainerBox from './ContainerBox';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
import Info from './Info';

const useStyles = makeStyles((theme) => ({
	updateButton: {
		marginLeft: '20px'
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
	container: {
		paddingLeft: '0px',
		paddingRight: '0px'
	}
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

const InfoPage = (props) => {
	const classes = useStyles();
	const [open, setOpen] = React.useState(false);
	const [response, loading, hasError] = useFetch(`${process.env.PUBLIC_URL}/api/update`);
	const {license, version, webSocketConnections} = props;
	const [responsePlugIns, loadingPlugIns, hasErrorPlugIns] = useFetch(`${process.env.PUBLIC_URL}/api/plugins`);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	if (response) {
		return [
			<ContentContainer
				breadCrumbs={<ContainerBreadCrumbs title="Info" links={[{name: 'Home', route: '/home'}]}/>}
				overFlowX="hidden"
			>
				<ContainerHeader
					title="Management Center License Information"
					subTitle="Displays information about the currently active Management Center license and the features contained within."
				>
					{moment.unix(response?.lastUpdated).isAfter(moment(version?.buildDate)) ? (
						<Button
							className={classes.updateButton}
							size="small"
							variant="contained"
							color="secondary"
							onClick={handleClickOpen}
						>
							Update available
						</Button>
					) : null}
				</ContainerHeader>
				<Container classes={{root: classes.container}} maxWidth={false}>
					<Grid
						container
						classes={{root: classes.container}}
						spacing={3}
					>
						{version ?
							<Grid item lg={6} xs={12}>
								<Info
									label="Management Center"
									alignment="table"
									infos={[{
										label: "Version",
										value: version.version,
										space: true
									}, {
										label: "Latest Version",
										hide: !response || response?.lastUpdated === undefined,
										value: response.lastUpdated ? moment.unix(response.lastUpdated).format(
											'LLLL') : ''
									}, {
										label: "Build Number",
										value: version.buildNumber,
										space: true
									}, {
										label: "Build Date",
										value: moment(version.buildDate).format('LLLL'),
									}
									]}
									icon={<InfoIcon/>}
								/>
							</Grid> : null}
						{license ?
							<Grid item lg={6} xs={12}>
								<Info
									label="License"
									alignment="table"
									infos={[{
										label: "Edition",
										value: license.edition === 'pro' ? getPremium() : license.edition
									}, {
										label: "Issued by",
										value: license.issuedBy,
										space: true
									}, {
										label: "Issued to",
										value: license.issuedTo,
										hide: !isPremiumLicense(license)
									}, {
										label: "Valid since",
										value: moment(license.validSince).format('LLLL'),
										space: true,
										hide: !isPremiumLicense(license)
									}, {
										label: "Valid until",
										value: moment(license.validUntil).format('LLLL'),
										hide: !isPremiumLicense(license)
									}, {
										label: "Maximum Broker Connections",
										value: license.maxBrokerConnections,
										space: true
									}, {
										label: "Comment",
										value: license.comment,
										space: true
									}
									]}
									icon={<LicenseIcon/>}
								/>
							</Grid> : null}
						{license?.features && responsePlugIns ?
							<Grid item lg={12} xs={12}>
								<Info
									label="Management Center Features"
									alignment="table"
									infos={license?.features.reduce((result, feature) => {
										const plugIn = responsePlugIns.find(plug => (feature.name === plug.featureId));
										if (plugIn) {
											result.push({
												label: `${plugIn.name}`,
												value: plugIn.description
											});
										}
										return result;
									}, [])}
									icon={<AppsIcon/>}
								/>
							</Grid> : null}
					</Grid>
				</Container>
			</ContentContainer>,
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">{'An update is available!'}</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						<ul>
							{response?.features?.map((feature) => {
								return <li>{feature.title}</li>;
							})}
						</ul>
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="secondary" autoFocus>
						Cancel
					</Button>
					<Button
						target="_href"
						size="small"
						variant="contained"
						color="secondary"
						href={response.updateURL}
					>
						Download now
					</Button>
				</DialogActions>
			</Dialog>
		];
	} else {
		return null;
	}
};

const mapStateToProps = (state) => {
	return {
		license: state.license?.license,
		version: state.version?.version,
		webSocketConnections: state.webSocketConnections?.webSocketConnections,
	};
};

export default connect(mapStateToProps)(InfoPage);
