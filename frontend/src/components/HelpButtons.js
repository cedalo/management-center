import {MenuList} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import {makeStyles} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import HelpIcon from '@material-ui/icons/HelpOutline';
import TourIcon from '@material-ui/icons/Slideshow';
import React, {useState} from 'react';
import { useTour } from '@reactour/tour';
import {getHelpBasePath} from '../utils/utils';
import apptour from '../tutorial/apptour';
import admintour from '../tutorial/admintour';


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
	const { setIsOpen, setSteps, setCurrentStep } = useTour();
	const [anchorEl, setAnchorEl] = useState(null);
	const [popup, setPopup] = useState(false);

	if (medium || small) {
		return null;
	}

	const getHelpContext = () => {
		// let link = 'https://docs.cedalo.com/management-center';
		const basePath = getHelpBasePath();
		let link = `${basePath}mosquitto/management-center/overview/`;
		const path = location.pathname.split('/');

		if (path.length < 2) {
			return `${basePath}mosquitto/management-center/introduction/`;
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
		case 'test':
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
		case 'profile':
			link += `/mc-user-profile`;
			break;
		case 'info':
			link += `administration/mc-information`;
			break;
		default:
			link = `${basePath}mosquitto/management-center/introduction/`;
			break;
		}

		return link;
	}

	const onShowPopup = (event) => {
		// This prevents ghost click.
		event.preventDefault();
		setAnchorEl(event.currentTarget);
		setPopup(true);
	};

	const onClosePopup = () => {
		setAnchorEl(null);
		setPopup(false);
	};

	return <>
		<Tooltip title="Select an Introduction Tour">
			<IconButton
				edge="end"
				aria-label="Tour"
				aria-controls="tour"
				aria-haspopup="true"
				onClick={(event) => {
					onShowPopup(event, )
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
		<Popover
			key="popNumber"
			open={popup}
			anchorEl={anchorEl}
			anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
			transformOrigin={{ horizontal: 'left', vertical: 'top' }}
			onClose={onClosePopup}
		>
			<MenuList>
				<MenuItem
					key="tourbeginner"
					dense
					onClick={(event) => {
						onClosePopup();
						event.preventDefault();
						setSteps(apptour);
						setCurrentStep(0, apptour);
						setIsOpen(true);
					}}
				>
					Broker Configuration
				</MenuItem>
				<MenuItem
					key="tourapps"
					dense
					onClick={(event) => {
						onClosePopup();
						event.preventDefault();
						setSteps(admintour);
						setCurrentStep(0, admintour);
						setIsOpen(true);
					}}
				>
					Management Center Configuration
				</MenuItem>
			</MenuList>
		</Popover>

	</>
};
