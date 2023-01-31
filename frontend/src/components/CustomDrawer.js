import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import React, {useContext, useState} from 'react';
import {connect} from 'react-redux';
import clsx from 'clsx';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListSubheader from '@material-ui/core/ListSubheader';
import Drawer from '@material-ui/core/Drawer';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import InfoIcon from '@material-ui/icons/Info';
import {makeStyles, useTheme, withStyles} from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import {withRouter, BrowserRouter as Router, Switch, Route, Link as RouterLink, Redirect} from 'react-router-dom';
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
import MoreIcon from '@material-ui/icons/MoreHoriz';
import ClusterIcon from '@material-ui/icons/Storage';
import InspectClientsIcon from '@material-ui/icons/Search';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import SettingsIcon from '@material-ui/icons/Settings';
import StreamsheetsIcon from '@material-ui/icons/GridOn';
import StreamsIcon from '@material-ui/icons/Timeline';
import SecurityIcon from '@material-ui/icons/Security';
import UserGroupsIcon from '@material-ui/icons/PeopleOutline';
import {atLeastAdmin, atLeastEditor, atLeastViewer} from '../utils/accessUtils/access';
import InfoButton from './InfoButton';

const drawerWidth = 240;

function ListItemLink(props) {
	const theme = useTheme();
	const {id, icon, primary, to = null, classes} = props;

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
					}}/>
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
		minHeight: '50px'
		// ...theme.mixins.toolbar
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


const CustomDrawer = ({
						  userProfile = {},
						  userManagementFeature,
						  dynamicSecurityFeature,
						  hideConnections,
						  hideInfoPage,
						  open,
						  handleDrawerOpen,
						  handleDrawerClose,
						  currentConnectionName,
						  connected
					  }) => {
	const classes = useStyles();
	const theme = useTheme();
	const [adminOpen, setAdminOpen] = useState(false);

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
					<ChevronRightIcon/>
				) : (
					<ChevronLeftIcon/>
				)}
			</IconButton>
		</div>
		<div>
			{/* <Divider />
	<List>
		<ListItemLink id="menu-item-home" classes={classes} to="/home" primary="Home" icon={<HomeIcon />} />
	</List> */}
			<Divider/>
			<Box style={{overflow: 'hidden', height: '100%'}}>
				<List>
					{open ? <ListSubheader className={classes.menuSubHeader}>Monitoring</ListSubheader> : null}
					{atLeastAdmin(userProfile) && <ListItemLink
						classes={classes}
						to="/admin/clusters"
						primary="Cluster Management"
						icon={<ClusterIcon fontSize="small"/>}
					/>}
					{(atLeastAdmin(userProfile, currentConnectionName) && !hideConnections) ? <ListItemLink
						classes={classes}
						to="/config/connections"
						primary="Connections"
						icon={<ConnectionsIcon fontSize="small"/>}
					/> : null}
				</List>
				<Divider/>
				<List>
					<ListItemLink
						id="menu-item-status"
						classes={classes}
						to="/system/status"
						primary="System Status"
						icon={<EqualizerIcon fontSize="small"/>}
					/>
					<ListItemLink
						id="menu-item-topics"
						classes={classes}
						to="/system/topics"
						primary="Topic Tree"
						icon={<TopicTreeIcon fontSize="small"/>}
					/>
					{<ListItemLink
						classes={classes}
						to="/admin/inspect/clients"
						primary="Clients"
						icon={<InspectClientsIcon fontSize="small"/>}
					/>}
					{atLeastAdmin(userProfile, currentConnectionName) &&
						<ListItemLink classes={classes} to="/streams" primary="Streams" icon={<StreamsIcon/>}/>}
				</List>
				<Divider/>
				{atLeastEditor(userProfile, currentConnectionName) && <><List>
					{open ? <ListSubheader className={classes.menuSubHeader}>Dynamic Security</ListSubheader> : null}
					<ListItemLink
						id="menu-item-clients"
						classes={classes}
						to="/security/clients"
						primary="Clients"
						icon={<PersonIcon fontSize="small"/>}
					/>
					<ListItemLink
						id="menu-item-groups"
						classes={classes}
						to="/security/groups"
						primary="Groups"
						icon={<GroupIcon fontSize="small"/>}
					/>
					<ListItemLink
						id="menu-item-roles"
						classes={classes}
						to="/security/roles"
						primary="Roles"
						icon={<RoleIcon fontSize="small"/>}
					/>
				</List>
					<Divider/></>}
				<List id="menu-items-tools">
					{open ? <ListSubheader className={classes.menuSubHeader}>Tools</ListSubheader> : null}
					<ListItemLink
						classes={classes}
						to="/tools/streamsheets"
						primary="Streamsheets"
						icon={<StreamsheetsIcon fontSize="small"/>}
					/>

					{atLeastAdmin(userProfile, currentConnectionName) &&
						<ListItemLink classes={classes} to="/terminal" primary="Terminal" icon={<TerminalIcon/>}/>}
				</List>
				<Divider/>
				<Paper
					style={{
						position: 'absolute',
						bottom: '0px',
						boxShadow: 'none',
						width: '100%',
					}}
				>
					<List>
						{adminOpen ? <Divider/> : null}
						{adminOpen ?
							<ListItemLink
							id="menu-item-info"
							classes={classes}
							to="/info"
							primary="Info"
							icon={<InfoIcon fontSize="small"/>}
						/> : null}
						{!hideInfoPage && adminOpen && atLeastAdmin(userProfile) &&
							<ListItemLink
								id="menu-item-plugins"
								classes={classes}
								to="/plugins"
								primary="Plugins"
								icon={<PluginsIcon fontSize="small"/>}
							/>}
						{adminOpen && atLeastAdmin(userProfile) && userManagementAccess(userManagementFeature) ?
							<ListItemLink
								classes={classes}
								to="/admin/users"
								primary="User Management"
								icon={<UsersIcon fontSize="small"/>}
							/> : null}
						{adminOpen && atLeastAdmin(userProfile) && <ListItemLink
							classes={classes}
							to="/admin/user-groups"
							primary="User Groups"
							icon={<UserGroupsIcon fontSize="small"/>}
						/>}
						{adminOpen && atLeastAdmin(userProfile) ? <ListItemLink
							classes={classes}
							to="/admin/tokens"
							primary="App Tokens"
							icon={<SecurityIcon fontSize="small"/>}
						/> : null}
						{adminOpen && atLeastAdmin(userProfile) &&
							<ListItemLink
								classes={classes}
								to="/config/settings"
								primary="Settings"
								icon={<SettingsIcon fontSize="small"/>}
							/>}
						<Divider/>
						<Tooltip
							enterDelay={500}
							placement="right"
							title="Admin"
							key="admin"
						>
							<MenuItem
								button
								onClick={() => setAdminOpen(!adminOpen)}
							>
								<ListItemIcon style={{}}>
									<MoreIcon/>
								</ListItemIcon>
								<ListItemText primary="Administration" classes={{
									root: classes.menuItem,
									primary: classes.menuItem
								}}/>
							</MenuItem>
						</Tooltip>
					</List>
				</Paper>
			</Box>
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
