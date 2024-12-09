import { green, red } from '@material-ui/core/colors';
import DisconnectedIcon from '@material-ui/icons/Cancel';
import ConnectedIcon from '@material-ui/icons/CheckCircle';
import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { useDispatch } from 'react-redux';
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';
import { WebSocketContext } from '../websockets/WebSocket';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import { handleConnectionChange } from '../utils/connectionUtils/connections';
import { showConnections } from '../utils/utils';
import ClusterIcon from '@material-ui/icons/People';
import LeaderIcon from '@material-ui/icons/Person';
import Tooltip from '@material-ui/core/Tooltip';
import { toClusterConnectionEntries } from '../admin/clusters/utils';

const CustomInput = withStyles((theme) => ({
    root: {
        'label + &': {
            marginTop: theme.spacing(1),
        },
    },
}))(InputBase);

const useStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: '10px',
        paddingTop: '7px',
        paddingBottom: '5px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        border: theme.palette.type === 'dark' ? 'thin solid rgba(255,255,255,1)' : 'thin solid rgba(0,0,0,0.5)',
    },
    label: {
        fontSize: '12px',
        textTransform: 'uppercase',
        transform: 'translate(14px, 20px) scale(1)',
    },
    formControl: {
        margin: '6px',
        minWidth: 120,
    },
}));

const BrokerSelect = ({
    brokerConnections,
    connected,
    currentConnectionName,
    sendMessage,
    userProfile,
    appBar,
    clusterDetails,
}) => {
    const classes = useStyles();
    const context = useContext(WebSocketContext);
    const dispatch = useDispatch();
    const theme = useTheme();
    const [connection, setConnection] = React.useState('');
    const [visible, setVisible] = React.useState(false);
    const location = useLocation();

    React.useEffect(() => {
        setVisible(showConnections());
    }, [location.pathname]);

    React.useEffect(() => {
        setConnection(currentConnectionName);
    }, [currentConnectionName]);

    const clusterConnections = toClusterConnectionEntries(clusterDetails);

    const handleConnectionChangeOuter = async (event) => {
        const connectionID = event.target.value;
        const { client } = context;

        handleConnectionChange(dispatch, client, connectionID, connection, connected);
    };

    return (visible || !appBar) && brokerConnections ? (
        <FormControl
            id="connection-select"
            variant="outlined"
            className={classes.formControl}
            style={{
                flexDirection: appBar ? 'row' : 'column',
            }}
        >
            {appBar ? (
                <Typography
                    variant="subtitle2"
                    style={{
                        color: theme.palette.type === 'dark' ? 'white' : 'rgba(117, 117, 117)',
                        margin: '8px 10px',
                    }}
                >
                    Connection:
                </Typography>
            ) : (
                <InputLabel
                    id="broker-select-outlined-label"
                    classes={{
                        root: classes.label,
                    }}
                >
                    Connection
                </InputLabel>
            )}
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
                    icon: classes.icon,
                }}
                input={<CustomInput />}
            >
                {brokerConnections && Array.isArray(brokerConnections)
                    ? brokerConnections
                          .sort((a, b) => a.name.localeCompare(b.name))
                          // .filter((brokerConnection) => brokerConnection.status ? brokerConnection.status.connected :
                          // false)
                          .map((brokerConnection) => (
                              <MenuItem
                                  // disabled={brokerConnection?.status.connected === false}
                                  key={brokerConnection.name}
                                  value={brokerConnection.name}
                                  classes={{
                                      root: classes.select,
                                  }}
                              >
                                  <div style={{ display: 'inline-flex', paddingTop: '1px' }}>
                                      {brokerConnection?.status.connected ? (
                                          <ConnectedIcon fontSize="small" style={{ color: green[500] }} />
                                      ) : (
                                          <DisconnectedIcon fontSize="small" style={{ color: red[500] }} />
                                      )}
                                      <Typography style={{ marginLeft: '8px' }} variant="body2">
                                          {brokerConnection.name}
                                      </Typography>
                                      {clusterConnections[brokerConnection.id] &&
                                      clusterConnections[brokerConnection.id].isLeader ? (
                                          <Tooltip
                                              title={`Leader of "${clusterConnections[brokerConnection.id].clustername}" cluster`}
                                          >
                                              <LeaderIcon fontSize="small" style={{ color: green[500] }} />
                                          </Tooltip>
                                      ) : clusterConnections[brokerConnection.id] ? (
                                          <Tooltip
                                              title={`Follower of "${clusterConnections[brokerConnection.id].clustername}" cluster`}
                                          >
                                              <ClusterIcon fontSize="small" />
                                          </Tooltip>
                                      ) : null}
                                  </div>
                              </MenuItem>
                          ))
                    : null}
            </Select>
        </FormControl>
    ) : null;
};

const mapStateToProps = (state) => {
    return {
        clusterDetails: state.clusters?.clusterDetails,
        brokerConnections: state.brokerConnections.brokerConnections,
        connected: state.brokerConnections.connected,
        currentConnectionName: state.brokerConnections?.currentConnectionName,
        userProfile: state.userProfile?.userProfile,
    };
};

export default connect(mapStateToProps)(BrokerSelect);
