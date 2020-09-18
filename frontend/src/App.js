import React from "react";
import clsx from "clsx";
import { Provider, useSelector, useDispatch } from "react-redux";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
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
import PolicyIcon from "@material-ui/icons/Policy";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import SettingsIcon from "@material-ui/icons/Settings";
import SvgIcon from "@material-ui/core/SvgIcon";
import StreamsIcon from "@material-ui/icons/SettingsInputAntenna";
import TopicTreeIcon from "@material-ui/icons/AccountTree";
import Container from "@material-ui/core/Container";
import BrokerSelect from "./components/BrokerSelect";
import Logo from "./components/Logo";
import Groups from "./components/Groups";
import Hidden from "@material-ui/core/Hidden";
import Home from "./components/Home";
import Security from "./components/Security";
import System from "./components/System";
import Login from "./components/Login";
import Policies from "./components/Policies";
import Settings from "./components/Settings";
import Streams from "./components/Streams";
import Status from "./components/Status";
import TopicTree from "./components/TopicTree";
import Users from "./components/Users";
import store from "./store";
import WebSocketProvider, { WebSocketContext } from "./websockets/WebSocket";
import NewsDrawer from "./components/NewsDrawer";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouterLink,
} from "react-router-dom";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  container: {
    paddingTop: "100px",
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
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  rightToolbar: {
    marginLeft: "auto",
    marginRight: -12
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

function ListItemLink(props) {
  const { icon, primary, to } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button component={renderLink}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

export default function App(props) {
	const { window } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const container = window !== undefined ? () => window().document.body : undefined;

  const drawer = (
    <div>
      <Divider />
      <List>
        <ListItemLink to="/" primary="Home" icon={<HomeIcon />} />
        <Divider />
      </List>
      <List>
        <ListItemLink
          to="/security/users"
          primary="Users"
          icon={<PersonIcon />}
        />
        <ListItemLink
          to="/security/groups"
          primary="Groups"
          icon={<GroupIcon />}
        />
        <ListItemLink
          to="/security/policies"
          primary="Policies"
          icon={<PolicyIcon />}
        />
      </List>
      <Divider />
      <List>
        <ListItemLink to="/streams" primary="Streams" icon={<StreamsIcon />} />
      </List>
      <Divider />
      <List>
        <ListItemLink
          to="/system/status"
          primary="System Status"
          icon={<EqualizerIcon />}
        />
        <ListItemLink
          to="/system/topics"
          primary="Topic Tree"
          icon={<TopicTreeIcon />}
        />
        <ListItemLink
          to="/system/configurations"
          primary="Configurations"
          icon={<ConfigurationIcon />}
        />
        <ListItemLink
          to="/system/settings"
          primary="Settings"
          icon={<SettingsIcon />}
        />
      </List>
    </div>
  );

  return (
    <Router>
      <Provider store={store}>
        <WebSocketProvider>
          <div className={classes.root}>
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
					 	Mosquitto UI
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
                      Mosquitto UI
                    </Typography>
                    <section className={classes.rightToolbar}>
                      <BrokerSelect />
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
                    <Route path="/security/users/detail">
                      <UserDetail />
                    </Route>
                    <Route path="/security/users">
                      <Users />
                    </Route>
                    <Route path="/security/groups/detail">
                      <GroupDetail />
                    </Route>
                    <Route path="/security/groups">
                      <Groups />
                    </Route>
                    <Route path="/security/policies/detail">
                      <PolicyDetail />
                    </Route>
                    <Route path="/security/policies">
                      <Policies />
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
                    <Route path="/">
                      <Home />
                    </Route>
                  </Switch>
                </Container>
              </Route>
            </Switch>
          </div>
        </WebSocketProvider>
      </Provider>
    </Router>
  );
}
