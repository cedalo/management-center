import IconButton from '@material-ui/core/IconButton';
import {makeStyles} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import HelpIcon from '@material-ui/icons/HelpOutline';
import TourIcon from '@material-ui/icons/Slideshow';
import React from 'react';
import { useTour } from '@reactour/tour';
import {getHelpBasePath} from '../utils/utils';


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
	const { setIsOpen, setCurrentStep } = useTour();

	if (medium || small) {
		return null;
	}

	const getHelpContext = () => {
		// let link = 'https://docs.cedalo.com/management-center';
		const basePath = getHelpBasePath();
		let link = `${basePath}mosquitto/next/management-center/overview/`;
		const path = location.pathname.split('/');

		if (path.length < 2) {
			return `${basePath}mosquitto/next/management-center/introduction/`;
		}

		switch (path[1]) {
		case 'home':
			link += 'inspection/mc-system';
			break;
		case 'topics':
			link += 'inspection/mc-topics';
			break;
		case 'clientinspection':
			link += 'inspection/mc-clientinspection';
			break;
		case 'clients':
		case 'groups':
		case 'roles':
		case 'streams':
		case 'terminal':
		case 'connections':
		case 'clusters':
			link += `configuration/mc-${path[1]}`;
			break;
		case 'certs':
			link += `configuration/mc-certificates`;
			break;
		case 'user-groups':
		case 'users':
		case 'settings':
		case 'tokens':
			link += `administration/mc-${path[1]}`;
			break;
		case 'info':
			link += `admimistration/mc-information`;
			break;
		default:
			link = `${basePath}mosquitto/next/management-center/introduction/`;
			break;
		}

		return link;
	}

	return <>
		<Tooltip title="Start tour">
			<IconButton
				edge="end"
				aria-label="Tour"
				aria-controls="tour"
				aria-haspopup="true"
				onClick={() => {
					// props.onStartTour()
					setCurrentStep(0);
					setIsOpen(true);
				}}
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
				onClick={() => window.open(getHelpContext(), '_blank')}
				className={classes.toolbarButton}
			>
				<HelpIcon fontSize="small"/>
			</IconButton>
		</Tooltip>
	</>
};
