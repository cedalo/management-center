import React from 'react';
import { SnackbarProvider } from 'notistack';
import clsx from 'clsx';
import { Provider, useSelector, useDispatch } from 'react-redux';
import Joyride from 'react-joyride';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import TourIcon from '@material-ui/icons/Slideshow';
import ThemeModeIcon from '@material-ui/icons/Brightness4';
import Container from '@material-ui/core/Container';
import { ConfirmProvider } from 'material-ui-confirm';
import LogoutButton from './components/LogoutButton';
import ProfileButton from './components/ProfileButton';
import LicenseErrorDialog from './components/LicenseErrorDialog';
import DisconnectedDialog from './components/DisconnectedDialog';
import BrokerSelect from './components/BrokerSelect';
import InfoButton from './components/InfoButton';
import customTheme from './theme';
import darkTheme from './theme-dark';
import NewsletterPopup from './components/NewsletterPopup';
// import Login from "./components/Login";
import store from './store';
import WebSocketProvider from './websockets/WebSocket';
// import NewsDrawer from "./components/NewsDrawer";
import useFetch from './helpers/useFetch';
import useLocalStorage from './helpers/useLocalStorage';
import OnBoardingDialog from './components/OnBoardingDialog';
import steps from './tutorial/steps';

import { BrowserRouter as Router, Switch, Route, Link as RouterLink, Redirect } from 'react-router-dom';
import CustomDrawer from './components/CustomDrawer';
import AppRoutes from './AppRoutes';

const tourOptions = {
	defaultStepOptions: {
		cancelIcon: {
			enabled: true
		}
	},
	useModalOverlay: true
};

const drawerWidth = 240;

const file =
	'data:image/png;base64,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';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex'
	},
	container: {
		paddingTop: '100px'
	},
	logo: {
		width: '80px',
		verticalAlign: 'middle',
		marginRight: '9px',
		marginBottom: '5px'
	},
	appBar: {
		zIndex: theme.zIndex.drawer + 1,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		})
	},
	appBarShift: {
		marginLeft: drawerWidth,
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen
		})
	},
	menuButton: {
		marginRight: 36
	},
	hide: {
		display: 'none'
	},
	rightToolbar: {
		marginLeft: 'auto',
		marginRight: -12,
		alignItems: 'center',
		alignContent: 'center'
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120
	},
	toolbarButton: {
		marginTop: theme.spacing(0.8),
		marginBottom: theme.spacing(0.2)
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3)
	},
	bottom: {
		width: 500
	}
}));

export default function App(props) {
	// const { window } = props;
	const classes = useStyles();
	const theme = useTheme();
	const [open, setOpen] = React.useState(false);
	const [showTour, setShowTour] = React.useState(false);
	const [value, setValue] = React.useState('recents');
	const [darkMode, setDarkMode] = useLocalStorage('cedalo.managementcenter.darkMode');

	const [response, loading, hasError] = useFetch(`${process.env.PUBLIC_URL}/api/theme`);
	const [responseConfig, loadingConfig, hasErrorConfig] = useFetch(`${process.env.PUBLIC_URL}/api/config`);

	if ((hasError || response) && (hasErrorConfig || responseConfig)) {
		let appliedTheme = darkMode === 'true' ? darkTheme : customTheme;
		let hideConnections = (typeof responseConfig?.hideConnections === 'boolean') ? responseConfig?.hideConnections : false;
		let hideInfoPage = (typeof responseConfig?.hideInfoPage === 'boolean') ? responseConfig?.hideInfoPage : false;
		let hideLogoutButton = (typeof responseConfig?.hideLogoutButton === 'boolean') ? responseConfig?.hideLogoutButton : false;
		let hideProfileButton = (typeof responseConfig?.hideProfileButton === 'boolean') ? responseConfig?.hideProfileButton : false;
		const onChangeTheme = () => {
			setDarkMode(darkMode === 'true' ? 'false' : 'true');
		};

		const handleStartTour = () => {
			setOpen(true);
			setShowTour(true);
		};

		if (response) {
			customTheme.palette.primary.main = response?.light?.palette?.primary?.main;
			customTheme.palette.secondary.main = response?.light?.palette?.secondary?.main;
			darkTheme.palette.primary.main = response?.dark?.palette?.primary?.main;
			darkTheme.palette.secondary.main = response?.dark?.palette?.secondary?.main;
			if (response?.dark?.palette?.background?.default) {
				darkTheme.palette.background.default = response?.dark?.palette?.background?.default;
			}
			if (response?.dark?.palette?.background?.paper) {
				darkTheme.palette.background.paper = response?.dark?.palette?.background?.paper;
			}
			if (response?.dark?.palette?.text) {
				darkTheme.palette.text.primary = response?.dark?.palette?.text?.primary;
			}
			if (response?.dark?.palette?.tables) {
				darkTheme.palette.tables = response?.dark?.palette?.tables;
			}
			if (response?.dark?.palette?.dashboard) {
				darkTheme.palette.dashboard = response?.dark?.palette?.dashboard;
			}
			if (response?.light?.palette?.dashboardIcons) {
				customTheme.palette.dashboard = response?.light?.palette?.dashboard;
			}
			if (response?.dark?.palette?.drawer) {
				darkTheme.palette.drawer = response?.dark?.palette?.drawer;
			}
		}

		const onTourStateChange = (event) => {
			if (event.action === 'close' || event.action === 'reset') {
				// TODO: this is a hack to prevent the
				// strange main menu behavior when the
				// in app tour selects the menu items
				window.location.reload();
			}
		};

		const handleChange = (event, newValue) => {
			setValue(newValue);
		};

		const handleDrawerOpen = () => {
			setOpen(true);
		};

		const handleDrawerClose = () => {
			setOpen(false);
		};

		//   const container = window !== undefined ? () => window().document.body : undefined;

		return (
			<ThemeProvider theme={appliedTheme}>
				<SnackbarProvider>
				<Joyride
					run={showTour}
					continuous={true}
					//   getHelpers={this.getHelpers}
					scrollToFirstStep={true}
					showProgress={true}
					showSkipButton={true}
					steps={steps}
					callback={onTourStateChange}
					styles={{
						options: {
							zIndex: 5000
						}
					}}
				/>
				<ConfirmProvider>
					<CssBaseline />
					<Router basename={process.env.PUBLIC_URL}>
						<Provider store={store}>
							<WebSocketProvider>
								<div className={classes.root}>
									<NewsletterPopup />
									<OnBoardingDialog />
									<Switch>
										<Route path="/login">
											<AppBar
												position="fixed"
												className={clsx(classes.appBar, {
													[classes.appBarShift]: open
												})}
											>
												<Toolbar>
													<Typography variant="h6" noWrap></Typography>
												</Toolbar>
											</AppBar>
											{/* <Container className={classes.container}>
					<Login />
				  </Container> */}
										</Route>
										<Route path="/">
											<AppBar
												position="fixed"
												className={clsx(classes.appBar, {
													[classes.appBarShift]: open
												})}
											>
												<Toolbar>
													<IconButton
														color="inherit"
														aria-label="open drawer"
														onClick={handleDrawerOpen}
														edge="start"
														className={clsx(classes.menuButton, {
															[classes.hide]: open
														})}
													>
														<MenuIcon />
													</IconButton>
													<Typography noWrap>
														<img
															className={clsx(classes.logo)}
															src={
																darkMode === 'true'
																	? response?.dark?.logo?.path || file
																	: response?.light?.logo?.path || file
															}
															style={
																response?.light?.logo?.height &&
																response?.light?.logo?.width && {
																	height: response?.light?.logo?.height,
																	width: response?.light?.logo?.width
																}
															}
														/>
													</Typography>
													<section className={classes.rightToolbar}>
														<BrokerSelect />
														<Tooltip title="Switch mode">
															<IconButton
																edge="end"
																aria-label="Theme Mode"
																aria-controls="theme-mode"
																aria-haspopup="true"
																onClick={() => onChangeTheme()}
																color="inherit"
																className={classes.toolbarButton}
															>
																<ThemeModeIcon fontSize="small" />
															</IconButton>
														</Tooltip>
														{ !hideInfoPage ? <InfoButton /> : null }
														<Tooltip title="Start tour">
															<IconButton
																edge="end"
																aria-label="Tour"
																aria-controls="tour"
																aria-haspopup="true"
																onClick={() => handleStartTour()}
																color="inherit"
																className={classes.toolbarButton}
															>
																<TourIcon fontSize="small" />
															</IconButton>
														</Tooltip>

														{ !hideProfileButton ? <ProfileButton /> : null }
														{ !hideLogoutButton ? <LogoutButton /> : null }

														{/* <IconButton
						  edge="end"
						  aria-label="Notifications"
						  aria-controls="notifications"
						  aria-haspopup="true"
						  // onClick={() => setDarkMode(!darkMode)}
						  color="inherit"
						  className={classes.toolbarButton}
						  >
							  <NotificationsIcon />
						  </IconButton> */}
													</section>
												</Toolbar>
											</AppBar>
											{/* <NewsDrawer /> */}

											<nav>
												{/* <Hidden xsDown implementation="css"> */}
												<CustomDrawer hideConnections={hideConnections} open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose} />
											</nav>
											<LicenseErrorDialog />
											<DisconnectedDialog />

											<Container className={classes.container}>											
												<AppRoutes />
											</Container>
										</Route>
									</Switch>
								</div>
							</WebSocketProvider>
						</Provider>
					</Router>
				</ConfirmProvider>
				</SnackbarProvider>
			</ThemeProvider>
		);
	} else {
		return null;
	}
}
