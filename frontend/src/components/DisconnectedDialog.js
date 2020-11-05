import React, { useContext } from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const DisconnectedDialog = ({ connected }) => {
	const handleClose = () => {
		// setOpen(false);
	};

	return (
		<Dialog
			open={false}
			// onClose={handleClose}
			aria-labelledby="not-connected-dialog-title"
			aria-describedby="not-connected-dialog-description"
		>
			<DialogTitle id="not-connected-dialog-title">{'Connecting'}</DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-description">{/* Could not connect */}</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} color="primary">
					Ok
				</Button>
				<Button onClick={handleClose} color="secondary" autoFocus>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	);
};

const mapStateToProps = (state) => {
	return {
		connected: state.brokerConnections.connected
	};
};

export default connect(mapStateToProps)(DisconnectedDialog);
