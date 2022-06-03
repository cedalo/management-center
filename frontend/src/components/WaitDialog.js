import React from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux';

// import MessagePage from './MessagePage';

const WaitDialog = ({ open, title, message, handleClose }) => {

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			aria-labelledby="not-wait-dialog-title"
			aria-describedby="not-wait-dialog-description"
		>
			<DialogTitle align="center" id="wait-dialog-title">
				{title}
			</DialogTitle>
			<DialogContent>
				<Grid container spacing={24} justify="center" style={{ maxWidth: '100%' }}>
					<Grid item xs={12} align="center">
						{message}
						{message ? <><br/><br/></> : null}
						<img src="/inprogress.png" />
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions></DialogActions>
		</Dialog>
	);
};

const mapStateToProps = (state) => {
	return {
	};
};

export default connect(mapStateToProps)(WaitDialog);
