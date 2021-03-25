import React, { useContext, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';


const useStyles = makeStyles((theme) => ({
	toolbarButton: {
		marginTop: theme.spacing(0.8),
		marginBottom: theme.spacing(0.2)
	},
}));

const LogoutButton = (props) => {
	const classes = useStyles();
	const confirm = useConfirm();

	const handleLogout = async () => {
		await confirm({
			title: 'Confirm logout',
			description: `Do you really want to logout?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		window.location.href = '/logout';
	};

	return <Tooltip title="Logout">
		<IconButton
			edge="end"
			aria-label="Logout"
			aria-controls="logout"
			aria-haspopup="true"
			onClick={() => handleLogout()}
			color="inherit"
			className={classes.toolbarButton}
		>
			<LogoutIcon fontSize="small" />
		</IconButton>
	</Tooltip>
};

const mapStateToProps = (state) => {
	return {
	};
};

export default connect(mapStateToProps)(LogoutButton);
