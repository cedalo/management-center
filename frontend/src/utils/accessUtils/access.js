export const isConnectionAllowed = (userProfile, currentConnectionName, permissionFunction) => {
	if (!userProfile || !currentConnectionName) return undefined;
	if (typeof userProfile === 'object' && Object.keys(userProfile).length === 0) return undefined; // check if userProfile is an empty object
	if (typeof currentConnectionName === 'object' && Object.keys(currentConnectionName).length === 0) return undefined;

	if (!userProfile.connections) { // if license not present, connections array is not injected into user object
		return undefined;
	}

	for (const connection of userProfile.connections) {
		if (connection.name === currentConnectionName) {
			return permissionFunction(connection);
		}
	}

	return undefined;
};

export const atLeastAdmin = (userProfile, currentConnectionName) => {
    const adminOrHigher = (x) => x?.isAdmin;
	const connectionAllowed = isConnectionAllowed(userProfile, currentConnectionName, adminOrHigher);

    return  connectionAllowed === undefined ? adminOrHigher(userProfile) : connectionAllowed;
};

export const atLeastEditor = (userProfile, currentConnectionName) => {
	const editorOrHigher = (x) => x?.isAdmin || x?.isEditor;
	const connectionAllowed = isConnectionAllowed(userProfile, currentConnectionName, editorOrHigher);

	return connectionAllowed === undefined ? editorOrHigher(userProfile) : connectionAllowed;
};

export const atLeastViewer = (userProfile, currentConnectionName) => {
    const viewerOrHigher = (x) => x?.isAdmin || x?.isEditor || x?.isViewer;
	const connectionAllowed = isConnectionAllowed(userProfile, currentConnectionName, viewerOrHigher);

	return  connectionAllowed === undefined ? viewerOrHigher(userProfile) : connectionAllowed;
};


export const isGroupMember = (userProfile) => {
	return userProfile?.connections && typeof userProfile.connections === 'object' && Object.keys(userProfile.connections).length !== 0;
};