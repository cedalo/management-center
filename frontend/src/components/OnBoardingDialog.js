import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { emphasize, makeStyles, useTheme } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import Select from 'react-select';
import Slide from '@material-ui/core/Slide';
import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import SubscribedIcon from '@material-ui/icons/CheckCircle';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { green } from '@material-ui/core/colors';
import useLocalStorage from '../helpers/useLocalStorage';
import { WebSocketContext } from '../websockets/WebSocket';
import { updateSettings } from '../actions/actions';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
		minWidth: 290,
		width: 550
	},
	input: {
		display: 'flex',
		padding: 0,
		height: 'auto'
	},
	valueContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		flex: 1,
		alignItems: 'center',
		overflow: 'hidden',
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
	chip: {
		margin: theme.spacing(1, 1)
	},
	chipFocused: {
		backgroundColor: emphasize(
			theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
			0.08
		)
	},
	noOptionsMessage: {
		padding: theme.spacing(1, 2)
	},
	singleValue: {
		fontSize: 16
	},
	placeholder: {
		position: 'absolute',
		left: 2,
		bottom: 6,
		fontSize: 16
	},
	paper: {
		position: 'absolute',
		zIndex: 1,
		marginTop: theme.spacing(1),
		left: 0,
		right: 0
	},
	divider: {
		height: theme.spacing(2)
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		height: 50,
		paddingLeft: theme.spacing(4),
		backgroundColor: theme.palette.background.default
	},
	img: {
		height: 255,
		// maxWidth: 400,
		overflow: 'hidden',
		// display: 'block',
		width: '100%'
	}
}));

function getSteps() {
	return [
		{
			label: 'Management Center for Eclipse Mosquitto',
			description: 'Manage everything in one central place',
			imgPath: '/onboarding-broker.png'
		},
		{
			label: 'Role based access control',
			description: 'Manage clients, groups and roles',
			imgPath: '/onboarding-dynamic-security.png'
		},
		{
			label: 'Metrics Dashboard',
			description: 'Analyze the system status of your brokers',
			imgPath: '/onboarding-dashboard.png'
		},
		{
			label: 'Topic Tree Inspector',
			description: 'Visualize and inspect MQTT topics',
			imgPath: '/onboarding-topic-tree.png'
		},
		{
			label: 'Subscribe to our newsletter',
			description: 'Get the latest news about Mosquitto, MQTT and Streamsheets.',
			imgPath: '/onboarding-newsletter.png',
			newsletter: true
		},
		{
			label: 'Usage data',
			description: 'We are continuously improving our software. For that it would be really great if you would allow the tracking of anonymous usage data.',
			imgPath: '/onboarding-dashboard.png',
			usageData: true
		}
	];
}

const OnBoardingDialog = ({ settings }) => {
	const classes = useStyles();
	const theme = useTheme();
	const { enqueueSnackbar } = useSnackbar();
	const dispatch = useDispatch();
	const context = useContext(WebSocketContext);
	const { client: brokerClient } = context;
	const [activeStep, setActiveStep] = React.useState(0);
	const [email, setEMail] = React.useState('');
	const [subscribed, setSubscribed] = useLocalStorage('cedalo.managementcenter.subscribedToNewsletter');
	const steps = getSteps();
	const [showOnBoardingDialog, setShowOnBoardingDialog] = useLocalStorage(
		'cedalo.managementcenter.showOnBoardingDialog'
	);

	const onChangeAllowTrackingUsageData = async (allowTrackingUsageData) => {
		try {
			const updatedSettings = await brokerClient.updateSettings({
				allowTrackingUsageData
			});
			dispatch(updateSettings(updatedSettings));
		} catch (error) {
			enqueueSnackbar(`Error disconnecting broker. Reason: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
		}
	};

	const handleClose = () => {
		setShowOnBoardingDialog('false');
	};

	const handleNext = () => {
		if (activeStep + 1 < steps.length) {
			setActiveStep((prevActiveStep) => prevActiveStep + 1);
		} else {
			handleClose();
		}
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleReset = () => {
		setActiveStep(0);
	};

	const subscribeNewsletter = async () => {
		try {
			const response = await fetch(`/api/newsletter/subscribe`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email
				})
			});
			setSubscribed('true');
		} catch (error) {
			// TODO: add error handling
			console.error(error);
		}
	};

	return (
		<Dialog
			open={showOnBoardingDialog === '' || showOnBoardingDialog === 'true'}
			// onClose={handleClose}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			{/* <DialogTitle id="alert-dialog-title">{steps[activeStep].label}</DialogTitle> */}
			<DialogContent>
				{/* <Paper square elevation={0} className={classes.header}>
      </Paper> */}
				<div style={{ textAlign: 'center' }}>
					<img
						style={{ width: '555px' }}
						className={classes.img}
						src={steps[activeStep].imgPath}
						alt={steps[activeStep].label}
					/>
				</div>
				<br />

				<Typography variant="h6" style={{ textAlign: 'center' }}>
					<strong>{steps[activeStep].label}</strong>
				</Typography>
				<Typography style={{ textAlign: 'center' }}>{steps[activeStep].description}</Typography>

				{steps[activeStep].newsletter && subscribed !== 'true' ? (
					<div style={{ textAlign: 'center' }}>
						<Grid container spacing={3} alignItems="flex-end">
							<Grid item xs={9}>
								<TextField
									id="email"
									label="E-Mail"
									type="email"
									value={email}
									onChange={(event) => {
										event.stopPropagation();
										setEMail(event.target.value);
									}}
									style={{
										width: '100%'
									}}
								/>
							</Grid>
							<Grid item xs={3}>
								<Button
									disabled={email === ''}
									onClick={subscribeNewsletter}
									variant="contained"
									color="primary"
								>
									Subscribe
								</Button>
							</Grid>
						</Grid>
					</div>
				) : null}
				{steps[activeStep].newsletter && subscribed === 'true' ? (
					<div style={{ textAlign: 'center' }}>
						<SubscribedIcon style={{ color: green[500] }} />
						<Typography>
							<strong>Thanks for subscribing!</strong>
						</Typography>
					</div>
				) : null}

				{steps[activeStep].usageData ? (
					<div style={{ textAlign: 'center' }}>
						<Grid container spacing={3} alignItems="flex-end">
							<Grid item xs={12}>
								<FormGroup row>
									<FormControlLabel
										control={
											<Switch
												checked={settings?.allowTrackingUsageData}
												onClick={(event) => {
													event.stopPropagation();
													if (event.target.checked) {
														onChangeAllowTrackingUsageData(true);
													} else {
														onChangeAllowTrackingUsageData(false);
													}
												}}
												name="allowTrackingUsageData"
												color="primary"
											/>
										}
										label="Allow tracking of usage data"
									/>
								</FormGroup>
							</Grid>
						</Grid>
					</div>
				) : null}

				<DialogContentText id="alert-dialog-description"></DialogContentText>

				<MobileStepper
					steps={6}
					activeStep={activeStep}
					variant="dots"
					position="static"
					className={classes.root}
					nextButton={
						<Button size="small" onClick={handleNext} disabled={activeStep + 1 >= steps.length}>
							Next
							{theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
						</Button>
					}
					backButton={
						<Button size="small" onClick={handleBack} disabled={activeStep === 0}>
							{theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
							Back
						</Button>
					}
				>
					{steps.map((label, index) => (
						<Step key={label}>
							<StepLabel>{label}</StepLabel>
							<StepContent>
								<div className={classes.actionsContainer}>
									<div>
										<Button
											disabled={activeStep === 0}
											onClick={handleBack}
											className={classes.button}
										>
											Back
										</Button>
										<Button
											variant="contained"
											color="primary"
											onClick={handleNext}
											className={classes.button}
										>
											{activeStep === 5 ? 'Finish' : 'Next'}
										</Button>
									</div>
								</div>
							</StepContent>
						</Step>
					))}
				</MobileStepper>
				{activeStep === steps.length && (
					<Paper square elevation={0} className={classes.resetContainer}>
						<Typography>All steps completed - you&apos;re finished</Typography>
						<Button onClick={handleReset} className={classes.button}>
							Reset
						</Button>
					</Paper>
				)}
			</DialogContent>
			<DialogActions>
				{/* <Button onClick={handleClose} color="primary">
            Disagree
          </Button> */}
				<Button onClick={handleClose} color="secondary" autoFocus>
					Get started!
				</Button>
			</DialogActions>
		</Dialog>
	);
}

const mapStateToProps = (state) => {
	return {
		settings: state.settings?.settings
	};
};

export default connect(mapStateToProps)(OnBoardingDialog);
