import React, { useContext } from "react";
import { connect } from "react-redux";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { WebSocketContext } from '../websockets/WebSocket';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const BrokerSelect = ({ brokerConnections, sendMessage }) => {
  const classes = useStyles();
  const theme = useTheme();
  const context = useContext(WebSocketContext);
  const [connection, setConnection] = React.useState("");

  const handleConnectionChange = (event) => {
	  const { client } = context;
	client.disconnectFromBroker(connection)
		.then((response) => console.log(response))
		.then(client.connectToBroker(event.target.value))
		.then(() => {
			console.log('connected to broker');
		})
		.then(() => client.getBrokerConnections())
		.then(brokerConnections => {
			dispatch(updateBrokerConnections(brokerConnections));
		})
		.then(() => client.getBrokerConfigurations())
		.then(brokerConfigurations => {
			dispatch(updateBrokerConfigurations(brokerConfigurations));
		})
		.then(() => client.listUsers())
		.then(users => {
			dispatch(updateUsers(users));
		});
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
