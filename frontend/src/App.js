import React, { useState } from "react";
import clsx from "clsx";
import { Provider, useSelector, useDispatch } from "react-redux";
import { fade, makeStyles, useTheme } from "@material-ui/core/styles";
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
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
import Groups from "./components/Groups";
import BrokerSelect from "./components/BrokerSelect";
import InfoButton from "./components/InfoButton";
import customTheme from './theme';
import darkTheme from './theme-dark';
import Home from "./components/Home";
import Security from "./components/Security";
import System from "./components/System";
import InfoPage from "./components/InfoPage";
import Login from "./components/Login";
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
import NewsDrawer from "./components/NewsDrawer";
import useFetch from "./helpers/useFetch";
import useLocalStorage from "./helpers/useLocalStorage";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouterLink,
  Redirect,
} from "react-router-dom";

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
    margin: theme.spacing(1),
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
  const { icon, primary, to, classes } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button component={renderLink} >
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} classes={{primary:classes.menuItem}} />
      </ListItem>
    </li>
  );
}

// const useStateWithLocalStorage = localStorageKey => {
// 	const [value, setValue] = React.useState(
// 	  localStorage.getItem(localStorageKey) === 'true' || false
// 	);
   
// 	React.useEffect(() => {
// 	  localStorage.setItem(localStorageKey, value);
// 	}, [value]);
   
// 	return [value, setValue];
//   };

export default function App(props) {

	const { window } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('recents');
  const [darkMode, setDarkMode] = useLocalStorage('mosquitto-ui.darkMode');
  const [response, loading, hasError] = useFetch("http://localhost:8088/api/theme");

  let appliedTheme = darkMode === 'true' ? darkTheme : customTheme;

  const onChangeTheme = () => {
	  setDarkMode(darkMode === 'true' ? 'false' : 'true');
  }

  if (response) {
	appliedTheme.palette.primary.main = response?.primary?.main;
	appliedTheme.palette.secondary.main = response?.secondary?.main;
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
        <ListItemLink classes={classes} to="/home" primary="Home" icon={<HomeIcon />} />
        <Divider />
      </List>
      <List>
        <ListItemLink
		  classes={classes} 
          to="/security/clients"
          primary="Clients"
          icon={<PersonIcon />}
        />
        <ListItemLink
		  classes={classes} 
          to="/security/groups"
          primary="Groups"
          icon={<GroupIcon />}
        />
        <ListItemLink
		  classes={classes} 
          to="/security/roles"
          primary="🚧 Roles"
          icon={<RoleIcon />}
        />
      </List>
      <Divider />
      <List>
        <ListItemLink 
		  classes={classes}
		  to="/streams"
		  primary="🚧 Streams"
		  icon={<StreamsIcon />}
		/>
      </List>
      <Divider />
      <List>
        <ListItemLink
		  classes={classes} 
          to="/system/status"
          primary="System Status"
          icon={<EqualizerIcon />}
        />
        <ListItemLink
		  classes={classes} 
          to="/system/topics"
          primary="🚧 Topic Tree"
          icon={<TopicTreeIcon />}
        />
        <ListItemLink
		  classes={classes} 
          to="/system/configurations"
          primary="Configurations"
          icon={<ConfigurationIcon />}
        />
        <ListItemLink
		  classes={classes} 
          to="/system/settings"
          primary="🚧 Settings"
          icon={<SettingsIcon />}
        />
      </List>
    </div>
  );

  return (

		<ThemeProvider theme={appliedTheme} >
	<ConfirmProvider>
	  <CssBaseline />
    <Router>
      <Provider store={store} >
        <WebSocketProvider>
          <div className={classes.root} >
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
                <Container className={classes.container}>
                  <Login />
                </Container>
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
					  	src="https://cedalo.com/images/logo.png" 
					  	// src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Siemens_Energy_logo_white.svg/1200px-Siemens_Energy_logo_white.svg.png"
					  	// style={{height: '35px', width: '35px'}} src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Yello_Strom_GmbH.svg/2000px-Yello_Strom_GmbH.svg.png" 
					  />
					   {/* Mosquitto UI */}
                    </Typography>
                    <section className={classes.rightToolbar}>
                      <BrokerSelect />
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
					  <InfoButton />

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
                  {/* </Hidden> */}
                  {/* <Hidden smUp implementation="css">
                    <Drawer
                      container={container}
                      variant="temporary"
                      anchor={theme.direction === "rtl" ? "right" : "left"}
                      open={mobileOpen}
                    //   onClose={handleDrawerToggle}
                      classes={{
                        paper: classes.drawerPaper,
                      }}
                      ModalProps={{
                        keepMounted: true,
                      }}
                    >
                      {drawer}
                    </Drawer>
                  </Hidden> */}
                </nav>
			
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
}
