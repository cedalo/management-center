import React, { useContext } from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListSubheader from '@material-ui/core/ListSubheader';
import Drawer from '@material-ui/core/Drawer';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import { withRouter, BrowserRouter as Router, Switch, Route, Link as RouterLink, Redirect } from 'react-router-dom';
import PluginsIcon from '@material-ui/icons/Power';
import TerminalIcon from '@material-ui/icons/Computer';
import ConnectionsIcon from '@material-ui/icons/SettingsInputComponent';
import TopicTreeIcon from '@material-ui/icons/AccountTree';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import GroupIcon from '@material-ui/icons/Group';
import PersonIcon from '@material-ui/icons/Person';
import RoleIcon from '@material-ui/icons/Policy';
import UsersIcon from '@material-ui/icons/People';
import ClusterIcon from '@material-ui/icons/Storage';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import SettingsIcon from '@material-ui/icons/Settings';
import StreamsheetsIcon from '@material-ui/icons/GridOn';
import StreamsIcon from '@material-ui/icons/Timeline';

const drawerWidth = 240;

function ListItemLink(props) {
	const theme = useTheme();
	const { id, icon, primary, to = null, classes } = props;

	const renderLink = React.useMemo(
		() => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
		[to]
	);

	const isSelected = (to === location.pathname) || location.pathname.startsWith(`${to}/`);

	return (
		<li id={id}>

		<Tooltip title={primary}>
			<MenuItem
				button
				component={renderLink}
				selected={isSelected}
				classes={{
					root: classes.menuItemRoot,
					selected: classes.menuItemSelected
				}}
			>
				{icon ? <ListItemIcon style={{
					color: isSelected ? theme.palette.menuItem.color : ''
				}}>{icon}</ListItemIcon> : null}
				<ListItemText primary={primary} classes={{ 
					root: classes.menuItem,
					primary: classes.menuItem
				}} />
			</MenuItem>
			</Tooltip>
		</li>
	);
}

const access = (feature) => {
	if (!feature || feature?.error?.name === 'NotAuthorizedError') {
		return false;
	} else {
		return true;
	}
}
const dynamicSecurityAccess = (dynamicSecurityFeature) => access(dynamicSecurityFeature);
const userManagementAccess = (userManagementFeature) => access(userManagementFeature);
const clusterManagementAccess = (clusterManagementFeature) => access(clusterManagementFeature);

const useStyles = makeStyles((theme) => ({
	toolbar: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
		padding: theme.spacing(0, 1),
		...theme.mixins.toolbar
	},
	menuItem: {
		fontSize: '14px',
	  },
	menuItemRoot: {
		fontSize: '14px',
		"&$menuItemSelected, &$menuItemSelected:focus, &$menuItemSelected:hover": {
		  backgroundColor: "inherit"
		}
	  },
	menuItemSelected: {
		color: theme.palette.menuItem.color,
	},
	menuSubHeader: {
		// color: 'white',
		fontWeight: 'bold',
		fontSize: '12px',
		textTransform: 'uppercase',
		lineHeight: '24px'
	},
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
		whiteSpace: 'nowrap',
		backgroundColor: theme.palette.drawer?.backgroundColor
	},
	drawerOpen: {
		width: drawerWidth,
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen
		})
	},
	drawerClose: {
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		}),
		overflowX: 'hidden',
		width: theme.spacing(7) + 1,
		[theme.breakpoints.up('sm')]: {
			width: theme.spacing(7) + 1
		}
	},
}));

const CustomDrawer = ({ userProfile = {}, userManagementFeature, dynamicSecurityFeature, hideConnections, open, handleDrawerOpen, handleDrawerClose }) => {

	const classes = useStyles();
	const theme = useTheme();

	return <Drawer
		variant="permanent"
		className={clsx(classes.drawer, {
			[classes.drawerOpen]: open,
			[classes.drawerClose]: !open
		})}
		classes={{
			paper: clsx(classes.drawer, {
				[classes.drawerOpen]: open,
				[classes.drawerClose]: !open
			})
		}}
	>
		<div className={classes.toolbar}>
			<IconButton onClick={handleDrawerClose}>
				{theme.direction === 'rtl' ? (
					<ChevronRightIcon />
				) : (
					<ChevronLeftIcon />
				)}
			</IconButton>
		</div>
		<div>
			{/* <Divider />
	<List>
		<ListItemLink id="menu-item-home" classes={classes} to="/home" primary="Home" icon={<HomeIcon />} />
	</List> */}
			<Divider />
			<List>
				{open ? <ListSubheader className={classes.menuSubHeader}>Monitoring</ListSubheader> : null}
				<ListItemLink
					id="menu-item-status"
					classes={classes}
					to="/system/status"
					primary="System Status"
					icon={<EqualizerIcon fontSize="small" />}
				/>
				<ListItemLink
					id="menu-item-topics"
					classes={classes}
					to="/system/topics"
					primary="Topic Tree"
					icon={<TopicTreeIcon fontSize="small" />}
				/>
			</List>
			<Divider />
			{(userProfile?.isAdmin || userProfile?.isEditor) && <><List>
				{open ? <ListSubheader className={classes.menuSubHeader}>Dynamic Security</ListSubheader> : null}
				<ListItemLink
					id="menu-item-clients"
					classes={classes}
					to="/security/clients"
					primary="Clients"
					icon={<PersonIcon fontSize="small" />}
				/>
				<ListItemLink
					id="menu-item-groups"
					classes={classes}
					to="/security/groups"
					primary="Groups"
					icon={<GroupIcon fontSize="small" />}
				/>
				<ListItemLink
					id="menu-item-roles"
					classes={classes}
					to="/security/roles"
					primary="Roles"
					icon={<RoleIcon fontSize="small" />}
				/>
			</List>
			<Divider /></>}
			{/* <List>
<ListItemLink 
classes={classes}
to="/streams"
primary="🚧 Streams"
icon={<StreamsIcon />}
/>
</List>
<Divider /> */}

			<Divider />
			{userProfile?.isAdmin && <><List>
				{open ? <ListSubheader className={classes.menuSubHeader}>Management</ListSubheader> : null}
				<ListItemLink
					id="menu-item-plugins"
					classes={classes}
					to="/plugins"
					primary="Plugins"
					icon={<PluginsIcon fontSize="small" />}
				/>
				{/* <ListItemLink
classes={classes} 
to="/config/settings"
primary="Settings"
icon={<SettingsIcon />}
/> */}
			</List>
			<Divider /></>}
			<List id="menu-items-tools">
				{open ? <ListSubheader className={classes.menuSubHeader}>Tools</ListSubheader> : null}
				<ListItemLink
					classes={classes}
					to="/tools/streamsheets"
					primary="Streamsheets"
					icon={<StreamsheetsIcon fontSize="small" />}
				/>

				{userProfile?.isAdmin && <ListItemLink classes={classes} to="/streams" primary="Streams" icon={<StreamsIcon />} />}
				{userProfile?.isAdmin && <ListItemLink classes={classes} to="/terminal" primary="Terminal" icon={<TerminalIcon />} />}
			</List>
			<Divider />
			<List>
				{(userProfile?.isAdmin && open) ? <ListSubheader className={classes.menuSubHeader}>Admin</ListSubheader> : null}
				{(userProfile?.isAdmin && !hideConnections) ? <ListItemLink
					classes={classes}
					to="/config/connections"
					primary="Connections"
					icon={<ConnectionsIcon fontSize="small" />}
				/> : null}
				{/* <ListItemLink classes={classes} to="/config/settings" primary="Settings" icon={<SettingsIcon />} /> */}
				{userProfile?.isAdmin && <ListItemLink
					classes={classes}
					to="/config/settings"
					primary="Settings"
					icon={<SettingsIcon fontSize="small" />}
				/>}
				{userManagementAccess(userManagementFeature) ? <ListItemLink
					classes={classes}
					to="/admin/users"
					primary="User Management"
					icon={<UsersIcon fontSize="small" />}
				/> : null}
				{/* {clusterManagementAccess(clusterManagementFeature) ? <ListItemLink
					classes={classes}
					to="/admin/cluster"
					primary="Cluster Management"
					icon={<ClusterIcon fontSize="small" />}
				/> : null} */}
				{/* {<ListItemLink
					classes={classes}
					to="/admin/clusters"
					primary="Cluster Management"
					icon={<ClusterIcon fontSize="small" />}
				/>} */}
			</List>
		</div>
	</Drawer>


};

const mapStateToProps = (state) => {
	return {
		userProfile: state.userProfile?.userProfile,
		userManagementFeature: state.systemStatus?.features?.usermanagement,
		clusterManagementFeature: state.systemStatus?.features?.clusterManagement,
		dynamicSecurityFeature: state.systemStatus?.features?.dynamicsecurity,
		brokerConnections: state.brokerConnections.brokerConnections,
		connected: state.brokerConnections.connected,
		currentConnectionName: state.brokerConnections.currentConnectionName
	};
};

export default connect(mapStateToProps)(withRouter(CustomDrawer));
