import useMediaQuery from '@material-ui/core/useMediaQuery';
import React, { useContext, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ProfileIcon from '@material-ui/icons/Person';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';


const useStyles = makeStyles((theme) => ({
	toolbarButton: {
		marginTop: '2px', // theme.spacing(0.8),
		color: theme.palette.type === 'dark' ? 'white' : 'rgba(117, 117, 117)',

		// marginBottom: theme.spacing(0.2)
	},
}));

const ProfileButton = (props) => {
	const history = useHistory();
	const classes = useStyles();
	const medium = useMediaQuery(theme => theme.breakpoints.between('sm', 'sm'));
	const small = useMediaQuery(theme => theme.breakpoints.down('xs'));

	const handleProfile = async () => {
		history.push('/profile');
	};

	if (small || medium) {
		return null;
	}

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
