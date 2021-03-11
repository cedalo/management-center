import React, { useContext } from 'react';

import BrokerSelect from './BrokerSelect';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import ReloadIcon from '@material-ui/icons/Replay';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';

// import MessagePage from './MessagePage';

const reloadPage = () => {
	window.location.reload();
}

const getDialogContent = (connected, proxyConnected) => {
	if (!connected) {
		return <>
			<DialogTitle align="center" id="not-connected-dialog-title">
				We could not connect to your broker
			</DialogTitle>
			<DialogContent>
				{/* <MessagePage 
					message="We could not find any Streamsheets installation."
					buttonText="Get Streamsheets now!"
				/> */}
				<Grid container spacing={24} justify="center" style={{ maxWidth: '100%' }}>
					<Grid item xs={12} align="center">
						<img src="/disconnected.png" />
					</Grid>
					<Grid item xs={12} align="center">
						<DialogContentText id="alert-dialog-description">
							Please select another connection
						</DialogContentText>
						<BrokerSelect />
					</Grid>
				</Grid>
			</DialogContent>
		</>
	} else if (!proxyConnected) {
		return <>
			<DialogTitle align="center" id="not-connected-dialog-title">
				We could not connect to the proxy server
			</DialogTitle>
			<DialogContent>
				<Grid container spacing={24} justify="center" style={{ maxWidth: '100%' }}>
					<Grid item xs={12} align="center">
						<img src="/disconnected.png" />
					</Grid>
					<Grid item xs={12} align="center">
						<DialogContentText id="alert-dialog-description">
							Please start the proxy server and reload this page
						</DialogContentText>
						<Button
							size="small" 
							variant="contained"
							color="primary"
							startIcon={<ReloadIcon />}
							onClick={() => reloadPage()}
						>
							Reload now
						</Button>
					</Grid>
				</Grid>
			</DialogContent>
		</>
	}
}
const DisconnectedDialog = ({ connected, proxyConnected }) => {
	const handleClose = () => {
		// setOpen(false);
	};

	return (
		<Dialog
			open={!connected || !proxyConnected}
			// onClose={handleClose}
			aria-labelledby="not-connected-dialog-title"
			aria-describedby="not-connected-dialog-description"
		>
			{
				getDialogContent(connected, proxyConnected)
			}
		</Dialog>
	);
};

const mapStateToProps = (state) => {
	return {
		connected: state.brokerConnections?.connected,
		proxyConnected: state.proxyConnection?.connected
	};
};

export default connect(mapStateToProps)(DisconnectedDialog);
