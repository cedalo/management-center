import React from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { connect } from 'react-redux';

const LicenseErrorDialog = ({ license }) => {
	const handleClose = () => {
		// setOpen(false);
	};

	let error = null;
	if (license && license.error) {
		error = license.error;
	} else if (license && license.integrations?.error) {
		error = license.integrations.error;
	}

	return (
		<Dialog
			open={error}
			// onClose={handleClose}
			aria-labelledby="license-error-dialog-title"
			aria-describedby="license-error-dialog-description"
		>
			<DialogTitle align="center" id="license-error-dialog-title">
				{ error?.type }
			</DialogTitle>
			<DialogContent>
				<DialogContentText id="license-error--dialog-description">
				{ error?.message }
				</DialogContentText>
			</DialogContent>
		</Dialog>
	);
};

const mapStateToProps = (state) => {
	return {
		license: state.license?.license,
	};
};

export default connect(mapStateToProps)(LicenseErrorDialog);
