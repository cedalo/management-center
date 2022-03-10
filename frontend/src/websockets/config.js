const { protocol } = window.location;
const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

export default {
	// url: `${wsProtocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}${process.env.PUBLIC_URL ? process.env.PUBLIC_URL : ''}`
	url: `${wsProtocol}//${window.location.host}${process.env.PUBLIC_URL ? process.env.PUBLIC_URL : ''}`,
	urlHTTP: `${protocol}//${window.location.host}${process.env.PUBLIC_URL ? process.env.PUBLIC_URL : ''}`,
};
