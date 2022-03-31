import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import { useConfirm } from 'material-ui-confirm';


const PREFIX = 'LogoutButton';

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

const LogoutButton = (props) => {

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

	return (
        <StyledTooltip title="Logout">
            <IconButton
                edge="end"
                aria-label="Logout"
                aria-controls="logout"
                aria-haspopup="true"
                onClick={() => handleLogout()}
                color="inherit"
                className={classes.toolbarButton}
                size="large">
                <LogoutIcon fontSize="small" />
            </IconButton>
        </StyledTooltip>
    );
};

const mapStateToProps = (state) => {
	return {
	};
};

export default connect(mapStateToProps)(LogoutButton);
