import React from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import ConnectionDetailComponent from './ConnectionDetailComponent';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';

const ConnectionDetail = (props) => {
	const { selectedConnectionToEdit: connection } = props;

	return connection ? (
		<div>
			<ContainerBreadCrumbs title={connection.id} links={[{name: 'Home', route: '/home'},{name: 'Connections', route: '/connections'}]}/>
			<ContainerHeader
				title="Edit Connection"
				subTitle="View and modify connection settings. To modify click on the edit button below."
			/>
			<ConnectionDetailComponent />
		</div>
	) : (
		<Redirect to="/connections" push />
	);
};

const mapStateToProps = (state) => {
	return {
		selectedConnectionToEdit: state.brokerConnections?.selectedConnectionToEdit
	};
};

export default connect(mapStateToProps)(ConnectionDetail);
