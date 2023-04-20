import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';

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
				<Grid container spacing={2} justifyContent="center" style={{maxWidth: '100%'}}>
					<Grid item xs={12} align="center">
						{message}
					</Grid>
					<Grid item xs={12} align="center">
						<CircularProgress color="secondary" size="3rem"/>
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
};

export default WaitDialog;
