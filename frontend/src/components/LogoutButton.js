import React, { useContext, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';


const useStyles = makeStyles((theme) => ({
	toolbarButton: {
		marginTop: '2px',
		color: theme.palette.type === 'dark' ? 'white' : 'rgba(117, 117, 117)',
		// marginBottom: theme.spacing(0.2)
	},
}));

const LogoutButton = (props) => {
	const classes = useStyles();
	const confirm = useConfirm();

	const handleLogout = async () => {
		await confirm({
			title: 'Confirm logout',
			description: `Do you really want to logout?`
		});
		window.location.href = `${process.env.PUBLIC_URL || ''}/logout`;
	};

	return <Tooltip title="Logout">
		<IconButton
			edge="end"
			id="logout-button"
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
