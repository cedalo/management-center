import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ProfileIcon from '@mui/icons-material/Person';
import { useConfirm } from 'material-ui-confirm';


const PREFIX = 'ProfileButton';

const classes = {
    toolbarButton: `${PREFIX}-toolbarButton`
};

const StyledTooltip = styled(Tooltip)((
    {
        theme
    }
) => ({
    [`& .${classes.toolbarButton}`]: {
		marginTop: theme.spacing(0.8),
		marginBottom: theme.spacing(0.2)
	}
}));

const ProfileButton = (props) => {

	const confirm = useConfirm();

	const handleProfile = async () => {
		window.location.href = '/profile';
	};

	return (
        <StyledTooltip title="Profile">
            <IconButton
                edge="end"
                aria-label="Profile"
                aria-controls="profile"
                aria-haspopup="true"
                onClick={() => handleProfile()}
                color="inherit"
                className={classes.toolbarButton}
                size="large">
                <ProfileIcon fontSize="small" />
            </IconButton>
        </StyledTooltip>
    );
};

const mapStateToProps = (state) => {
	return {
	};
};

export default connect(mapStateToProps)(ProfileButton);
