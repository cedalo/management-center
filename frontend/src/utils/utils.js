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
};

const splitByFirstOccurence = (text, separator) => {
	const index = text.indexOf(separator);
	if (index === -1) {
		return [text];
	}
	return [text.slice(0, index), text.slice(index + 1)];
};

export const parseUrl = (url) => {
	if (typeof url !== 'string') {
		throw new Error('Invalid URL');
	}
	if (url === '') {
		throw new Error('Invalid URL');
	}
	const parsedUrl = {};

	let parts = url.split('://');

	if (parts.length === 2) {
		parsedUrl.protocol = parts[0];
	} else if (parts.length === 1) {
		parsedUrl.protocol = '';
	} else {
		throw new Error('Invalid URL');
	}
	let rest = parts[1] || parts[0];

	parts = splitByFirstOccurence(rest, '/');

	if (parts.length === 2) {
		parsedUrl.host = parts[0];
		parsedUrl.path = parts[1];
	} else {
		parsedUrl.host = parts[0];
		parsedUrl.path = '';
	}

	parts = parsedUrl.path.split('?');

	if (parts.length === 2) {
		parsedUrl.path = parts[0];
		parsedUrl.query = parts[1];
	} else if (parts.length === 1) {
		parsedUrl.query = '';
	} else {
		throw new Error('Invalid URL');
	}

	parts = parsedUrl.host.split(':');

	if (parts.length === 2) {
		parsedUrl.host = parts[0];
		parsedUrl.port = parts[1];
		if (!parseInt(parsedUrl.port)
			|| parseInt(parsedUrl.port) < 0
			|| parseInt(parsedUrl.port) > 65535
			|| parsedUrl.port.length > ('' + parseInt(parsedUrl.port)).length
		) {
			throw new Error('Invalid URL');
		}
	} else if (parts.length === 1) {
		parsedUrl.port = '';
	} else {
		throw new Error('Invalid URL');
	}

	return parsedUrl;
};
