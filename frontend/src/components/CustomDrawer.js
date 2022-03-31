import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { connect } from 'react-redux';
import clsx from 'clsx';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListSubheader from '@mui/material/ListSubheader';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import { withRouter, BrowserRouter as Router, Switch, Route, Link as RouterLink, Redirect } from 'react-router-dom';
import PluginsIcon from '@mui/icons-material/Power';
import TerminalIcon from '@mui/icons-material/Computer';
import ConnectionsIcon from '@mui/icons-material/SettingsInputComponent';
import TopicTreeIcon from '@mui/icons-material/AccountTree';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import RoleIcon from '@mui/icons-material/Policy';
import UsersIcon from '@mui/icons-material/People';
import ClusterIcon from '@mui/icons-material/Storage';
import InspectClientsIcon from '@mui/icons-material/Search';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import SettingsIcon from '@mui/icons-material/Settings';
import StreamsheetsIcon from '@mui/icons-material/GridOn';
import StreamsIcon from '@mui/icons-material/Timeline';

const PREFIX = 'CustomDrawer';

const classes = {
    toolbar: `${PREFIX}-toolbar`,
    menuItem: `${PREFIX}-menuItem`,
    menuItemRoot: `${PREFIX}-menuItemRoot`,
    menuItemSelected: `${PREFIX}-menuItemSelected`,
    menuSubHeader: `${PREFIX}-menuSubHeader`,
    drawer: `${PREFIX}-drawer`,
    drawerOpen: `${PREFIX}-drawerOpen`,
    drawerClose: `${PREFIX}-drawerClose`
};

const StyledDrawer = styled(Drawer)((
    {
        theme
    }
) => ({
    [`& .${classes.toolbar}`]: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
		padding: theme.spacing(0, 1),
		...theme.mixins.toolbar
	},

    [`& .${classes.menuItem}`]: {
		color: '#9898AA',
		fontSize: '14px',
	},

    [`& .${classes.menuItemRoot}`]: {
		fontSize: '14px',
		"&$menuItemSelected, &$menuItemSelected:focus, &$menuItemSelected:hover": {
		  backgroundColor: "inherit"
		}
	  },

    [`& .${classes.menuItemSelected}`]: {
		color: theme.palette.menuItem.color,
	},

    [`& .${classes.menuSubHeader}`]: {
		// color: 'white',
		fontWeight: 'bold',
		fontSize: '12px',
		textTransform: 'uppercase',
		lineHeight: '24px'
	},

    [`&.${classes.drawer}`]: {
		width: drawerWidth,
		flexShrink: 0,
		whiteSpace: 'nowrap',
		backgroundColor: theme.palette.drawer?.backgroundColor
	},

    [`&.${classes.drawerOpen}`]: {
		width: drawerWidth,
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen
		})
	},

    [`&.${classes.drawerClose}`]: {
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		}),
		overflowX: 'hidden',
		width: theme.spacing(7) + 1,
		[theme.breakpoints.up('sm')]: {
			width: theme.spacing(7) + 1
		}
	}
}));

const drawerWidth = 240;

function ListItemLink(props) {
	const theme = useTheme();
	const { id, icon, primary, to = null, } = props;

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
					color: isSelected ? theme.palette.menuItem.color : '#9898AA'
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

const CustomDrawer = ({ userProfile = {}, userManagementFeature, dynamicSecurityFeature, hideConnections, open, handleDrawerOpen, handleDrawerClose }) => {


	const theme = useTheme();

	return (
        <StyledDrawer
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
                <IconButton onClick={handleDrawerClose} size="large">
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
                    {<ListItemLink
                        classes={classes}
                        to="/admin/inspect/clients"
                        primary="Clients"
                        icon={<InspectClientsIcon fontSize="small" />}
                    />}
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

                    {userProfile?.isAdmin && <ListItemLink to="/streams" primary="Streams" icon={<StreamsIcon />} />}
                    {userProfile?.isAdmin && <ListItemLink to="/terminal" primary="Terminal" icon={<TerminalIcon />} />}
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
                    {/* <ListItemLink classes={ to="/config/settings" primary="Settings" icon={<SettingsIcon />} /> */}
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
                    {<ListItemLink
                        classes={classes}
                        to="/admin/clusters"
                        primary="Cluster Management"
                        icon={<ClusterIcon fontSize="small" />}
                    />}
                </List>
            </div>
        </StyledDrawer>
    );


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
