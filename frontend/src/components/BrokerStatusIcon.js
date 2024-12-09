import React from 'react';
import { green, red } from '@material-ui/core/colors';
import ConnectedIcon from '@material-ui/icons/CheckCircle';
import DisconnectedIcon from '@material-ui/icons/Cancel';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import { connect } from 'react-redux';

const createStatusIcon = (status) =>
    status && status.connected ? (
        <ConnectedIcon fontSize="small" style={{ color: green[500] }} />
    ) : (
        <DisconnectedIcon fontSize="small" style={{ color: red[500] }} />
    );

const BrokerStatusIcon = ({ brokerConnection }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [openedPopoverId, setOpenedPopoverId] = React.useState(null);

    const handlePopoverOpen = (target, id) => {
        setOpenedPopoverId(id);
        setAnchorEl(target);
    };

    const handleClose = () => {
        setOpenedPopoverId(null);
        setAnchorEl(null);
    };

    return (
        <>
            <Popover
                id={brokerConnection.id}
                open={openedPopoverId === brokerConnection.id}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Typography>
                    {brokerConnection.status?.connected ? (
                        <Paper>Broker successfully connected</Paper>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <strong>Error number</strong>
                                        </TableCell>
                                        <TableCell>{brokerConnection.status?.error?.errno}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <strong>Error code</strong>
                                        </TableCell>
                                        <TableCell>{brokerConnection.status?.error?.code}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <strong>System call</strong>
                                        </TableCell>
                                        <TableCell>{brokerConnection.status?.error?.syscall}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <strong>Address</strong>
                                        </TableCell>
                                        <TableCell>{brokerConnection.status?.error?.address}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <strong>Port</strong>
                                        </TableCell>
                                        <TableCell>{brokerConnection.status?.error?.port}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Typography>
            </Popover>
            <IconButton
                size="small"
                onClick={(event) => {
                    event.stopPropagation();
                    handlePopoverOpen(event.target, brokerConnection.id);
                }}
            >
                {createStatusIcon(brokerConnection.status)}
            </IconButton>
        </>
    );
};

const mapStateToProps = (state) => {
    return {};
};

export default connect(mapStateToProps)(BrokerStatusIcon);
