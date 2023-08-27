import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import React, {useEffect, useState} from 'react';
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
import InspectClientsIcon from '@material-ui/icons/RecordVoiceOver';
import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import StreamsheetsIcon from '@material-ui/icons/TableChart';
import StreamsIcon from '@material-ui/icons/Timeline';
import SecurityIcon from '@material-ui/icons/Security';
import UserGroupsIcon from '@material-ui/icons/PeopleOutline';
import CertificateIcon from '@material-ui/icons/VerifiedUserOutlined'; // GppGoodOutlined';
import {atLeastAdmin, atLeastEditor, atLeastViewer} from '../utils/accessUtils/access';
import { isAdminOpen } from '../utils/utils';

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

			<Tooltip title={primary} placement="right">
				<MenuItem
					button
					data-tour={props.tour || ''}
					component={renderLink}
					selected={isSelected}
					classes={{
						root: classes.menuItemRoot,
						selected: classes.menuItemSelected
					}}
				>
					{icon ? <ListItemIcon style={{
						color: isSelected ? theme.palette.primary.main : ''
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
	menuSubHeader: {
		fontWeight: 'bold',
		fontSize: '12px',
		background: 'none',
		textTransform: 'uppercase',
		lineHeight: '24px'
	},
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
		whiteSpace: 'nowrap',
		// backgroundColor: theme.palette.drawer?.backgroundColor,
		'&::-webkit-scrollbar': {
			width: "0",
			display: "none"
		}
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
						connected,
						setShowFilter,
						backendParameters
					  }) => {
	const classes = useStyles();
	const theme = useTheme();
	const [adminOpen, setAdminOpen] = useState(false);

	useEffect(() => {
		setAdminOpen(isAdminOpen());
	}, [location.pathname]);

	setShowFilter('/clientinspection' === location.pathname);

	return <Drawer
		data-tour="navigation"
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
			<Box style={{overflow: 'hidden', height: '100%'}}>
				{open ? <ListSubheader className={classes.menuSubHeader}>Inspection</ListSubheader> : null}
				<List>
					<ListItemLink
						tour="navbar-home"
						id="menu-item-status"
						classes={classes}
						to="/home"
						primary="Home"
						icon={<HomeIcon fontSize="small"/>}
					/>
					<ListItemLink
						tour="navbar-topics"
						id="menu-item-topics"
						classes={classes}
						to="/topics"
						primary="Topic Tree"
						icon={<TopicTreeIcon fontSize="small"/>}
					/>
					{<ListItemLink
						tour="navbar-clientinspection"
						classes={classes}
						to="/clientinspection"
						primary="Client Inspection"
						icon={<InspectClientsIcon fontSize="small"/>}
					/>}
				</List>
				<Divider/>
				{atLeastEditor(userProfile, currentConnectionName) && <><List>
					{open ? <ListSubheader className={classes.menuSubHeader}>Dynamic Security</ListSubheader> : null}
					<ListItemLink
						tour="navbar-clients"
						classes={classes}
						to="/clients"
						primary="Clients"
						icon={<PersonIcon fontSize="small"/>}
					/>
					<ListItemLink
						tour="navbar-groups"
						id="menu-item-groups"
						classes={classes}
						to="/groups"
						primary="Groups"
						icon={<GroupIcon fontSize="small"/>}
					/>
					<ListItemLink
						tour="navbar-roles"
						classes={classes}
						to="/roles"
						primary="Roles"
						icon={<RoleIcon fontSize="small"/>}
					/>
				</List>
				<Divider/></>}
				<List id="menu-items-tools">
					{open ? <ListSubheader className={classes.menuSubHeader}>Manage</ListSubheader> : null}
					{atLeastAdmin(userProfile, currentConnectionName) &&
						<ListItemLink
							tour="navbar-streams"
							classes={classes}
							to="/streams"
							primary="Streams"
							icon={<StreamsIcon fontSize="small"/>}
						/>}
					{atLeastAdmin(userProfile, currentConnectionName) &&
						<ListItemLink
							tour="navbar-terminal"
							classes={classes}
							to="/terminal"
							primary="Terminal"
							icon={<TerminalIcon fontSize="small"/>}
						/>}
					{/* {backendParameters.showStreemsheets ? 
						<ListItemLink
							classes={classes}
							to="/tools/streamsheets"
							primary="Streamsheets"
							icon={<StreamsheetsIcon fontSize="small" />}
						/>
					: null} */}
				</List>
				<Divider/>
				<Paper
					style={{
						zIndex: '5009',
						position: 'absolute',
						bottom: '0px',
						boxShadow: 'none',
						width: '100%',
						background: theme.overrides.MuiDrawer.paper.backgroundColor
					}}
				>
					<List style={{background: 'none'}}>
						<List style={{background: 'none'}}>
							{open ? <ListSubheader className={classes.menuSubHeader}>Configuration</ListSubheader> : null}
							<Divider style={{margin: "7px 0px"}}/>
							{(!hideConnections) ?
								<ListItemLink
									tour="navbar-connections"
									classes={classes}
									to="/connections"
									primary="Broker Connections"
									icon={<ConnectionsIcon fontSize="small"/>}
								/> : null}
							{atLeastAdmin(userProfile) &&
								<ListItemLink
									tour="navbar-clusters"
									classes={classes}
									to="/clusters"
									primary="Cluster Management"
									icon={<ClusterIcon fontSize="small"/>}
								/>}
							{atLeastAdmin(userProfile) &&
								<ListItemLink
									tour="navbar-certs"
									classes={classes}
									to="/certs"
									primary="Certificate Management"
									icon={<CertificateIcon fontSize="small"/>}
								/>}
						</List>
						<Divider/>
						{adminOpen ? <Divider/> : null}
						{adminOpen ?
							<ListItemLink
								tour="navbar-info"
								id="menu-item-info"
								classes={classes}
								to="/info"
								primary="Info"
								icon={<InfoIcon fontSize="small"/>}
							/> : null}
						{/*{!hideInfoPage && adminOpen && atLeastAdmin(userProfile) &&*/}
						{/*	<ListItemLink*/}
						{/*		id="menu-item-plugins"*/}
						{/*		classes={classes}*/}
						{/*		to="/plugins"*/}
						{/*		primary="Plugins"*/}
						{/*		icon={<PluginsIcon fontSize="small"/>}*/}
						{/*	/>}*/}
						{adminOpen && atLeastAdmin(userProfile) && userManagementAccess(userManagementFeature) ?
							<ListItemLink
								tour="navbar-users"
								classes={classes}
								to="/users"
								primary="User Management"
								icon={<UsersIcon fontSize="small"/>}
							/> : null}
						{adminOpen && atLeastAdmin(userProfile) && <ListItemLink
							tour="navbar-user-groups"
							classes={classes}
							to="/user-groups"
							primary="User Groups"
							icon={<UserGroupsIcon fontSize="small"/>}
						/>}
						{adminOpen && atLeastAdmin(userProfile) ?
							<ListItemLink
								tour="navbar-tokens"
								classes={classes}
								to="/tokens"
								primary="App Tokens"
								icon={<SecurityIcon fontSize="small"/>}
							/> : null}
						{adminOpen && atLeastAdmin(userProfile) &&
							<ListItemLink
								tour="navbar-settings"
								classes={classes}
								to="/settings"
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
		currentConnectionName: state.brokerConnections.currentConnectionName,
		backendParameters: state.backendParameters?.backendParameters,
	};
};

export default connect(mapStateToProps)(withRouter(CustomDrawer));
