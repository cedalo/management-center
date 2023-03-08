import React, { useContext, useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';
import CASignedIcon from '@material-ui/icons/Check';
import SelfSignedIcon from '@material-ui/icons/Cancel';

import { useSnackbar } from 'notistack';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { parseSubjectInfo } from './certutils';

const getDate = (str) => {
	return str ? new Date(Date.parse(str)).toLocaleString() : 'n.a.';
};
const borderlessCell = (text = '') => <TableCell style={{ borderBottom: 'none' }}>{text}</TableCell>;
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
					<TableCell align="left">CA certificate</TableCell>
					<TableCell align="left">
						{isSelfSigned ? (
							<SelfSignedIcon fontSize="small" style={{ color: red[500] }} />
						) : (
							<CASignedIcon fontSize="small" style={{ color: green[500] }} />
						)}
					</TableCell>
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
const getFingerprints = ({ sha1, sha256, sha512 } = {}) => (
	<Table aria-label="fingerprints">
		<TableRow>
			<TableCell>SHA1</TableCell>
			<TableCell>{sha1}</TableCell>
		</TableRow>
		<TableRow>
			<TableCell>SHA256</TableCell>
			<TableCell>{sha256}</TableCell>
		</TableRow>
		<TableRow>
			<TableCell>SHA512</TableCell>
			<TableCell>{sha512}</TableCell>
		</TableRow>
	</Table>
);

const getDetailTable = (info = {}) => {
	const { ca, fingerprints, infoAccess, issuer, keyUsage, serialNumber, subject, subjectAltName, valid } = info;
	return (
		<Table aria-label="certinfo-detail">
			<TableHead>
				<TableRow>
					<TableCell>Details</TableCell>
					<TableCell></TableCell>
					<TableCell></TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				<TableRow>
					{borderlessCell()}
					<TableCell align="left">CA certificate</TableCell>
					<TableCell align="left">
						{!ca ? (
							<SelfSignedIcon fontSize="small" style={{ color: red[500] }} />
						) : (
							<CASignedIcon fontSize="small" style={{ color: green[500] }} />
						)}
					</TableCell>
				</TableRow>
				<TableRow>
					{borderlessCell()}
					<TableCell align="left">Fingerprint SHA 256</TableCell>
					<TableCell align="left">{fingerprints?.sha256}</TableCell>
					{/* {getFingerprints(fingerprints)} */}
				</TableRow>
				<TableRow>
					{borderlessCell()}
					<TableCell align="left">Subject</TableCell>
					<TableCell align="left">{subject}</TableCell>
				</TableRow>
				<TableRow>
					{borderlessCell()}
					<TableCell align="left">Subject Alternative Name</TableCell>
					<TableCell align="left">{subjectAltName}</TableCell>
				</TableRow>
				<TableRow>
					{borderlessCell()}
					<TableCell align="left">Key Usage</TableCell>
					<TableCell align="left">{keyUsage}</TableCell>
				</TableRow>
				<TableRow>
					{borderlessCell()}
					<TableCell align="left">Serial Number</TableCell>
					<TableCell align="left">{serialNumber}</TableCell>
				</TableRow>
				<TableRow>
					{borderlessCell()}
					<TableCell align="left">Issuer</TableCell>
					<TableCell align="left">{issuer}</TableCell>
				</TableRow>
				<TableRow>
					{borderlessCell()}
					<TableCell align="left">Authority Information Access</TableCell>
					<TableCell align="left">{infoAccess}</TableCell>
				</TableRow>
				<TableRow>
					{borderlessCell()}
					<TableCell align="left">Valid From</TableCell>
					<TableCell align="left">{getDate(valid?.from)}</TableCell>
				</TableRow>
				<TableRow>
					{borderlessCell()}
					{borderlessCell('Valid To')}
					{borderlessCell(getDate(valid?.to))}
				</TableRow>
			</TableBody>
		</Table>
	);
};
const showInfoTable = (info, variant) => (variant === 'summary' ? getSummaryTable(info) : getDetailTable(info));

const CertificateInfo = ({ certificate, variant }) => {
	const [certInfo, setCertInfo] = useState({});
	const { enqueueSnackbar } = useSnackbar();
	const context = useContext(WebSocketContext);
	const { client } = context;

	const loadCertInfo = async () => {
		try {
			const { data } = await client.getCertificateInfo(certificate);
			setCertInfo(data);
		} catch (error) {
			enqueueSnackbar(`Error loading certificate info from server. Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
	};

	useEffect(() => {
		loadCertInfo();
	}, []);

	return showInfoTable(certInfo, variant);
};

export default CertificateInfo;
