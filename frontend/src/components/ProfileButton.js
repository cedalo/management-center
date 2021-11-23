import React, { useContext, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ProfileIcon from '@material-ui/icons/Person';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';


const useStyles = makeStyles((theme) => ({
	toolbarButton: {
		marginTop: theme.spacing(0.8),
		marginBottom: theme.spacing(0.2)
	},
}));

const ProfileButton = (props) => {
	const classes = useStyles();
	const confirm = useConfirm();

	const handleProfile = async () => {
		window.location.href = '/profile';
	};

	return <Tooltip title="Profile">
		<IconButton
			edge="end"
			aria-label="Profile"
			aria-controls="profile"
			aria-haspopup="true"
			onClick={() => handleProfile()}
			color="inherit"
			className={classes.toolbarButton}
		>
			<ProfileIcon fontSize="small" />
		</IconButton>
	</Tooltip>
};

const mapStateToProps = (state) => {
	return {
	};
};

export default connect(mapStateToProps)(ProfileButton);
