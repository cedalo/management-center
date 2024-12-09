const normalize = (host = '') => {
    if (host.startsWith('//')) return host.substring(2);
    if (host.startsWith('/')) return host.substring(1);
    return host;
};
const getConnectionInfo = (connection) => {
    const { id, name, url = '' } = connection;
    const parts = url.split(':');
    return { id, name, protocol: parts[0], host: normalize(parts[1]), port: parts[2] };
};

const mapById = (all, val) => {
    all[val.id] = val;
    return all;
};
const getUsedConnections = (availableConnections = [], cert) => {
    const connections = availableConnections.reduce(mapById, {});
    const ids = Object.keys(cert.usedBy);
    return ids.filter((id) => !!connections[id]).map((id) => connections[id]);
};

const mapSubjectKeys = {
    CN: 'Common Name',
    L: 'Locality',
    ST: 'State Or Province',
    O: 'Organization',
    OU: 'Organization Unit',
    C: 'Country Code',
    E: 'E-Mail',
    STREET: 'Street',
    emailAddress: 'E-Mail',
    // DC: 'Domain'
    // UID: 'User ID'
};
const toObj = (delimiter, mapKey) => (obj, str) => {
    const [key, value] = str.split(delimiter);
    obj[mapKey(key)] = value;
    return obj;
};
const identity = (v) => v;
const mapSubjectKey = (key) => mapSubjectKeys[key] || key;
const parseSubjectInfo = (str, mapKey = identity) => (str ? str.split('\n').reduce(toObj('=', mapKey), {}) : {});

const isValid = ({ cert, id, filename }) => cert || (id && filename);
const loadCertificateInfo = async (certificate, client) => {
    if (isValid(certificate)) {
        try {
            const { data: info } = await client.getCertificateInfo(certificate);
            return { info };
        } catch (error) {
            return { error };
        }
    }
    return { info: undefined };
};

export { getConnectionInfo, getUsedConnections, mapSubjectKey, parseSubjectInfo, loadCertificateInfo };
