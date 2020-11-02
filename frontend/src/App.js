import React, { useState } from "react";
import clsx from "clsx";
import { Provider, useSelector, useDispatch } from "react-redux";
import Joyride from 'react-joyride';
import { fade, makeStyles, useTheme } from "@material-ui/core/styles";
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from '@material-ui/core/Tooltip';
import Typography from "@material-ui/core/Typography";
import Badge from '@material-ui/core/Badge';
import Button from "@material-ui/core/Button";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";
import Link from '@material-ui/core/Link';
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import GroupIcon from "@material-ui/icons/Group";
import HomeIcon from "@material-ui/icons/Home";
import PersonIcon from "@material-ui/icons/Person";
import RoleIcon from "@material-ui/icons/Policy";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import SettingsIcon from "@material-ui/icons/Settings";
import TourIcon from '@material-ui/icons/Slideshow';
import ThemeModeIcon from '@material-ui/icons/Brightness4';
import NotificationsIcon from '@material-ui/icons/Notifications';
import SvgIcon from "@material-ui/core/SvgIcon";
import ConfigurationIcon from '@material-ui/icons/Tune';
import StreamsIcon from "@material-ui/icons/SettingsInputAntenna";
import TopicTreeIcon from "@material-ui/icons/AccountTree";
import Container from "@material-ui/core/Container";
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import FolderIcon from '@material-ui/icons/Folder';
import RestoreIcon from '@material-ui/icons/Restore';
import FavoriteIcon from '@material-ui/icons/Favorite';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Hidden from "@material-ui/core/Hidden";
import { ConfirmProvider } from 'material-ui-confirm';
import Logo from "./components/Logo";
import DisconnectedDialog from "./components/DisconnectedDialog";
import Groups from "./components/Groups";
import BrokerSelect from "./components/BrokerSelect";
import InfoButton from "./components/InfoButton";
import customTheme from './theme';
import darkTheme from './theme-dark';
import Home from "./components/Home";
import Security from "./components/Security";
import System from "./components/System";
import InfoPage from "./components/InfoPage";
// import Login from "./components/Login";
import Roles from "./components/Roles";
import Configurations from "./components/Configurations";
import Settings from "./components/Settings";
import Streams from "./components/Streams";
import Status from "./components/Status";
import TopicTree from "./components/TopicTree";
import GroupDetail from "./components/GroupDetail";
import RoleDetail from "./components/RoleDetail";
import ClientDetail from "./components/ClientDetail";
import GroupNew from "./components/GroupNew";
import ClientNew from "./components/ClientNew";
import RoleNew from "./components/RoleNew";
import Clients from "./components/Clients";
import store from "./store";
import WebSocketProvider, { WebSocketContext } from "./websockets/WebSocket";
// import NewsDrawer from "./components/NewsDrawer";
import useFetch from "./helpers/useFetch";
import useLocalStorage from "./helpers/useLocalStorage";
import OnBoardingDialog from "./components/OnBoardingDialog";
import steps from "./tutorial/steps";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouterLink,
  Redirect,
} from "react-router-dom";

const tourOptions = {
	defaultStepOptions: {
	  cancelIcon: {
		enabled: true
	  }
	},
	useModalOverlay: true
  };

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
	display: "flex",
  },
  container: {
    paddingTop: "100px",
  },
  logo: {
	width: "80px",
	verticalAlign: "middle",
	marginRight: "9px",
	marginBottom: "5px",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
	padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  },
  rightToolbar: {
    marginLeft: "auto",
	marginRight: -12,
	alignItems: "center",
	alignContent: "center",
  },
  menuItem: {
	  fontSize: '14px',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  toolbarButton: {
    marginTop: theme.spacing(0.8),
    marginBottom: theme.spacing(0.2),
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  bottom: {
	width: 500,
  }
}));

function ListItemLink(props) {
  const { id, icon, primary, to, classes } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li id={id} >
      <ListItem button component={renderLink} >
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} classes={{primary:classes.menuItem}} />
      </ListItem>
    </li>
  );
}

export default function App(props) {

	// const { window } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [showTour, setShowTour] = React.useState(false);
  const [value, setValue] = React.useState('recents');
  const [darkMode, setDarkMode] = useLocalStorage('mosquitto-ui.darkMode');
  // TODO: make URL relative
  const [response, loading, hasError] = useFetch("http://localhost:8088/api/theme");

  if (response) {

	let appliedTheme = darkMode === 'true' ? darkTheme : customTheme;

	const onChangeTheme = () => {
		setDarkMode(darkMode === 'true' ? 'false' : 'true');
	}
  
	const handleStartTour = () => {
		setOpen(true);
		setShowTour(true);
	}
  
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
	}
  
	const onTourStateChange = (event) => {
		console.log(event)
		if (event.action === 'close' || event.action === 'reset') {
			// TODO: this is a hack to prevent the 
			// strange main menu behavior when the 
			// in app tour selects the menu items
			window.location.reload();
		}
	}
  
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
  
	const drawer = (
	  <div>
		<Divider />
		<List>
		  <ListItemLink
			id="menu-item-home"
			classes={classes}
			to="/home"
			primary="Home"
			icon={<HomeIcon />
		  } />
		</List>
		<Divider />
		<List>
		  <ListItemLink
			id="menu-item-status"
			classes={classes} 
			to="/system/status"
			primary="System Status"
			icon={<EqualizerIcon />}
		  />
		  <ListItemLink
			id="menu-item-topics" 
			classes={classes} 
			to="/system/topics"
			primary="Topic Tree"
			icon={<TopicTreeIcon />}
		  />
		</List>
		<Divider />
		<List>
		  <ListItemLink
			id="menu-item-clients" 
			classes={classes} 
			to="/security/clients"
			primary="Clients"
			icon={<PersonIcon />}
		  />
		  <ListItemLink
			id="menu-item-groups" 
			classes={classes} 
			to="/security/groups"
			primary="Groups"
			icon={<GroupIcon />}
		  />
		  <ListItemLink
			id="menu-item-roles" 
			classes={classes} 
			to="/security/roles"
			primary="Roles"
			icon={<RoleIcon />}
		  />
		</List>
		<Divider />
		{/* <List>
		  <ListItemLink 
			classes={classes}
			to="/streams"
			primary="🚧 Streams"
			icon={<StreamsIcon />}
		  />
		</List>
		<Divider /> */}
		<List>
		  <ListItemLink
			classes={classes} 
			to="/system/configurations"
			primary="Configurations"
			icon={<ConfigurationIcon />}
		  />
		  <ListItemLink
			classes={classes} 
			to="/system/settings"
			primary="Settings"
			icon={<SettingsIcon />}
		  />
		</List>
	  </div>
	);
  
	return (
  
		  <ThemeProvider theme={appliedTheme} >
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
			  zIndex: 5000,
			},
		  }}
		/>
	  <ConfirmProvider>
		<CssBaseline />
	  <Router>
		<Provider store={store} >
		  <WebSocketProvider>
			<div className={classes.root} >
				<OnBoardingDialog />
			  <Switch>
				<Route path="/login">
  
				<AppBar
					position="fixed"
					className={clsx(classes.appBar, {
					  [classes.appBarShift]: open,
					})}
				  >
					<Toolbar>
					  <Typography variant="h6" noWrap>
						   {/* Mosquitto UI */}
					  </Typography>
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
					  [classes.appBarShift]: open,
					})}
				  >
					<Toolbar>
					  <IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={handleDrawerOpen}
						edge="start"
						className={clsx(classes.menuButton, {
						  [classes.hide]: open,
						})}
					  >
						<MenuIcon />
					  </IconButton>
					  <Typography variant="h6" noWrap>
						<img
							className={clsx(classes.logo)} 
							src={darkMode === 'true' ? response?.dark?.logo?.path : response?.light?.logo?.path} 
							style={response?.light?.logo?.height && response?.light?.logo?.width && {
								height: response?.light?.logo?.height, 
								width: response?.light?.logo?.width
						  }} 
						/>
						 {/* Mosquitto UI */}
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
								<ThemeModeIcon />
							</IconButton>
							</Tooltip>
							<InfoButton />
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
								<TourIcon />
							</IconButton>
						</Tooltip>
  
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
					  <Drawer
						variant="permanent"
						className={clsx(classes.drawer, {
						  [classes.drawerOpen]: open,
						  [classes.drawerClose]: !open,
						})}
						classes={{
						  paper: clsx({
							[classes.drawerOpen]: open,
							[classes.drawerClose]: !open,
						  }),
						}}
					  >
						<div className={classes.toolbar}>
						  <IconButton onClick={handleDrawerClose}>
							{theme.direction === "rtl" ? (
							  <ChevronRightIcon />
							) : (
							  <ChevronLeftIcon />
							)}
						  </IconButton>
						</div>
						{drawer}
					  </Drawer>
				  </nav>
		  <DisconnectedDialog />
			  
				  <Container className={classes.container}>
					<Switch>
					  <Route path="/security/clients/detail/:clientId" component={ClientDetail} />
					  <Route path="/security/clients/new">
						<ClientNew />
					  </Route>
					  <Route path="/security/clients">
						<Clients />
					  </Route>
					  <Route path="/security/groups/detail/:groupId" component={GroupDetail} />
					  <Route path="/security/groups/new">
						<GroupNew />
					  </Route>
					  <Route path="/security/groups">
						<Groups />
					  </Route>
					  <Route path="/security/roles/detail/:roleId" component={RoleDetail} />
					  <Route path="/security/roles/new">
						<RoleNew />
					  </Route>
					  <Route path="/security/roles">
						<Roles />
					  </Route>
					  <Route path="/security">
						<Security />
					  </Route>
					  <Route path="/streams">
						<Streams />
					  </Route>
					  <Route path="/system/status">
						<Status />
					  </Route>
					  <Route path="/system/topics">
						<TopicTree />
					  </Route>
					  <Route path="/system/configurations">
						<Configurations />
					  </Route>
					  <Route path="/system/settings">
						<Settings />
					  </Route>
					  <Route path="/system">
						<System />
					  </Route>
					  <Route path="/home">
						<Home />
					  </Route>
					  <Route path="/info">
						<InfoPage />
					  </Route>
					  <Route path="/">
						<Redirect to="/system/status" />
					  </Route>
					</Switch>
				  </Container>
				</Route>
			  </Switch>
			</div>
		  </WebSocketProvider>
		</Provider>
	  </Router>
	  </ConfirmProvider>
	</ThemeProvider>
	);
  } else {
	  return null;
  }

}
