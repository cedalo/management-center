export const trimString = (value) => {
	return (typeof value === 'string') ? value.trim() : value;
};

export const isAdminOpen = () => {
	return location.pathname.startsWith('/user-groups') ||
		location.pathname.startsWith('/tokens') ||
		location.pathname.startsWith('/info') ||
		location.pathname.startsWith('/users') ||
		location.pathname.startsWith('/settings');
};
export const showConnections = () => {
	return !(location.pathname.startsWith('/user-groups') ||
		location.pathname.startsWith('/tokens') ||
		location.pathname.startsWith('/info') ||
		location.pathname.startsWith('/users') ||
		location.pathname.startsWith('/certs') ||
		location.pathname.startsWith('/connections') ||
		location.pathname.startsWith('/clusters') ||
		location.pathname.startsWith('/settings'));
};

export const getHelpBasePath = () => {
	return 'https://docs.cedalo.com/';
}
