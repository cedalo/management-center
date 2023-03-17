import IconButton from '@material-ui/core/IconButton';
import {makeStyles} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import HelpIcon from '@material-ui/icons/HelpOutline';
import TourIcon from '@material-ui/icons/Slideshow';
import React from 'react';


const useStyles = makeStyles((theme) => ({
	toolbarButton: {
		marginTop: '2px', // theme.spacing(0.8),
		color: theme.palette.type === 'dark' ? 'white' : 'rgba(117, 117, 117)',
	},
}));

export default function HelpButtons(props) {
	const classes = useStyles();
	const medium = useMediaQuery(theme => theme.breakpoints.between('sm', 'sm'));
	const small = useMediaQuery(theme => theme.breakpoints.down('xs'));

	if (medium || small) {
		return null;
	}

	return <>
		<Tooltip title="Start tour">
			<IconButton
				edge="end"
				aria-label="Tour"
				aria-controls="tour"
				aria-haspopup="true"
				onClick={() => props.handleStartTour()}
				className={classes.toolbarButton}
			>
				<TourIcon fontSize="small"/>
			</IconButton>
		</Tooltip>
		<Tooltip title="Help">
			<IconButton
				edge="end"
				aria-label="Tour"
				aria-controls="tour"
				aria-haspopup="true"
				onClick={() => window.open('https://docs.cedalo.com/management-center', '_blank')}
				className={classes.toolbarButton}
			>
				<HelpIcon fontSize="small"/>
			</IconButton>
		</Tooltip>
	</>
};
