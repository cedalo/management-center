import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { connect } from 'react-redux';
import Collapse from '@material-ui/core/Collapse';

import { trimString, parseUrl } from '../../../utils/utils';

const useStyles = makeStyles((theme) => ({
    form: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        // marginLeft: theme.spacing(1),
        // marginRight: theme.spacing(1),
        // width: 200,
    },
    select: {
        fontSize: '14px',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: '100%',
    },
}));

const clusterDoesNotContainNode = (brokerConnection, cluster) => {
    const result = cluster?.nodes?.find((node) => node.id === brokerConnection.id);
    return result ? false : true;
};

const brokerNotPartOfExistingCluster = (brokerConnection) => {
    return !brokerConnection.cluster;
};

const validNodeIdRange = (nodeid) => {
    return nodeid >= 1 && nodeid <= 1023;
};

const validateIpAddressOrHostname = (address) => {
    // also mau be a DNS name with "_"
    const ipRegex = new RegExp('^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$');
    const hostnameRegex = new RegExp('^(([a-zA-Z0-9][a-zA-Z0-9_.-]*[a-zA-Z0-9])|[a-zA-Z0-9_])$');
    return ipRegex.test(address) || hostnameRegex.test(address);
};

const SelectNodeComponent = ({
    brokerConnections,
    cluster,
    handleSelectNode,
    defaultNode = {},
    setNode,
    checkAllNodeIds,
    message,
}) => {
    const node = defaultNode;
    const classes = useStyles();
    const [validNodeId, setValidNodeId] = useState(true);
    const [validIpAddress, setValidIpAddress] = useState(true);
    const [showIpInput, setShowIpInput] = useState(false);
    const [ipAddress, setIpAddress] = useState(node.address);

    const availableBrokerConnections =
        brokerConnections
            ?.filter((brokerConnection) => clusterDoesNotContainNode(brokerConnection, cluster))
            .filter((brokerConnection) => brokerNotPartOfExistingCluster(brokerConnection))
            .filter((brokerConnection) => (brokerConnection.status ? brokerConnection.status.connected : false)) || [];

    const handleSelectBroker = (broker) => {
        setShowIpInput(true);
        if (broker.url) {
            try {
                const hostname = parseUrl(broker.url).host;
                setIpAddress(hostname);
                setNode({ ...node, broker: broker.id, address: trimString(hostname) }); // todo: try throw here
            } catch (error) {
                console.error('Could not parse hostname from URL:', broker.url, error);
                setNode({ ...node, broker: broker.id });
            }
        } else {
            console.log('No url found for the broker:', broker.id);
            setNode({ ...node, broker: broker.id });
        }
    };

    useEffect(() => {
        setValidNodeId(checkAllNodeIds()); // check nodeids after setting. This checks their uniqueness
    }, [defaultNode]);

    return (
        <Grid container spacing={1} alignItems="flex-end">
            <Grid item xs={12} align="center">
                <TextField
                    type="number"
                    required={true}
                    id="node-id"
                    size="small"
                    label="Node ID"
                    InputProps={{ inputProps: { min: 1, max: 1023 } }}
                    onChange={(event) => {
                        const nodeid = parseInt(event.target.value);
                        const valid = validNodeIdRange(nodeid);
                        setValidNodeId(valid);
                        if (valid) {
                            setNode({ ...node, nodeid: parseInt(event.target.value) });
                        }
                    }}
                    error={!validNodeId}
                    helperText={!validNodeId && 'Node ID must be a unique number from 1 to 1023.'}
                    defaultValue={node.nodeid}
                    variant="outlined"
                    fullWidth
                    className={classes.textField}
                />
            </Grid>
            <Grid item xs={12} align="center">
                <TextField
                    select
                    label="Broker"
                    size="small"
                    variant="outlined"
                    defaultValue=""
                    fullWidth
                    placeholder="Please select an instance"
                    value={node.broker}
                    onChange={(event) =>
                        handleSelectBroker(
                            availableBrokerConnections.find((brokerConnection) => {
                                return brokerConnection.id === event.target.value;
                            })
                        )
                    }
                >
                    {availableBrokerConnections.length > 0 ? (
                        availableBrokerConnections.map((brokerConnection) => (
                            <MenuItem
                                value={brokerConnection.id}
                                classes={{
                                    root: classes.select,
                                }}
                            >
                                {`${brokerConnection.name} (${brokerConnection.id})`}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem
                            disabled
                            value=""
                            classes={{
                                root: classes.select,
                            }}
                        >
                            No available brokers
                        </MenuItem>
                    )}
                </TextField>
            </Grid>
            <Grid item xs={12} align="center">
                <Collapse in={showIpInput} timeout={500}>
                    <TextField
                        required={true}
                        size="small"
                        id="private-ip-address"
                        label="Private IP address"
                        onChange={(event) => {
                            const address = event.target.value;
                            const valid = validateIpAddressOrHostname(address);
                            setValidIpAddress(valid);
                            setIpAddress(address);
                            if (valid) {
                                setNode({ ...node, address: trimString(event.target.value) });
                            } else {
                                setNode({ ...node, address: undefined }); // save button validator will detect an empty address and block the save button
                            }
                        }}
                        value={ipAddress || ''}
                        variant="outlined"
                        fullWidth
                        className={classes.textField}
                        error={!validIpAddress}
                        helperText={(!validIpAddress && 'IP address/hostname is invalid.') || message}
                    />
                </Collapse>
            </Grid>
        </Grid>
    );
};

const mapStateToProps = (state) => {
    return {
        brokerConnections: state.brokerConnections?.brokerConnections,
    };
};

export default connect(mapStateToProps)(SelectNodeComponent);
