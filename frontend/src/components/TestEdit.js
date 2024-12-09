import React, { useContext, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { updateClient, updateClients } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AccountCircle from '@material-ui/icons/AccountCircle';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import ClientIDIcon from '@material-ui/icons/Fingerprint';
import ClientIcon from '@material-ui/icons/Person';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import { Link as RouterLink } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';

import { WebSocketContext } from '../websockets/WebSocket';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import ButtonWithLoadingProgress from './ButtonWithLoadingProgress';

const CustomInput = withStyles((theme) => ({
    root: {
        'label + &': {
            marginTop: theme.spacing(1),
        },
    },
}))(InputBase);

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: '75ch',
        },
    },
    buttons: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    form: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        // marginLeft: theme.spacing(1),
        // marginRight: theme.spacing(1),
        // width: 200,
    },
    margin: {
        margin: theme.spacing(2),
    },
    breadcrumbItem: theme.palette.breadcrumbItem,
    breadcrumbLink: theme.palette.breadcrumbLink,
}));

const TestEdit = ({ brokerConnections, currentConnection, testCollection, test }) => {
    const classes = useStyles();

    const [name, setName] = useState(test?.name);
    const [requestTopic, setRequestTopic] = useState(test?.requestTopic);
    const [brokerId, setBrokerId] = useState(test?.target?.brokerId);
    const [content, setContent] = useState(JSON.stringify(test?.request?.body?.content, null, 2));
    const [response, setResponse] = useState({});

    const { enqueueSnackbar } = useSnackbar();
    const context = useContext(WebSocketContext);
    const dispatch = useDispatch();
    const history = useHistory();
    const confirm = useConfirm();
    const { client } = context;

    const onSendRequest = async () => {
        try {
            const response = await client.sendTestRequest({
                info: {
                    name: 'Example test connection',
                },
                items: [
                    {
                        name,
                        requestTopic,
                        request: {
                            body: {
                                correlationData: '1',
                                mode: 'json',
                                content,
                            },
                        },
                        target: {
                            brokerId,
                            protocol: 'mqtt',
                        },
                    },
                ],
            });
            setResponse(response);
            console.log(response);
            enqueueSnackbar(`Response successfully executed.`, {
                variant: 'success',
            });
        } catch (error) {
            enqueueSnackbar(`Error executing response. Reason: ${error.message || error}`, {
                variant: 'error',
            });
            throw error;
        }
    };

    return (
        <div>
            <Breadcrumbs aria-label="breadcrumb">
                <RouterLink className={classes.breadcrumbLink} to="/home">
                    Home
                </RouterLink>
                <RouterLink className={classes.breadcrumbLink} to="/testcollections">
                    Test Collections
                </RouterLink>
                <RouterLink
                    className={classes.breadcrumbLink}
                    to={`/testcollections/detail/{${testCollection?.info?.id}}`}
                >
                    {testCollection?.info?.name}
                </RouterLink>
                <Typography className={classes.breadcrumbItem} color="textPrimary">
                    {test?.name}
                </Typography>
            </Breadcrumbs>
            <br />
            <div className={classes.root}>
                <Paper>
                    <Grid container spacing={1} direction="row" alignItems="flex-start" justifyContent="flex-start">
                        <Grid item xs={12} sm={6}>
                            <form className={classes.form} noValidate autoComplete="off">
                                <div className={classes.margin}>
                                    <Grid
                                        container
                                        spacing={1}
                                        direction="column"
                                        alignItems="flex-start"
                                        justifyContent="flex-start"
                                    >
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                required
                                                id="name"
                                                label="Name"
                                                onChange={(event) => setName(event.target.value)}
                                                defaultValue={test?.name}
                                                variant="outlined"
                                                fullWidth
                                                className={classes.textField}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <AccountCircle />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                required
                                                id="request-topic"
                                                label="Request topic"
                                                onChange={(event) => setRequestTopic(event.target.value)}
                                                defaultValue={test?.requestTopic}
                                                variant="outlined"
                                                fullWidth
                                                type="text"
                                                className={classes.textField}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl
                                                id="connection-select"
                                                variant="outlined"
                                                className={classes.formControl}
                                            >
                                                <InputLabel
                                                    id="broker-select-outlined-label"
                                                    classes={{
                                                        root: classes.label,
                                                    }}
                                                >
                                                    Connection
                                                </InputLabel>
                                                <Select
                                                    // displayEmpty
                                                    defaultValue={test?.target?.brokerId}
                                                    labelId="broker-select-outlined-label"
                                                    id="brokerId"
                                                    value={brokerId || ''}
                                                    onChange={(event) => setBrokerId(event.target.value)}
                                                    label="Broker ID"
                                                    classes={{
                                                        root: classes.root,
                                                        icon: classes.icon,
                                                    }}
                                                    input={<CustomInput />}
                                                >
                                                    {brokerConnections && Array.isArray(brokerConnections)
                                                        ? brokerConnections
                                                              .filter((brokerConnection) =>
                                                                  brokerConnection.status
                                                                      ? brokerConnection.status.connected
                                                                      : false
                                                              )
                                                              .map((brokerConnection) => (
                                                                  <MenuItem
                                                                      value={brokerConnection.id}
                                                                      classes={{
                                                                          root: classes.select,
                                                                      }}
                                                                  >
                                                                      {brokerConnection.name}
                                                                  </MenuItem>
                                                              ))
                                                        : null}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                id="content"
                                                label="Message content"
                                                aria-label="content"
                                                onChange={(event) => setContent(event.target.value)}
                                                multiline
                                                rows={10}
                                                defaultValue={JSON.stringify(test?.request?.body?.content, null, 2)}
                                                variant="outlined"
                                                fullWidth
                                                className={classes.textField}
                                            />
                                        </Grid>
                                        <Grid container xs={12} alignItems="flex-start">
                                            <Grid item xs={12} className={classes.buttons}>
                                                <ButtonWithLoadingProgress
                                                    buttonText="Send request"
                                                    onClick={onSendRequest}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </div>
                            </form>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Grid
                                container
                                spacing={1}
                                direction="column"
                                alignItems="flex-start"
                                justifyContent="flex-start"
                            >
                                <Grid item xs={6}>
                                    <TextField
                                        id="response"
                                        label="Message response"
                                        value={JSON.stringify(response, null, 2)}
                                        aria-label="content"
                                        multiline
                                        rows={22}
                                        defaultValue=""
                                        variant="outlined"
                                        fullWidth
                                        className={classes.textField}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        testCollection: state.tests.testCollection,
        test: state.tests.test,
        brokerConnections: state.brokerConnections.brokerConnections,
        currentConnection: state.brokerConnections.currentConnection,
    };
};

export default connect(mapStateToProps)(TestEdit);
