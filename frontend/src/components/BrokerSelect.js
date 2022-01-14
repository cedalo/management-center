import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';
import DisconnectedIcon from '@material-ui/icons/Cancel';
import ConnectedIcon from '@material-ui/icons/CheckCircle';
import {
	updateAnonymousGroup,
	updateGroups,
	updateRoles,
	updateClients,
	updateBrokerConfigurations,
	updateBrokerConnected,
	updateBrokerConnections,
	updateDefaultACLAccess,
	updateSettings,
	updateStreams,
	updateSystemStatus,
	updateTopicTree,
	updateEditDefaultClient,
	updateFeatures
} from '../actions/actions';

// import {
// 	colors,
//   } from '@material-ui/core';

import { WebSocketContext } from '../websockets/WebSocket';

const CustomInput = withStyles((theme) => ({
	root: {
		'label + &': {
			marginTop: theme.spacing(1)
		}
	}
}))(InputBase);

const useStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: '20px',
		backgroundColor: 'rgba(255,255,255,0.2)',
		border: 'thin solid rgba(255,255,255,0.5)',
		color: 'white',
		fontSize: '14px'
	},
	label: {
		fontSize: '12px',
		textTransform: 'uppercase',
		transform: 'translate(14px, 20px) scale(1)',
		color: 'white',
	},
	formControl: {
		// margin: theme.spacing(1),
		// height: "25px",
		margin: theme.spacing(1),
		minWidth: 120
	},
	select: {
		fontSize: '14px',
	}
}));

const BrokerSelect = ({ brokerConnections, connected, currentConnectionName, sendMessage }) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const [connection, setConnection] = React.useState('');

	const handleConnectionChange = async (event) => {
		const connectionID = event.target.value;
		const { client } = context;
		await client.disconnectFromBroker(connection);
		dispatch(updateBrokerConnected(false, connectionID));
		if (connectionID && connectionID !== '') {
			try {
				await client.connectToBroker(connectionID);
				dispatch(updateBrokerConnected(true, connectionID));
			} catch (error) {
				dispatch(updateBrokerConnected(false, connectionID));
				return;
			}
			const settings = await client.getSettings();
			dispatch(updateSettings(settings));
			const brokerConnections = await client.getBrokerConnections();
			dispatch(updateBrokerConnections(brokerConnections));
			const brokerConfigurations = await client.getBrokerConfigurations();
			dispatch(updateBrokerConfigurations(brokerConfigurations));
			try {
				const clients = await client.listClients();
				dispatch(updateClients(clients));
				const groups = await client.listGroups();
				dispatch(updateGroups(groups));
				const anonymousGroup = await client.getAnonymousGroup();
				dispatch(updateAnonymousGroup(anonymousGroup));
				const roles = await client.listRoles();
				dispatch(updateRoles(roles));
				const defaultACLAccess = await client.getDefaultACLAccess();
				dispatch(updateDefaultACLAccess(defaultACLAccess));
				dispatch(updateFeatures({
					feature: 'dynamicsecurity',
					status: 'ok'
				}));
			} catch (error) {
				dispatch(updateFeatures({
					feature: 'dynamicsecurity',
					status: error
				}));
			}
			try {
				const streams = await client.listStreams();
				dispatch(updateStreams(streams));
				dispatch(updateFeatures({
					feature: 'streamprocessing',
					status: 'ok'
				}));
			} catch (error) {
				dispatch(updateFeatures({
					feature: 'streamprocessing',
					status: error
				}));
			}
			// const plugins = await client.listPlugins();
			// dispatch(updatePlugins(plugins));
			setConnection(event.target.value);
		} else {
		}
	};

	return brokerConnections ? (
		<FormControl id="connection-select" variant="outlined" className={classes.formControl}>
			<InputLabel
				id="broker-select-outlined-label"
				classes={{
					root: classes.label
				}}
			>
				Connection
			</InputLabel>
			<Select
				// displayEmpty
				defaultValue={currentConnectionName}
				labelId="broker-select-outlined-label"
				id="connection"
				value={currentConnectionName || ''}
				onChange={handleConnectionChange}
				label="Connection"
				classes={{
					root: classes.root,
					icon: classes.icon
				}}
				input={<CustomInput />}
			>
				{brokerConnections && Array.isArray(brokerConnections)
					? brokerConnections
							.filter((brokerConnection) => brokerConnection.status ? brokerConnection.status.connected : false)
							.map((brokerConnection) => (
								<MenuItem
									value={brokerConnection.name}
									classes={{
										root: classes.select
									}}
								>
									{brokerConnection.name}
								</MenuItem>
							))
					: null}
			</Select>
		</FormControl>
	) : null;
};

const mapStateToProps = (state) => {
	return {
		brokerConnections: state.brokerConnections.brokerConnections,
		connected: state.brokerConnections.connected,
		currentConnectionName: state.brokerConnections.currentConnectionName
	};
};

export default connect(mapStateToProps)(BrokerSelect);
