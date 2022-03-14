import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Chart from './Chart';
import ClientIcon from '@material-ui/icons/RecordVoiceOver';
import Container from '@material-ui/core/Container';
import DataReceivedIcon from '@material-ui/icons/CallReceived';
import DataSentIcon from '@material-ui/icons/CallMade';
import Grid from '@material-ui/core/Grid';
import Info from './Info';
import MessageIcon from '@material-ui/icons/Email';
import moment from 'moment';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import SubscriptionIcon from '@material-ui/icons/PhonelinkRing';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { colors } from '@material-ui/core';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.background.dark,
		minHeight: '100%',
		paddingBottom: theme.spacing(3),
		paddingTop: theme.spacing(3)
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const Status = ({ lastUpdated, systemStatus, defaultClient, currentConnection, currentConnectionName }) => {
	const classes = useStyles();

	const totalMessages = parseInt(systemStatus?.$SYS?.broker?.messages?.sent);
	const publishMessages = (parseInt(systemStatus?.$SYS?.broker?.publish?.messages?.sent) / totalMessages) * 100;
	const otherMessages =
		((totalMessages - parseInt(systemStatus?.$SYS?.broker?.publish?.messages?.sent)) / totalMessages) * 100;

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

	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/system">
					System
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Status
				</Typography>
			</Breadcrumbs>
			<br />
			{systemStatus?.$SYS ? <Container maxWidth={false}>
				<Grid container spacing={3}>
					<Grid item xs={12}>
						<Typography variant="h5" component="div" gutterBottom>
							{currentConnectionName}
						</Typography>
					</Grid>
					<Grid item lg={3} sm={6} xl={3} xs={12}>
						<Info
							label="Clients total"
							value={systemStatus?.$SYS?.broker?.clients?.total}
							icon={<ClientIcon />}
						/>
					</Grid>
					<Grid item lg={3} sm={6} xl={3} xs={12}>
						<Info
							label="Subscriptions"
							value={systemStatus?.$SYS?.broker?.subscriptions?.count}
							icon={<SubscriptionIcon />}
						/>
					</Grid>
					<Grid item lg={3} sm={6} xl={3} xs={12}>
						<Info
							label="PUBLISH received"
							value={systemStatus?.$SYS?.broker?.publish?.messages?.received}
							icon={<MessageIcon />}
						/>
					</Grid>
					<Grid item lg={3} sm={6} xl={3} xs={12}>
						<Info
							label="PUBLISH sent"
							value={systemStatus?.$SYS?.broker?.publish?.messages?.sent}
							icon={<MessageIcon />}
						/>
					</Grid>
					<Grid item lg={3} sm={6} xl={3} xs={12}>
						<Info
							label="Bytes received"
							value={systemStatus?.$SYS?.broker?.bytes?.received}
							icon={<DataReceivedIcon />}
						/>
					</Grid>
					<Grid item lg={3} sm={6} xl={3} xs={12}>
						<Info
							label="Bytes sent"
							value={systemStatus?.$SYS?.broker?.bytes?.sent}
							icon={<DataSentIcon />}
						/>
					</Grid>
					<Grid item lg={3} sm={6} xl={3} xs={12}>
						<Info
							label="Total received"
							value={systemStatus?.$SYS?.broker?.messages?.received}
							icon={<MessageIcon />}
						/>
					</Grid>
					<Grid item lg={3} sm={6} xl={3} xs={12}>
						<Info
							label="Total messages sent"
							value={systemStatus?.$SYS?.broker?.messages?.sent}
							icon={<MessageIcon />}
						/>
					</Grid>
					<Grid item lg={4} sm={4} xl={4} xs={12}>
						<TableContainer component={Paper}>
							<Table className={classes.table}>
								<TableHead>
									<TableCell colSpan={2}>Broker</TableCell>
								</TableHead>
								<TableBody>
									<TableRow key="version">
										<TableCell component="th" scope="row">
											Broker version
										</TableCell>
										<TableCell align="right">{systemStatus?.$SYS?.broker?.version}</TableCell>
									</TableRow>
									<TableRow key="uptime">
										<TableCell component="th" scope="row">
											Uptime
										</TableCell>
										<TableCell align="right">{systemStatus?.$SYS?.broker?.uptime}</TableCell>
									</TableRow>
									<TableRow key="url">
										<TableCell component="th" scope="row">
											URL
										</TableCell>
										<TableCell align="right">{currentConnection?.url}</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</TableContainer>
					</Grid>
					<Grid item lg={4} sm={4} xl={4} xs={12}>
						<TableContainer component={Paper}>
							<Table className={classes.table}>
								<TableHead>
									<TableCell colSpan={2}>Clients</TableCell>
								</TableHead>
								<TableBody>
									<TableRow key="clients-total">
										<TableCell component="th" scope="row">
											Total clients
										</TableCell>
										<TableCell align="right">
											{systemStatus?.$SYS?.broker?.clients?.total}
										</TableCell>
									</TableRow>
									<TableRow key="clients-active">
										<TableCell component="th" scope="row">
											Active clients
										</TableCell>
										<TableCell align="right">
											{systemStatus?.$SYS?.broker?.clients?.active}
										</TableCell>
									</TableRow>
									<TableRow key="clients-connected">
										<TableCell component="th" scope="row">
											Connected clients
										</TableCell>
										<TableCell align="right">
											{systemStatus?.$SYS?.broker?.clients?.connected}
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</TableContainer>
					</Grid>
					<Grid item lg={4} sm={4} xl={4} xs={12}>
						<TableContainer component={Paper}>
							<Table className={classes.table}>
								<TableHead>
									<TableCell colSpan={2}>Messages</TableCell>
								</TableHead>
								<TableBody>
									<TableRow key="messsages-received">
										<TableCell component="th" scope="row">
											Received messages
										</TableCell>
										<TableCell align="right">
											{systemStatus?.$SYS?.broker?.messages?.received}
										</TableCell>
									</TableRow>
									<TableRow key="messsages-sent">
										<TableCell component="th" scope="row">
											Sent messages
										</TableCell>
										<TableCell align="right">
											{systemStatus?.$SYS?.broker?.messages?.sent}
										</TableCell>
									</TableRow>
									<TableRow key="messsages-stored">
										<TableCell component="th" scope="row">
											Stored messages
										</TableCell>
										<TableCell align="right">
											{systemStatus?.$SYS?.broker?.messages?.stored}
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</TableContainer>
					</Grid>
					{/* <Grid item lg={4} sm={4} xl={4} xs={12}>
            <Chart
              title="Sent messages by type"
              data={data}
              dataDescriptions={dataDescriptions}
            />
          </Grid> */}
				</Grid>
			</Container> : <Alert severity="warning">
				<AlertTitle>System status information not accessible</AlertTitle>
				We couldn't retrieve the system status information.
				Please make sure that the user "{defaultClient?.username}" has the rights to read the "$SYS" topic on the selected broker.
			</Alert>
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
	);
};

const mapStateToProps = (state) => {
	return {
		lastUpdated: state.systemStatus.lastUpdated,
		systemStatus: state.systemStatus.systemStatus,
		defaultClient: state.brokerConnections?.defaultClient,
		currentConnection: state.brokerConnections.currentConnection,
		currentConnectionName: state.brokerConnections.currentConnectionName,
	};
};

export default connect(mapStateToProps)(Status);
