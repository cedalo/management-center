import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import { useHistory } from 'react-router-dom';

const PREFIX = 'InfoButton';

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

const InfoButton = () => {

	const history = useHistory();

	const onClickInfo = () => {
		history.push('/info');
	};

	return (
        <StyledTooltip title="Show info">
			<IconButton
                edge="end"
                aria-label="Theme Mode"
                aria-controls="theme-mode"
                aria-haspopup="true"
                onClick={onClickInfo}
                color="inherit"
                className={classes.toolbarButton}
                size="large">
				<InfoIcon fontSize="small" />
			</IconButton>
		</StyledTooltip>
    );
};

InfoButton.propTypes = {
	className: PropTypes.string
};

export default InfoButton;
