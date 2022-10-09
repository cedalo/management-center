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
// import {
// 	updateAnonymousGroup,
// 	updateGroups,
// 	updateGroupsAll,
// 	updateRoles,
// 	updateRolesAll,
// 	updateClients,
// 	updateClientsAll,
// 	updateBrokerConfigurations,
// 	updateBrokerConnected,
// 	updateBrokerConnections,
// 	updateDefaultACLAccess,
// 	updateSettings,
// 	updateStreams,
// 	updateSystemStatus,
// 	updateTopicTree,
// 	updateEditDefaultClient,
// 	updateFeatures,
// 	updateBrokerLicenseInformation
// } from '../actions/actions';

// import {
// 	updateInspectClients
// } from '../admin/inspect/actions/actions';

// import {
// 	colors,
//   } from '@material-ui/core';

import { WebSocketContext } from '../websockets/WebSocket';

import { handleConnectionChange } from '../utils/connectionUtils/connections';


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

const BrokerSelect = ({ brokerConnections, connected, currentConnectionName, sendMessage, userProfile }) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const [connection, setConnection] = React.useState('');

	React.useEffect(() => {
		setConnection(currentConnectionName);
	}, [currentConnectionName]);
	
	const handleConnectionChangeOuter = async (event) => {
		const connectionID = event.target.value;
		const { client } = context;

		handleConnectionChange(dispatch, client, connectionID, connection, setConnection);
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
				onChange={handleConnectionChangeOuter}
				label="Connection"
				classes={{
					root: classes.root,
					icon: classes.icon
				}}
				input={<CustomInput />}
			>
				{brokerConnections && Array.isArray(brokerConnections)
					? brokerConnections
							// .filter((brokerConnection) => brokerConnection.status ? brokerConnection.status.connected : false)
							.map((brokerConnection) => (
								<MenuItem
									key={brokerConnection.name}
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
		currentConnectionName: state.brokerConnections.currentConnectionName,
		userProfile: state.userProfile?.userProfile,
	};
};

export default connect(mapStateToProps)(BrokerSelect);
