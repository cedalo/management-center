import React, { useContext, useEffect, useState } from 'react';
import { CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { InfoHint } from './AlertHint';
import { loadCertificateInfo, mapSubjectKey, parseSubjectInfo } from './certutils';

const styles = {
    colValue: { maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' },
};
const getDate = (str) => {
    return str ? new Date(Date.parse(str)).toLocaleString() : 'n.a.';
};
const borderlessCell = (text = '', width) => <TableCell style={{ borderBottom: 'none', width }}>{text}</TableCell>;
const getSummaryTable = (info = {}) => {
    const isSelfSigned = !info.ca;
    const subject = parseSubjectInfo(info.subject);
    const issuer = parseSubjectInfo(info.issuer);
    const to = info.valid?.to;
    const from = info.valid?.from;
    return (
        <Table size="small" aria-label="certinfo-summary">
            <TableHead>
                <TableRow>
                    <TableCell>Certificate Summary</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    {borderlessCell()}
                    <TableCell align="left">CA type</TableCell>
                    <TableCell align="left">{isSelfSigned ? 'self-signed' : 'regular CA'}</TableCell>
                </TableRow>
                <TableRow>
                    {borderlessCell()}
                    <TableCell align="left">Issued To</TableCell>
                    <TableCell align="left">{subject.CN}</TableCell>
                </TableRow>
                <TableRow>
                    {borderlessCell()}
                    <TableCell align="left">Issued By</TableCell>
                    <TableCell align="left">{issuer.CN}</TableCell>
                </TableRow>
                <TableRow>
                    {borderlessCell()}
                    <TableCell align="left">Valid From</TableCell>
                    <TableCell align="left">{getDate(from)}</TableCell>
                </TableRow>
                <TableRow>
                    {borderlessCell()}
                    {borderlessCell('Valid To')}
                    {borderlessCell(getDate(to))}
                </TableRow>
            </TableBody>
        </Table>
    );
};

const nestRow =
    (mapKey) =>
    ([key, value]) => (
        <TableRow>
            {borderlessCell()}
            {borderlessCell()}
            <TableCell align="left">{mapKey(key)}</TableCell>
            <TableCell style={styles.colValue}>{value}</TableCell>
        </TableRow>
    );
const nestedRow = nestRow((key) => key);
const nestedRowUpperCased = nestRow((key) => key.toUpperCase());
const getDetailTable = (info = {}) => {
    const { ca, fingerprints, infoAccess, issuer, keyUsage, serialNumber, subject, subjectAltName, valid } = info;
    return (
        <Table size="small" aria-label="certinfo-detail">
            <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '65%' }} />
            </colgroup>
            <TableBody>
                <TableRow>
                    {borderlessCell()}
                    <TableCell align="left">CA type</TableCell>
                    <TableCell colSpan={2}>{!ca ? 'self-signed' : 'regular CA'}</TableCell>
                </TableRow>
                <TableRow>
                    {borderlessCell()}
                    <TableCell align="left">Subject</TableCell>
                </TableRow>
                {subject && Object.entries(parseSubjectInfo(subject, mapSubjectKey)).map(nestedRow)}
                <TableRow>
                    {borderlessCell()}
                    <TableCell align="left">Subject Alternative Name</TableCell>
                    <TableCell align="left" colSpan={2} style={styles.colValue}>
                        {subjectAltName}
                    </TableCell>
                </TableRow>
                <TableRow>
                    {borderlessCell()}
                    <TableCell align="left">Issuer</TableCell>
                </TableRow>
                {issuer && Object.entries(parseSubjectInfo(issuer, mapSubjectKey)).map(nestedRow)}
                <TableRow>
                    {borderlessCell()}
                    <TableCell align="left">Authority Information Access</TableCell>
                    <TableCell align="left" colSpan={2} style={styles.colValue}>
                        {infoAccess}
                    </TableCell>
                </TableRow>

                <TableRow>
                    {borderlessCell()}
                    <TableCell align="left">Key Usage</TableCell>
                    <TableCell align="left" colSpan={2} style={styles.colValue}>
                        {keyUsage}
                    </TableCell>
                </TableRow>
                <TableRow>
                    {borderlessCell()}
                    <TableCell align="left">Serial Number</TableCell>
                    <TableCell align="left" colSpan={2} style={styles.colValue}>
                        {serialNumber}
                    </TableCell>
                </TableRow>
                <TableRow>
                    {borderlessCell()}
                    <TableCell align="left">Fingerprints</TableCell>
                </TableRow>
                {fingerprints && Object.entries(fingerprints).map(nestedRowUpperCased)}
                <TableRow>
                    {borderlessCell()}
                    <TableCell align="left">Valid</TableCell>
                </TableRow>
                <TableRow>
                    {borderlessCell()}
                    {borderlessCell()}
                    <TableCell align="left">From</TableCell>
                    <TableCell align="left">{getDate(valid?.from)}</TableCell>
                </TableRow>
                <TableRow>
                    {borderlessCell()}
                    {borderlessCell()}
                    {borderlessCell('To')}
                    {borderlessCell(getDate(valid?.to))}
                </TableRow>
            </TableBody>
        </Table>
    );
};

const showInfoTable = (info, variant) => (variant === 'summary' ? getSummaryTable(info) : getDetailTable(info));
const showLoadingHint = () =>
    InfoHint({
        title: 'Fetching certificate information...',
        message: <CircularProgress color="secondary" size="1.5rem" />,
    });

const CertificateInfo = ({ certificate, variant }) => {
    const [certInfo, setCertInfo] = useState({});
    const [isLoadingInfo, setIsLoadingInfo] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const context = useContext(WebSocketContext);
    const { client } = context;

    const loadCertInfo = async () => {
        setIsLoadingInfo(true);
        const { info, error } = await loadCertificateInfo(certificate, client);
        if (error) {
            enqueueSnackbar(`Error loading certificate info from server. Reason: ${error.message || error}`, {
                variant: 'error',
            });
        }
        setCertInfo(info || {});
        setIsLoadingInfo(false);
    };
    useEffect(() => {
        loadCertInfo();
    }, []);

    return isLoadingInfo ? showLoadingHint() : showInfoTable(certInfo, variant);
};

export default CertificateInfo;
