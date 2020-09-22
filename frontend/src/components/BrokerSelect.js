import React, { useContext } from "react";
import { connect } from "react-redux";
import { useDispatch } from 'react-redux';
import { makeStyles, useTheme } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { updateGroups, updateUsers, updateBrokerConfigurations, updateBrokerConnections, updateSystemStatus, updateTopicTree } from '../actions/actions';

// import {
// 	colors,
//   } from '@material-ui/core';

import { WebSocketContext } from '../websockets/WebSocket';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
	minWidth: 120,
	// color: colors.white,
  },
}));

const BrokerSelect = ({ brokerConnections, sendMessage }) => {
  const classes = useStyles();
  const theme = useTheme();
  const context = useContext(WebSocketContext);
  const dispatch = useDispatch();
  const [connection, setConnection] = React.useState("");

  const handleConnectionChange = async (event) => {
	  const { client } = context;
	  await client.disconnectFromBroker(connection);
	  await client.connectToBroker(event.target.value);
	  const brokerConnections = await client.getBrokerConnections();
	  dispatch(updateBrokerConnections(brokerConnections));
	  const brokerConfigurations = await client.getBrokerConfigurations();
	  dispatch(updateBrokerConfigurations(brokerConfigurations));
	  const users = await client.listUsers();
	  dispatch(updateUsers(users));
	  const groups = await client.listGroups();
	  dispatch(updateGroups(groups));
	  setConnection(event.target.value);
  };

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel id="demo-simple-select-outlined-label">Connection</InputLabel>
      <Select
        labelId="demo-simple-select-outlined-label"
        id="connection"
        value={connection}
        onChange={handleConnectionChange}
        label="Connection"
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {Array.isArray(brokerConnections)
          ? brokerConnections.map((brokerConnection) => (
              <MenuItem value={brokerConnection}>{brokerConnection}</MenuItem>
            ))
          : null}
      </Select>
    </FormControl>
  );
};

const mapStateToProps = (state) => {
  return {
    // TODO: check object hierarchy
    brokerConnections: state.brokerConnections.brokerConnections,
  };
};

export default connect(mapStateToProps)(BrokerSelect);
