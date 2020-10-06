import React, { useContext } from "react";
import { connect } from "react-redux";
import { useDispatch } from 'react-redux';
import { makeStyles, useTheme, withStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputBase from '@material-ui/core/InputBase';
import DisconnectedIcon from '@material-ui/icons/Cancel';
import ConnectedIcon from '@material-ui/icons/CheckCircle';
import { updateGroups, updateRoles, updateClients, updateBrokerConfigurations, updateBrokerConnected, updateBrokerConnections, updateSystemStatus, updateTopicTree } from '../actions/actions';

// import {
// 	colors,
//   } from '@material-ui/core';

import { WebSocketContext } from '../websockets/WebSocket';

const CustomInput = withStyles((theme) => ({
	root: {
	  'label + &': {
		marginTop: theme.spacing(1),
	  },
	},
  }))(InputBase);

const useStyles = makeStyles((theme) => ({
  root: {
	  backgroundColor: "rgba(255,255,255,0.2)",
	  border: "thin solid rgba(255,255,255,0.5)",
  },
  icon: {
	  color: "white",
	//   top: "calc(50% - 14px)",
  },
  label: {
	  color: "white",
	  fontSize: "12px",
	  textTransform: "uppercase",
	  transform: "translate(14px, 20px) scale(1)",
  },
  formControl: {
	// margin: theme.spacing(1),
	// height: "25px",
    margin: theme.spacing(1),
	minWidth: 120,
	// color: colors.white,
  },
}));

const BrokerSelect = ({ brokerConnections, connected, sendMessage }) => {
  const classes = useStyles();
  const theme = useTheme();
  const context = useContext(WebSocketContext);
  const dispatch = useDispatch();
  const [connection, setConnection] = React.useState("");

  const handleConnectionChange = async (event) => {
	  console.log("handleConnectionChange");
	  const connectionID = event.target.value;
	  console.log(event.target.value);
	  const { client } = context;
	  await client.disconnectFromBroker(connection);
	  dispatch(updateBrokerConnected(false));
	  if (connectionID && connectionID !== '') {
		try {
		  await client.connectToBroker(connectionID);
		  dispatch(updateBrokerConnected(true));
			} catch(error) {
			dispatch(updateBrokerConnected(false));
			return;
		}
		  const brokerConnections = await client.getBrokerConnections();
		  dispatch(updateBrokerConnections(brokerConnections));
		  const brokerConfigurations = await client.getBrokerConfigurations();
		  dispatch(updateBrokerConfigurations(brokerConfigurations));
		  const clients = await client.listClients();
		  dispatch(updateClients(clients));
		  const groups = await client.listGroups();
		  dispatch(updateGroups(groups));
		  const roles = await client.listRoles();
		  dispatch(updateRoles(roles));
		  setConnection(event.target.value);
	  } else {

	  }
  };

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel
	    id="broker-select-outlined-label" 
		classes={{
			root: classes.label,
		}}>
		Connection
	  </InputLabel>
      <Select
	  	defaultValue="Mosquitto 2.0 Preview"
        labelId="broker-select-outlined-label"
        id="connection"
        value={connection}
        onChange={handleConnectionChange}
		label="Connection"
		classes={{
			root: classes.root,
			icon: classes.icon,
		}}
		input={<CustomInput />}
      >
        {brokerConnections && Array.isArray(brokerConnections)
          ? brokerConnections.map((brokerConnection) => (
              <MenuItem value={brokerConnection} >{brokerConnection}</MenuItem>
            ))
          : null}
      </Select>
    </FormControl>
  );
};

const mapStateToProps = (state) => {
  return {
    brokerConnections: state.brokerConnections.brokerConnections,
    connected: state.brokerConnections.connected,
  };
};

export default connect(mapStateToProps)(BrokerSelect);
