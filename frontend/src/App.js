import React from "react";
import clsx from "clsx";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import GroupIcon from '@material-ui/icons/Group';
import PersonIcon from '@material-ui/icons/Person';
import PolicyIcon from '@material-ui/icons/Policy';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import SettingsIcon from '@material-ui/icons/Settings';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
	root: {
	  display: 'flex',
	},
	appBar: {
	  zIndex: theme.zIndex.drawer + 1,
	  transition: theme.transitions.create(['width', 'margin'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	  }),
	},
	appBarShift: {
	  marginLeft: drawerWidth,
	  width: `calc(100% - ${drawerWidth}px)`,
	  transition: theme.transitions.create(['width', 'margin'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	  }),
	},
	menuButton: {
	  marginRight: 36,
	},
	hide: {
	  display: 'none',
	},
	drawer: {
	  width: drawerWidth,
	  flexShrink: 0,
	  whiteSpace: 'nowrap',
	},
	drawerOpen: {
	  width: drawerWidth,
	  transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	  }),
	},
	drawerClose: {
	  transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	  }),
	  overflowX: 'hidden',
	  width: theme.spacing(7) + 1,
	  [theme.breakpoints.up('sm')]: {
		width: theme.spacing(9) + 1,
	  },
	},
	toolbar: {
	  display: 'flex',
	  alignItems: 'center',
	  justifyContent: 'flex-end',
	  padding: theme.spacing(0, 1),
	  // necessary for content to be below app bar
	  ...theme.mixins.toolbar,
	},
	content: {
	  flexGrow: 1,
	  padding: theme.spacing(3),
	},
  }));

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
    <div className={classes.root}>
		<CssBaseline />
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
			<ListItem button key={"Users"}>
				<ListItemIcon>
				<PersonIcon />
				</ListItemIcon>
				<ListItemText primary={"Users"} />
			</ListItem>
			<ListItem button key={"Groups"}>
				<ListItemIcon>
				<GroupIcon />
				</ListItemIcon>
				<ListItemText primary={"Groups"} />
			</ListItem>
			<ListItem button key={"Policies"}>
				<ListItemIcon>
				<PolicyIcon />
				</ListItemIcon>
				<ListItemText primary={"Policies"} />
			</ListItem>
        </List>
        <Divider />
        <List>
			<ListItem button key={"System Status"}>
				<ListItemIcon>
				<EqualizerIcon />
				</ListItemIcon>
				<ListItemText primary={"System Status"} />
			</ListItem>
			<ListItem button key={"Settings"}>
				<ListItemIcon>
				<SettingsIcon />
				</ListItemIcon>
				<ListItemText primary={"Settings"} />
			</ListItem>
        </List>
      </Drawer>
    </div>
  );
}
