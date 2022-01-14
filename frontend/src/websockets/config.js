const { protocol } = window.location;
const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

export default {
	// url: `${wsProtocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}${process.env.PUBLIC_URL ? process.env.PUBLIC_URL : ''}`
	url: `${wsProtocol}//${window.location.hostname}:8088${process.env.PUBLIC_URL ? process.env.PUBLIC_URL : ''}`,
	urlHTTP: `${protocol}//${window.location.hostname}:8088${process.env.PUBLIC_URL ? process.env.PUBLIC_URL : ''}`,
};
