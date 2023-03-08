import React from 'react';
import {connect} from 'react-redux';
import {makeStyles} from '@material-ui/core/styles';
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
import UserGroupNew from './components/UserGroupNew';
import UserGroups from './components/UserGroups';
import UserGroupDetail from './components/UserGroupDetail';
import SortableTablePage from './components/SortableTablePage';

import useFetch from './helpers/useFetch';

import UserNew from './admin/users/components/UserNew';
import UserDetail from './admin/users/components/UserDetail';
import Users from './admin/users/components/Users';
import ConnectionNew from './admin/connections/components/ConnectionNew';
import Connections from './admin/connections/components/Connections';
import ClusterNew from './admin/clusters/components/ClusterNew';
import Clusters from './admin/clusters/components/Clusters';
import ClusterDetail from './admin/clusters/components/ClusterDetail';
import InspectClients from './admin/inspect/components/InspectClients';
import Certificates from './admin/certificates/components/Certificates';
import CertificateDeploy from './admin/certificates/components/CertificateDeploy';
import CertificateDetail from './admin/certificates/components/CertificateDetail';

import {Switch, Route, Redirect} from 'react-router-dom';
import DefaultACLAccess from './components/DefaultACLAccess';
import TestEdit from './components/TestEdit';
import TestCollections from './components/TestCollections';
import TestCollectionDetail from './components/TestCollectionDetail';
import ApplicationTokens from './components/ApplicationTokens';
import {atLeastAdmin, atLeastEditor, atLeastViewer, isGroupMember} from './utils/accessUtils/access';

function AppRoutes(props) {

	const {selectedConnectionToEdit: connection} = props;
	const {userProfile, userManagementFeature, currentConnectionName} = props;
	const [response, loading, hasError] = useFetch(`${process.env.PUBLIC_URL}/api/theme`);
	const [responseConfig, loadingConfig, hasErrorConfig] = useFetch(`${process.env.PUBLIC_URL}/api/config`);

	if ((hasError || response) && (hasErrorConfig || responseConfig)) {
		let hideConnections = (typeof responseConfig?.hideConnections === 'boolean') ? responseConfig?.hideConnections : false;
		let hideInfoPage = (typeof responseConfig?.hideInfoPage === 'boolean') ? responseConfig?.hideInfoPage : false;

		//   const container = window !== undefined ? () => window().document.body : undefined;

		return (
			<Switch>
				<Route path="/clients/new">
					<ClientNew/>
				</Route>
				<Route
					path="/clients/:clientId"
					component={ClientDetail}
				/>
				<Route path="/clients">
					<Clients filter={props.filter}/>
				</Route>
				<Route path="/clientinspection">
					<InspectClients filter={props.filter}/>
				</Route>
				<Route path="/groups/new">
					<GroupNew/>
				</Route>
				<Route
					path="/groups/:groupId"
					component={GroupDetail}
				/>
				<Route path="/groups">
					<Groups/>
				</Route>
				<Route path="/roles/new">
					<RoleNew/>
				</Route>
				<Route path="/roles/acl">
					<DefaultACLAccess/>
				</Route>
				<Route
					path="/roles/:roleId"
					component={RoleDetail}
				/>
				<Route path="/roles">
					<Roles/>
				</Route>
				<Route path="/security">
					<Security/>
				</Route>
				<Route path="/plugins">
					<Plugins/>
				</Route>
				<Route path="/terminal">
					<Terminal/>
				</Route>
				{atLeastAdmin(userProfile, currentConnectionName) && <Route path="/streams/new">
					<StreamNew/>
				</Route>}
				{atLeastAdmin(userProfile, currentConnectionName) && <Route
					path="/streams/:streamId"
					component={StreamDetail}
				/>}
				<Route path="/streams">
					<Streams/>
				</Route>
				<Route path="/home">
					<Status/>
				</Route>
				<Route path="/topics">
					<TopicTree/>
				</Route>
				<Route path="/system">
					<System/>
				</Route>
				{atLeastAdmin(userProfile) && !isGroupMember(userProfile) && <Route path="/connections/new">
					<ConnectionNew/>
				</Route>}
				{atLeastAdmin(userProfile, connection?.name) && <Route path="/connections/:connectionId">
					<ConnectionDetail/>
				</Route>}
				{!hideConnections ? <Route path="/connections">
					<Connections/>
				</Route> : null}
				{atLeastAdmin(userProfile) && (
					<Route path="/admin/certs/detail/:certId">
						<CertificateDetail/>
					</Route>
				)}
				{atLeastAdmin(userProfile) && (
					<Route path="/admin/certs/deploy/:certId">
						<CertificateDeploy/>
					</Route>
				)}
				{atLeastAdmin(userProfile) && (
					<Route path="/admin/certs">
						<SortableTablePage Component={Certificates}/>
					</Route>
				)}
				{atLeastAdmin(userProfile) && <Route path="/settings">
					<Settings onChangeTheme={props.onChangeTheme}/>
				</Route>}
				<Route path="/config">
					<Config/>
				</Route>
				<Route path="/profile">
					<UserProfile/>
				</Route>
				{atLeastAdmin(userProfile) && <Route path="/user-groups/new">
					<UserGroupNew/>
				</Route>}
				{atLeastAdmin(userProfile) && <Route path="/user-groups/:groupId" component={UserGroupDetail}
				/>}
				<Route path="/user-groups">
					<SortableTablePage Component={UserGroups}/>
				</Route>
				<Route path="/tokens">
					<ApplicationTokens/>
				</Route>

				<Route path="/users/new">
					<UserNew/>
				</Route>
				<Route
					path="/users/:userId"
					component={UserDetail}
				/>
				<Route path="/users">
					<Users/>
				</Route>
				<Route path="/clusters/new">
					<ClusterNew/>
				</Route>
				<Route
					path="/clusters/:clusterId"
					component={ClusterDetail}
				/>
				<Route path="/clusters">
					<Clusters/>
				</Route>
				<Route path="/tools/streamsheets">
					<Streamsheets/>
				</Route>
				<Route path="/home">
					<Home/>
				</Route>
				{!hideInfoPage ? <Route path="/info">
					<InfoPage/>
				</Route> : null}
				<Route
					path="/testCollections/tests/detail/:id"
					component={TestEdit}
				/>
				<Route
					path="/testCollections/detail/:id"
					component={TestCollectionDetail}
				/>
				<Route
					path="/testCollections"
					component={TestCollections}
				/>
				<Route path="/">
					<Redirect to="/home"/>
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
		userManagementFeature: state.systemStatus?.features?.usermanagement,
		selectedConnectionToEdit: state.brokerConnections?.selectedConnectionToEdit,
		currentConnectionName: state.brokerConnections?.currentConnectionName,
	};
};

export default connect(mapStateToProps)(AppRoutes);
