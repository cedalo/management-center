import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
	toolbarButton: {
		marginTop: theme.spacing(0.8),
		marginBottom: theme.spacing(0.2)
	}
}));

const InfoButton = () => {
	const classes = useStyles();
	const history = useHistory();

	const onClickInfo = () => {
		history.push('/info');
	};

	return (
		<Tooltip title="Show info">
			<IconButton
				edge="end"
				aria-label="Theme Mode"
				aria-controls="theme-mode"
				aria-haspopup="true"
				onClick={onClickInfo}
				color="inherit"
				className={classes.toolbarButton}
			>
				<InfoIcon fontSize="small" />
			</IconButton>
		</Tooltip>
	);
};

InfoButton.propTypes = {
	className: PropTypes.string
};

export default InfoButton;
