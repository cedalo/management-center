import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Groups from './components/Groups';
import Home from './components/Home';
import Security from './components/Security';
import Config from './components/Config';
import System from './components/System';
import InfoPage from './components/InfoPage';
// import Login from "./components/Login";
import Roles from './components/Roles';
import Plugins from './components/Plugins';
import Terminal from './components/Terminal';
import Settings from './components/Settings';
import Streams from './components/Streams';
import Streamsheets from './components/Streamsheets';
import Status from './components/Status';
import TopicTree from './components/TopicTree';
import GroupDetail from './components/GroupDetail';
import RoleDetail from './components/RoleDetail';
import ClientDetail from './components/ClientDetail';
import StreamDetail from './components/StreamDetail';
import ConnectionDetail from './components/ConnectionDetail';
import GroupNew from './components/GroupNew';
import ClientNew from './components/ClientNew';
import RoleNew from './components/RoleNew';
import StreamNew from './components/StreamNew';
import Clients from './components/Clients';
import UserProfile from './components/UserProfile';
import useFetch from './helpers/useFetch';

import UserNew from './admin/users/components/UserNew';
import UserDetail from './admin/users/components/UserDetail';
import Users from './admin/users/components/Users';
import ConnectionNew from './admin/connections/components/ConnectionNew';
import Connections from './admin/connections/components/Connections';
import ClusterNew from './admin/clusters/components/ClusterNew';
import Clusters from './admin/clusters/components/Clusters';
import ClusterDetail from './admin/clusters/components/ClusterDetail';

import { Switch, Route, Redirect } from 'react-router-dom';
import DefaultACLAccess from './components/DefaultACLAccess';

const useStyles = makeStyles((theme) => ({
	
}));

function AppRoutes(props) {

	const { userProfile, userManagementFeature } = props;
	const [response, loading, hasError] = useFetch(`${process.env.PUBLIC_URL}/api/theme`);
	const [responseConfig, loadingConfig, hasErrorConfig] = useFetch(`${process.env.PUBLIC_URL}/api/config`);

	if ((hasError || response) && (hasErrorConfig || responseConfig)) {
		let hideConnections = (typeof responseConfig?.hideConnections === 'boolean') ? responseConfig?.hideConnections : false;
		let hideInfoPage = (typeof responseConfig?.hideInfoPage === 'boolean') ? responseConfig?.hideInfoPage : false;
	

		//   const container = window !== undefined ? () => window().document.body : undefined;

		return (
			<Switch>
				<Route
					path="/security/clients/detail/:clientId"
					component={ClientDetail}
				/>
				<Route path="/security/clients/new">
					<ClientNew />
				</Route>
				<Route path="/security/clients">
					<Clients />
				</Route>
				<Route
					path="/security/groups/detail/:groupId"
					component={GroupDetail}
				/>
				<Route path="/security/groups/new">
					<GroupNew />
				</Route>
				<Route path="/security/groups">
					<Groups />
				</Route>
				<Route
					path="/security/roles/detail/:roleId"
					component={RoleDetail}
				/>
				<Route path="/security/acl">
					<DefaultACLAccess />
				</Route>
				<Route path="/security/roles/new">
					<RoleNew />
				</Route>
				<Route path="/security/roles">
					<Roles />
				</Route>
				<Route path="/security">
					<Security />
				</Route>
				<Route path="/plugins">
					<Plugins />
				</Route>
				<Route path="/terminal">
					<Terminal />
				</Route>
				{userProfile?.isAdmin && <Route
					path="/streams/detail/:streamId"
					component={StreamDetail}
				/>}
				{userProfile?.isAdmin && <Route path="/streams/new">
					<StreamNew />
				</Route>}
				{userProfile?.isAdmin && <Route path="/streams">
					<Streams />
				</Route>}
				<Route path="/system/status">
					<Status />
				</Route>
				<Route path="/system/topics">
					<TopicTree />
				</Route>
				<Route path="/system">
					<System />
				</Route>
				{userProfile?.isAdmin && <Route path="/config/connections/new">
					<ConnectionNew />
				</Route>}
				{userProfile?.isAdmin && <Route path="/config/connections/detail/:connectionId">
					<ConnectionDetail />
				</Route>}
				{ !hideConnections ? <Route path="/config/connections">
					<Connections />
				</Route> : null }
				{userProfile?.isAdmin && <Route path="/config/settings">
					<Settings />
				</Route>}
				<Route path="/config">
					<Config />
				</Route>
				<Route path="/profile">
					<UserProfile />
				</Route>
				<Route
					path="/admin/users/detail/:userId"
					component={UserDetail}
				/>
				<Route path="/admin/users/new">
					<UserNew />
				</Route>
				<Route path="/admin/users">
					<Users />
				</Route>
				{/* <Route
					path="/admin/clusters/detail/:clusterId"
					component={ClusterDetail}
				/>
				<Route path="/admin/clusters/new">
					<ClusterNew />
				</Route>
				<Route path="/admin/clusters">
					<Clusters />
				</Route> */}
				<Route path="/tools/streamsheets">
					<Streamsheets />
				</Route>
				<Route path="/streams">
					<Streams />
				</Route>
				<Route path="/home">
					<Home />
				</Route>
				{ !hideInfoPage ? <Route path="/info">
					<InfoPage />
				</Route> : null }
				<Route path="/">
					<Redirect to="/system/status" />
				</Route>
			</Switch>
		);
	} else {
		return null;
	}
}

const mapStateToProps = (state) => {
	return {
		userProfile: state.userProfile?.userProfile,
		userManagementFeature: state.systemStatus?.features?.usermanagement
	};
};

export default connect(mapStateToProps)(AppRoutes);
