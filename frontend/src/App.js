import React from "react";
import clsx from "clsx";
import { Provider, useSelector, useDispatch } from 'react-redux';
import { makeStyles, useTheme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import GroupIcon from "@material-ui/icons/Group";
import PersonIcon from "@material-ui/icons/Person";
import PolicyIcon from "@material-ui/icons/Policy";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import SettingsIcon from "@material-ui/icons/Settings";
import SvgIcon from '@material-ui/core/SvgIcon';
import StreamsIcon from '@material-ui/icons/SettingsInputAntenna';
import TopicTreeIcon from '@material-ui/icons/AccountTree';
import Container from "@material-ui/core/Container";
import Groups from "./components/Groups";
import Policies from "./components/Policies";
import Settings from "./components/Settings";
import Streams from "./components/Streams";
import System from "./components/System";
import TopicTree from "./components/TopicTree";
import Users from "./components/Users";
import store from "./store";
import WebSocketProvider, { WebSocketContext } from './websockets/WebSocket';

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

export default function App() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Router>
		<Provider store={store}>
      <div className={classes.root}>
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
          </Toolbar>
        </AppBar>
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
          <Divider />
          <List>
            <ListItemLink to="/users" primary="Users" icon={<PersonIcon />} />
            <ListItemLink to="/groups" primary="Groups" icon={<GroupIcon />} />
            <ListItemLink
              to="/policies"
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
              to="/system"
              primary="System Status"
              icon={<EqualizerIcon />}
            />
            <ListItemLink
              to="/topics"
              primary="Topic Tree"
              icon={<TopicTreeIcon />}
            />
            <ListItemLink
              to="/settings"
              primary="Settings"
              icon={<SettingsIcon />}
            />
          </List>
        </Drawer>
        <Container className={classes.container}>
          <Switch>
            <Route path="/users">
				<Users />
			</Route>
            <Route path="/groups">
				<Groups />
			</Route>
            <Route path="/policies">
				<Policies />
			</Route>
            <Route path="/streams">
				<Streams />
			</Route>
			<Route path="/system">
				<System />
			</Route>
            <Route path="/topics">
				<TopicTree />
			</Route>
            <Route path="/settings">
				<Settings />
			</Route>
          </Switch>
        </Container>
      </div>
	  </Provider>
    </Router>
  );
}
