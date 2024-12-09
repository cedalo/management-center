import React, { useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { showConnections } from '../utils/utils';

import BrokerSelect from './BrokerSelect';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Paper from '@material-ui/core/Paper';
import ReloadIcon from '@material-ui/icons/Replay';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { connect } from 'react-redux';
import ConnectionNewComponent from './ConnectionNewComponent';

// import MessagePage from './MessagePage';

const reloadPage = () => {
    window.location.reload();
};

const getDialogContent = (brokerConnections, connected, editDefaultClient) => {
    if (editDefaultClient) {
        return (
            <>
                <DialogTitle align="center" id="not-connected-dialog-title">
                    {!connected ? 'Applying changes' : 'Changes applied'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={24} justifyContent="center" style={{ maxWidth: '100%' }}>
                        <Grid item xs={12} align="center">
                            <DialogContentText id="alert-dialog-description">
                                {!connected
                                    ? 'Please wait while we are applying the changes to the broker.'
                                    : 'Please reload this page to synchronize with the Management Center server.'}
                            </DialogContentText>
                            {!connected ? (
                                <CircularProgress color="secondary" />
                            ) : (
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<ReloadIcon />}
                                    onClick={() => reloadPage()}
                                >
                                    Reload now
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
            </>
        );
    } else if (!brokerConnections || brokerConnections.length === 0) {
        return (
            <>
                <DialogTitle align="center" id="not-connected-dialog-title">
                    You have not configured any broker.
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={24} justifyContent="center" style={{ maxWidth: '100%' }}>
                        <Grid item xs={12} align="center">
                            <DialogContentText id="alert-dialog-description">
                                Please create a connection first.
                            </DialogContentText>
                            {/*<ConnectionNewComponent handleCloseDialog={handleClose} />*/}
                        </Grid>
                    </Grid>
                </DialogContent>
            </>
        );
    } else if (!connected) {
        return (
            <>
                <DialogTitle align="center" id="not-connected-dialog-title">
                    We could not connect to your broker
                    {/*{handleClose ? (*/}
                    {/*	<IconButton*/}
                    {/*	aria-label="close"*/}
                    {/*	onClick={handleClose}*/}
                    {/*	sx={{*/}
                    {/*		position: 'absolute',*/}
                    {/*		right: 8,*/}
                    {/*		top: 8,*/}
                    {/*		color: (theme) => theme.palette.grey[500],*/}
                    {/*	}}*/}
                    {/*	>*/}
                    {/*	<CloseIcon />*/}
                    {/*	</IconButton>*/}
                    {/*) : null}*/}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={24} justifyContent="center" style={{ maxWidth: '100%' }}>
                        <Grid item xs={12} align="center">
                            <img src={disconnectedImage} />
                        </Grid>
                        <Grid item xs={12} align="center">
                            {brokerConnections.length === 1 && (
                                <>
                                    <DialogContentText id="alert-dialog-description">
                                        Please make sure that the connection information is correct.
                                    </DialogContentText>
                                </>
                            )}
                            {brokerConnections.length > 1 && (
                                <>
                                    <DialogContentText id="alert-dialog-description">
                                        Please make sure that the connection information is correct or select another
                                        connection
                                    </DialogContentText>
                                    <BrokerSelect />
                                </>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
            </>
        );
    }
};
const Disconnected = ({ brokerConnections, connected, editDefaultClient }) => {
    return editDefaultClient || !connected ? getDialogContent(brokerConnections, connected, editDefaultClient) : null;
};

const LoadingComponent = ({ loading }) => {
    return loading ? (
        <Dialog open={true}>
            <DialogContent>
                <Grid container spacing={2} justifyContent="center" style={{ maxWidth: '100%' }}>
                    <Grid item xs={12} align="center">
                        {'Loading... Please wait'}
                    </Grid>
                    <Grid item xs={12} align="center">
                        <CircularProgress color="secondary" size="3rem" />
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    ) : null;
};

const mapStateToProps = (state) => {
    return {
        brokerConnections: state.brokerConnections?.brokerConnections,
        connected: state.brokerConnections?.connected,
        editDefaultClient: state.brokerConnections?.editDefaultClient,
        loading: state.loading?.loadingStatus,
    };
};

export const DisconnectedPage = connect(mapStateToProps)(Disconnected);
export const Loading = connect(mapStateToProps)(LoadingComponent);
