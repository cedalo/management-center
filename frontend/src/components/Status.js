import {colors, IconButton, makeStyles, Tooltip} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import InspectClientsIcon from '@material-ui/icons/RecordVoiceOver';
import DataSentIcon from '@material-ui/icons/RssFeed';
import InfoIcon from '@material-ui/icons/Info';
import MessageIcon from '@material-ui/icons/Email';
import BrokerIcon from '@material-ui/icons/LeakAdd';
import ClientIcon from '@material-ui/icons/Person';
import RestartIcon from '@material-ui/icons/Replay';
import LicenseIcon from '@material-ui/icons/VerifiedUser';
import {Alert, AlertTitle} from '@material-ui/lab';
import {useConfirm} from 'material-ui-confirm';
import moment from 'moment';
import {useSnackbar} from 'notistack';
import React, {useContext, useEffect} from 'react';
import Speedometer from 'react-d3-speedometer'
import {connect} from 'react-redux';
import Delayed from '../utils/Delayed';
import {WebSocketContext} from '../websockets/WebSocket';
import ConnectedWarning from './ConnectedWarning';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import Info from './Info';
import {useTheme} from '@material-ui/core/styles';
import {Link as RouterLink, useHistory} from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(3),
		paddingTop: theme.spacing(3)
	},
	container: {
		paddingLeft: '0px',
		paddingRight: '0px'
	},
	info: {
		marginTop: '9px',
		marginRight: '5px'
	},

}));

const Status = ({
					brokerLicense,
					brokerLicenseLoading,
					lastUpdated,
					systemStatus,
					defaultClient,
					currentConnection,
					currentConnectionName,
					connected
				}) => {
	const classes = useStyles();
	const theme = useTheme();
	const confirm = useConfirm();
	const history = useHistory();
	const {enqueueSnackbar} = useSnackbar();
	const context = useContext(WebSocketContext);
	const {client: brokerClient} = context;
	const totalMessages = parseInt(systemStatus?.$SYS?.broker?.messages?.sent);
	const publishMessages = (parseInt(systemStatus?.$SYS?.broker?.publish?.messages?.sent) / totalMessages) * 100;
	const otherMessages =
		((totalMessages - parseInt(systemStatus?.$SYS?.broker?.publish?.messages?.sent)) / totalMessages) * 100;
	const timerRef = React.useRef();
	const [waitingForSysTopic, setWaitingForSysTopic] = React.useState(true);
	const [maxClients, setMaxClients] = React.useState();

	const getMaxClients = () => {
		const feature = brokerLicense?.features?.find(feature => 'mosquitto-clients' === feature.name);
		return feature ? feature.count : undefined;
	}

	useEffect(() => {
		setMaxClients(getMaxClients());
	}, [brokerLicense]);

	const cleanRef = () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	};

	useEffect(() => {
		// timerRef.current = window.setTimeout(() => {
		// 	setWaitingForSysTopic(false);
		// }, 16000);

		return () => {
			cleanRef();
		}
	}, []);


	if (connected && !systemStatus?.$SYS) {
		if (!timerRef.current) {
			timerRef.current = window.setTimeout(() => {
				setWaitingForSysTopic(false);
			}, 16000);
		}
	}

	const onRestart = async (brokerConnectionName, serviceName) => {
		await confirm({
			title: 'Confirm restart',
			description: `Note that when the broker is restarted, every connected client will be disconnected (including the Management Center) and it is up to the client to reconnect.`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		try {
			const result = await brokerClient.restartBroker(brokerConnectionName, serviceName);
			enqueueSnackbar(`Broker "${brokerConnectionName}" successfully restarted.`, {
				variant: 'success'
			});
		} catch (error) {
			enqueueSnackbar(`Error restarting broker "${brokerConnectionName}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
	}

	const data = {
		datasets: [
			{
				data: [publishMessages, otherMessages],
				backgroundColor: [colors.indigo[500], colors.red[600], colors.orange[600]],
				borderWidth: 8,
				borderColor: colors.common.white,
				hoverBorderColor: colors.common.white
			}
		],
		labels: ['PUBLISH', 'Other']
	};

	const dataDescriptions = [
		{
			title: 'PUBLISH',
			value: Math.round(publishMessages),
			icon: MessageIcon,
			color: colors.indigo[500]
		},
		{
			title: 'Other',
			value: Math.round(otherMessages),
			icon: MessageIcon,
			color: colors.red[600]
		}
	];

	const secondsToDhms = (seconds) => {
		seconds = parseInt(seconds);
		const d = Math.floor(seconds / (3600 * 24));
		const h = Math.floor(seconds % (3600 * 24) / 3600);
		const m = Math.floor(seconds % 3600 / 60);
		const s = Math.floor(seconds % 60);

		const dDisplay = d > 0 ? d + "d " : "";
		const hDisplay = h > 0 ? h + "h " : "";
		const mDisplay = m > 0 ? m + "m " : "";
		const sDisplay = s > 0 ? s + "s" : "";
		return dDisplay + hDisplay + mDisplay + sDisplay;
	}

	const toNumber = (number) => new Intl.NumberFormat().format(number);
	const formatBytes = (bytes, decimals = 2) => {
		if (!+bytes) return '0 Bytes'

		const k = 1024
		const dm = decimals < 0 ? 0 : decimals
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
	}

	return (
		<div style={{height: '100%'}}>
			<ContainerBreadCrumbs title="Home"/>
			<div style={{height: 'calc(100% - 26px)'}}>
				<div>
					<ContainerHeader
						title={`Status: ${currentConnectionName}`}
						subTitle="Display the status and license info of the currenty selected broker. Hover over the info icon to get more information about the meaning of the values"
						connectedWarning={!connected}
					>
						{systemStatus?.$SYS && connected && currentConnection?.supportsRestart === true &&
							<Button
								variant="outlined"
								color="primary"
								size="small"
								onClick={(event) => {
									event.stopPropagation();
									onRestart(currentConnectionName, currentConnection?.serviceName);
								}}
								startIcon={<RestartIcon/>}
							>
								Restart
							</Button>
						}
					</ContainerHeader>
					{systemStatus?.$SYS && connected ?
						<Container classes={{root: classes.container}} maxWidth={false}>
							<Grid
								container
								classes={{root: classes.container}}
								spacing={3}
							>
								<Grid container item lg={4} xl={4} sm={6} xs={12}>
									<Grid item xs={12}>
										<Info
											label="Broker Traffic"
											infoIcon
											infos={[{
												label: "Messages Sent",
												value: toNumber(systemStatus?.$SYS?.broker?.messages?.sent)
											}, {
												label: "Messages Received",
												value: toNumber(systemStatus?.$SYS?.broker?.messages?.received)
											}, {
												label: "Messages Stored",
												value: toNumber(systemStatus?.$SYS?.broker?.messages?.stored)
											}, {
												label: "Messages Retained",
												value: toNumber(
													systemStatus?.$SYS?.broker?.['retained messages']?.count)
											}, {
												label: "Bytes Sent",
												value: formatBytes(systemStatus?.$SYS?.broker?.bytes?.sent),
												space: true
											}, {
												label: "Bytes Received",
												value: formatBytes(systemStatus?.$SYS?.broker?.bytes?.received)
											}
											]}
											icon={<BrokerIcon/>}
										/>
									</Grid>
									<Grid item xs={12} style={{paddingTop: '24px'}}>
										<Info
											label="Publish"
											infoIcon
											infos={[{
												label: "Messages Sent",
												value: toNumber(systemStatus?.$SYS?.broker?.publish?.messages?.sent)
											}, {
												label: "Messages Received",
												value: toNumber(systemStatus?.$SYS?.broker?.publish?.messages?.received)
											}, {
												label: "Bytes Sent",
												value: formatBytes(systemStatus?.$SYS?.broker?.publish?.bytes?.sent),
												space: true
											}, {
												label: "Bytes Received",
												value: formatBytes(systemStatus?.$SYS?.broker?.publish?.bytes?.received)
											}]}
											icon={<DataSentIcon/>}
										/>
									</Grid>
								</Grid>
								<Grid container item lg={4} xl={4} sm={6} xs={12}>
									<Grid item xs={12}>
										<Info
											// style={{cursor: 'pointer'}}
											label="Clients"
											infoIcon
											actionIcon={
												<Tooltip title="Click to inspect clients">
													<IconButton
														className={classes.info} size="small"
														aria-label="info">
														<InspectClientsIcon
															onClick={(event) => {
																event.stopPropagation();
																history.push(`/clientinspection/`);
															}}
															fontSize="small"
														/>
													</IconButton>
												</Tooltip>
											}
											infos={[{
												label: "Total",
												value: toNumber(systemStatus?.$SYS?.broker?.clients?.total)
											}, {
												label: "Connected",
												value: toNumber(systemStatus?.$SYS?.broker?.clients?.connected)
											}/*, {
												label: "Disconnected",
												value: systemStatus?.$SYS?.broker?.clients?.disconnected === undefined ? '' : toNumber(systemStatus?.$SYS?.broker?.clients?.disconnected)
											}*/, {
												label: "Subscriptions",
												value: toNumber(systemStatus?.$SYS?.broker?.subscriptions?.count),
												space: true
											}]}
											icon={<ClientIcon/>}
										/>
									</Grid>
									<Grid item xs={12} style={{paddingTop: '24px'}}>
										<Info
											label={brokerLicense && brokerLicense.edition ? "Client Usage" : "Client Usage not available"}
											infos={[]}
											chart={
												<div style={{margin: 'auto'}}>
													<Speedometer
														maxValue={maxClients || 1}
														forceRender={true}
														value={systemStatus?.$SYS?.broker?.clients?.connected}
														startColor={maxClients ? "#44FF44" : "#AAAAAA"}
														endColor={maxClients ? "#FF4444" : "#AAAAAA"}
														height={300}
														textColor={theme.palette.text.secondary}
														valueTextFontWeight="normal"
														valueTextFontSize="11pt"
														labelFontSize="9pt"
														width={300}
														ringWidth={30}
														segments={50}
														needleColor="#FD602E"
														maxSegmentLabels={maxClients === 1 || !maxClients ? 1 : 5}
													/>
												</div>
											}
											icon={<ClientIcon/>}
										/>
									</Grid>
								</Grid>
								<Grid container item lg={4} xl={4} sm={6} xs={12}>
									<Grid item xs={12}>
										{brokerLicenseLoading ?
											<Alert severity="info">
												<AlertTitle>Loading license information</AlertTitle>
												<CircularProgress color="secondary"/>
											</Alert> :
											<Info
												label={brokerLicense.edition ? "License" : "License info not available"}
												infos={[{
													label: "Edition",
													value: brokerLicense.edition === 'pro' ? 'Premium' : brokerLicense.edition
												}, {
													space: true,
													label: "Maximum Clients",
													value: maxClients
												}, {
													space: true,
													label: "Issued by",
													value: brokerLicense.issuedBy
												}, {
													label: "Issued to",
													value: brokerLicense.issuedTo
												}, {
													space: true,
													label: "Valid since",
													value: brokerLicense.validSince ?
														moment(brokerLicense.validSince).format('LLLL') :
														''
												}, {
													label: "Valid until",
													value: brokerLicense.validUntil ?
														moment(brokerLicense.validUntil).format('LLLL') :
														''
												}]}
												icon={<LicenseIcon/>}
											/>}
									</Grid>
									<Grid item xs={12} style={{paddingTop: '24px'}}>
										<Info
											label="Broker Info"
											infos={[{
												label: "Uptime",
												value: secondsToDhms(systemStatus?.$SYS?.broker?.uptime),
											}, {
												label: "Version",
												value: systemStatus?.$SYS?.broker?.version,
											}, {
												label: "URL",
												value: currentConnection?.externalEncryptedUrl || currentConnection?.externalUnencryptedUrl || currentConnection?.internalUrl || currentConnection?.url,
											}]}
											icon={<InfoIcon/>}
										/>
									</Grid>
								</Grid>
							</Grid>
						</Container> :
						(connected ? (
							(waitingForSysTopic ?
								<Alert severity="info">
									<AlertTitle>Loading system status information</AlertTitle>
									<CircularProgress color="secondary" size="1.5rem"/>
								</Alert> :
								<Alert severity="warning">
									<AlertTitle>System status information could not be fetched</AlertTitle>
									We couldn't retrieve the system status information in the given time window.
									Please make sure that the user "{defaultClient?.username}" has the rights to
									read
									the
									"$SYS" topic on the selected broker.
									In rare cases, you may wait a bit longer until system information is finally
									sent
								</Alert>)
						) : <></>)
					}
					{systemStatus?.$SYS && <div style={{
						fontSize: '0.9em',
						position: 'absolute',
						right: '15px',
						top: '70px'
					}}>
						Dashboard last updated at: {moment(lastUpdated).format('hh:mm:ss a')}
					</div>}
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		brokerLicense: state.brokerLicense.license,
		brokerLicenseLoading: state.brokerLicense.isLoading,
		lastUpdated: state.systemStatus.lastUpdated,
		systemStatus: state.systemStatus.systemStatus,
		defaultClient: state.brokerConnections?.defaultClient,
		currentConnection: state.brokerConnections?.currentConnection,
		currentConnectionName: state.brokerConnections?.currentConnectionName,
		connected: state.brokerConnections?.connected,
	};
};

export default connect(mapStateToProps)(Status);
