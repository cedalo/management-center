import React from 'react';

import Dialog from '@material-ui/core/Dialog';
import { connect } from 'react-redux';

const LicenseErrorDialog = ({ license }) => {
	const handleClose = () => {
		// setOpen(false);
	};

	return (
		<Dialog
			open={license && license.error}
			// onClose={handleClose}
			aria-labelledby="license-error-dialog-title"
			aria-describedby="license-error-dialog-description"
		>
			License error
		</Dialog>
	);
};

const mapStateToProps = (state) => {
	return {
		license: state.license?.license,
	};
};

export default connect(mapStateToProps)(LicenseErrorDialog);
