import {Box, IconButton, makeStyles, Tooltip} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import InspectClientsIcon from '@material-ui/icons/RecordVoiceOver';
import DataSentIcon from '@material-ui/icons/RssFeed';
import InfoIcon from '@material-ui/icons/Info';
import BrokerIcon from '@material-ui/icons/LeakAdd';
import ClientIcon from '@material-ui/icons/Person';
import RestartIcon from '@material-ui/icons/Replay';
import LicenseIcon from '@material-ui/icons/VerifiedUser';
import {Alert, AlertTitle} from '@material-ui/lab';
import {useConfirm} from 'material-ui-confirm';
import moment from 'moment';
import {useSnackbar} from 'notistack';
import React, {useContext, useEffect, useRef} from 'react';
import Speedometer from 'react-d3-speedometer';
import {connect} from 'react-redux';
import {getHelpBasePath} from '../utils/utils';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBox from './ContainerBox';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
import Info from './Info';
import {useTheme} from '@material-ui/core/styles';
import {useHistory} from 'react-router-dom';

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

// Browser URL class does not work with mqtt protocol
const parseUrl = (url) => {
	if (!url) {
		return undefined;
	}

	const m = url.match(
			/^((?:([^:\/?#]+:)(?:\/\/))?((?:([^\/?#:]*)(?::([^\/?#:]*))?@)?([^\/?#:]*)(?::([^\/?#:]*))?))?([^?#]*)(\?[^#]*)?(#.*)?$/),
		r = {
			hash: m[10] || "",                   // #asd
			host: m[3] || "",                    // localhost:257
			hostname: m[6] || "",                // localhost
			href: m[0] || "",                    // http://username:password@localhost:257/deploy/?asd=asd#asd
			origin: m[1] || "",                  // http://username:password@localhost:257
			pathname: m[8] || (m[1] ? "/" : ""), // /deploy/
			port: m[7] || "",                    // 257
			protocol: m[2] || "",                // http:
			search: m[9] || "",                  // ?asd=asd
			username: m[4] || "",                // username
			password: m[5] || ""                 // password
		};
	if (r.protocol.length === 2) {
		r.protocol = "file:///" + r.protocol.toUpperCase();
		r.origin = r.protocol + "//" + r.host;
	}
	r.href = r.origin + r.pathname + r.search + r.hash;
	return r;
};
const fetchListeners = async (client, connId) => {
	try {
		const {data} = await client.getListeners(connId);
		return {id: connId, listeners: data};
	} catch (error) {
		return {id: connId, listeners: [], error: error.message || error};
	}
};

const Status = ({
					brokerLicense,
					brokerLicenseLoading,
					lastUpdated,
					systemStatus,
					defaultClient,
					currentConnection,
					currentConnectionName,
					connected,
					backendParameters
				}) => {
	const classes = useStyles();
	const theme = useTheme();
	const confirm = useConfirm();
	const history = useHistory();
	const {enqueueSnackbar} = useSnackbar();
	const context = useContext(WebSocketContext);
	const {client: brokerClient} = context;
	const timerRef = React.useRef();
	const [waitingForSysTopic, setWaitingForSysTopic] = React.useState(true);
	const [maxClients, setMaxClients] = React.useState();
	const [listeners, setListeners] = React.useState();
	const connectionRef = useRef(currentConnection);

	const getMaxClients = () => {
		const feature = brokerLicense?.features?.find(feature => 'mosquitto-clients' === feature.name);
		return feature ? feature.count : undefined;
	}

	const applyListeners = (lis, error) => {
		setListeners(error ? undefined : lis);
	}

	const loadListeners = async () => {
		setListeners();
		if (connected) {
			const {id, error, listeners} = await fetchListeners(brokerClient, currentConnection.id);
			// check response against current selected connection and ignore if they do not match
			if (connectionRef.current?.id === id) applyListeners(listeners, error);
		}
	};

	useEffect(() => {
		connectionRef.current = currentConnection;
		loadListeners();
	}, [currentConnection]);

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
			description: `Note that when the broker is restarted, every connected client will be disconnected (including the Management Center) and it is up to the client to reconnect.`
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

	const toNumber = (number) => number === undefined || Number.isNaN(number) ? 'N/A' : new Intl.NumberFormat().format(
		number);
	const formatBytes = (bytes, decimals = 2) => {
		if (Number.isNaN(bytes)) {
			return 'N/A'
		}

		if (!+bytes) return '0 Bytes'

		const k = 1024
		const dm = decimals < 0 ? 0 : decimals
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
	}

	const getBrokerInfos = () => {
		const host = !backendParameters.urlMappings.CEDALO_MC_BROKER_CONNECTION_HOST_MAPPING ?
			undefined : backendParameters.urlMappings.CEDALO_MC_BROKER_CONNECTION_HOST_MAPPING;
		const mqtt = !backendParameters.urlMappings.CEDALO_MC_BROKER_CONNECTION_MQTT_EXISTS_MAPPING ?
			false : backendParameters.urlMappings.CEDALO_MC_BROKER_CONNECTION_MQTT_EXISTS_MAPPING === 'mosquitto:true';
		const mqtts = !backendParameters.urlMappings.CEDALO_MC_BROKER_CONNECTION_MQTTS_EXISTS_MAPPING ?
			false : backendParameters.urlMappings.CEDALO_MC_BROKER_CONNECTION_MQTTS_EXISTS_MAPPING === 'mosquitto:true';
		const ws = !backendParameters.urlMappings.CEDALO_MC_BROKER_CONNECTION_WS_EXISTS_MAPPING ?
			false : backendParameters.urlMappings.CEDALO_MC_BROKER_CONNECTION_WS_EXISTS_MAPPING === 'mosquitto:true';
		// const connInfo = parseUrl('mqtt://mosquitto:1883');
		const connInfo = parseUrl(currentConnection.url); //  === "mosquitto";
		const ver1 = connInfo && connInfo.hostname === 'mosquitto';

		const infos = [{
			label: "Uptime",
			value: secondsToDhms(systemStatus?.$SYS?.broker?.uptime),
		}, {
			label: "Version",
			value: systemStatus?.$SYS?.broker?.version || 'N/A',
		}];

		if (ver1) {
			// remove mosquitto: prefix from host
			const hostInfo = host ? parseUrl(host.substring(10)) : connInfo;
			const wsListener = listeners && listeners.find(listener => listener.port === 8090);
			const requireCerts = wsListener && wsListener.requireCertificate;
			infos.push({
				label: "MQTT Connection",
				value: mqtt && hostInfo ? `mqtt://${hostInfo.hostname}:1883` : 'N/A'
			});
			infos.push({
				label: "MQTT Connection (TLS)",
				value: mqtts && hostInfo ? `mqtts://${hostInfo.hostname}:8883` : 'N/A'
			});
			if (requireCerts) {
				infos.push({
					label: "Websocket Connection (TLS)",
					value: ws && hostInfo ? `wss://${hostInfo.hostname}:8090` : 'N/A',
				});
			} else {
				infos.push({
					label: "Websocket Connection (TLS)",
					value: ws && hostInfo ? `wss://${hostInfo.hostname}:443/mqtt` : 'N/A'
				});
			}
		} else {
			infos.push({
				label: "URL",
				value: currentConnection?.externalEncryptedUrl || currentConnection?.externalUnencryptedUrl || currentConnection?.internalUrl || currentConnection?.url
			});
		}
		return infos;
	};

	const basePath = getHelpBasePath();

	return (
		<ContentContainer
			dataTour="page-status"
			breadCrumbs={<ContainerBreadCrumbs title="Home"/>}
			overFlowX="hidden"
		>
			<ContainerHeader
				title={`Broker: ${currentConnectionName}`}
				subTitle="Display the status and license info of the selected broker. Hover over the info icon to get more information about each metric"
				connectedWarning={!connected}
			>
				{systemStatus?.$SYS && <div style={{
					fontSize: '0.9em',
					position: 'absolute',
					right: '15px',
					top: '70px'
				}}>
					Dashboard last updated at: {moment(lastUpdated).format('hh:mm:ss a')}
				</div>}
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
						<Grid container item lg={4} xl={4} sm={6} xs={12} >
							<Grid item xs={12}>
								<Info
									label="Broker Traffic"
									infoIcon
									infoId={"broker-traffic-info-icon"}
									infoTooltip={<>The information displayed here is gathered from Mosquitto
										system topics. <br/>Click here to get a detailed explanation.</>}
									infoLink={`${basePath}mosquitto/management-center/overview/inspection/mc-system#broker-traffic`}
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
									infoId={"publish-info-icon"}
									infoTooltip={<>The information displayed here is gathered from Mosquitto
										system topics. <br/>Click here to get a detailed explanation.</>}
									infoLink={`${basePath}mosquitto/management-center/overview/inspection/mc-system#publish`}
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
									infoId="clients-info-icon"
									infoTooltip={<>The information displayed here is gathered from Mosquitto
										system topics. <br/>Click here to get a detailed explanation.</>}
									infoLink={`${basePath}mosquitto/management-center/overview/inspection/mc-system#clients`}
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
									infoIcon
									infoId={"cliens-usage-info-icon"}
									infoTooltip={<>The information displayed here is gathered from Mosquitto
										system topics and your license. <br/>Click here to get a detailed
										explanation.</>}
									infoLink={`${basePath}mosquitto/management-center/overview/inspection/mc-system#client-usage`}
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
										infoIcon
										infoId={"license-info-icon"}
										infoTooltip={<>The information displayed here is gathered from your
											license. <br/>Click here to get a detailed explanation.</>}
										infoLink={`${basePath}mosquitto/management-center/overview/inspection/mc-system#license`}
										infos={[{
											label: "Edition",
											value: brokerLicense.edition === 'pro' ? 'Premium' : (brokerLicense.edition || 'N/A')
										}, {
											space: true,
											label: "Maximum Clients",
											value: maxClients || 'N/A'
										}, {
											space: true,
											label: "Issued by",
											value: brokerLicense.issuedBy || 'N/A'
										}, {
											label: "Issued to",
											value: brokerLicense.issuedTo || 'N/A'
										}, {
											space: true,
											label: "Valid since",
											value: brokerLicense.validSince ?
												moment(brokerLicense.validSince).format('LLLL') :
												'N/A'
										}, {
											label: "Valid until",
											value: brokerLicense.validUntil ?
												moment(brokerLicense.validUntil).format('LLLL') :
												'N/A'
										}]}
										icon={<LicenseIcon/>}
									/>}
							</Grid>
							<Grid item xs={12} style={{paddingTop: '24px'}}>
								<Info
									label="Broker Info"
									infoIcon
									infoId={"broker-info-info-icon"}
									infoTooltip={<>The information displayed here is gathered from Mosquitto
										system topics and your configuration<br/>Click here to get a detailed
										explanation.</>}
									infoLink={`${basePath}mosquitto/management-center/overview/inspection/mc-system#broker-info`}
									infos={getBrokerInfos()}
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
		</ContentContainer>
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
		backendParameters: state.backendParameters?.backendParameters,
	};
};

export default connect(mapStateToProps)(Status);
