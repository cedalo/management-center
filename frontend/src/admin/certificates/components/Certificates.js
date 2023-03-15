import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Box, Button, Collapse, IconButton, TableCell, TableRow, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import UploadIcon from '@material-ui/icons/CloudUploadOutlined';
import ExpandIcon from '@material-ui/icons/KeyboardArrowDown';
import CollapseIcon from '@material-ui/icons/KeyboardArrowUp';
import { useSnackbar } from 'notistack';
import ContainerHeader from '../../../components/ContainerHeader';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { WarningHint } from './AlertHint';
import ChipsList from './ChipsList';
import ContentContainer from './ContentContainer';
import ContentTable from './ContentTable';
import CertificateDeleteDialog from './CertificateDeleteDialog';
import { getUsedConnections } from './certutils';
import CertificateInfo from './CertificateInfo';

const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.tables?.odd
		}
	}
}))(TableRow);
const BadgesCell = withStyles((theme) => ({
	badges: {
		'& > *': {
			margin: theme.spacing(0.5)
		}
	}
}))(TableCell);

const CERT_TABLE_COLUMNS = [
	{ id: 'info', key: '', sortable: false },
	{ id: 'name', key: 'Descriptive Name', sortable: true },
	{ id: 'filename', key: 'Filename', sortable: true },
	{ id: 'broker', key: 'Used by', sortable: false },
	{ id: 'deploy', key: '', sortable: false },
	{ id: 'delete', key: '', sortable: false }
];

const hasLicenseFeature = (name) => (license) => !!license?.features.some((feature) => feature.name === name);
const isLicensed = hasLicenseFeature('cert-management');

const CustomTableRow = ({ cert, connections, handleDelete }) => {
	const history = useHistory();
	const [isExpanded, setIsExpanded] = useState(false);

	const onExpand = (event) => {
		event.stopPropagation();
		setIsExpanded(!isExpanded)
	}
	const onDelete = (event) => {
		event.stopPropagation();
		handleDelete(cert);
	}
	const onSelect = (event) => {
		event.stopPropagation();
		history.push(`/certs/detail/${cert.id}`, cert);
	};
	const onDeploy = (event) => {
		event.stopPropagation();
		history.push(`/certs/deploy/${cert.id}`, cert);
	}

	return (
		<>
			<StyledTableRow hover key={cert.name} onClick={onSelect} style={{ cursor: 'pointer' }}>
				<TableCell>
					<IconButton aria-label="expand row" size="small" onClick={onExpand}>
						{isExpanded ? <CollapseIcon /> : <ExpandIcon />}
					</IconButton>
				</TableCell>
				<TableCell>{cert.name}</TableCell>
				<TableCell>{cert.filename}</TableCell>
				<BadgesCell>
					<ChipsList
						values={getUsedConnections(connections, cert.listeners).map((conn) => ({
							label: conn.name
						}))}
					/>
				</BadgesCell>
				<TableCell align="right">
					<Tooltip title="Deploy Certificate">
						<IconButton size="small" onClick={onDeploy}>
							<UploadIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</TableCell>
				<TableCell align="right">
					<Tooltip title="Delete Certificate">
						<IconButton size="small" onClick={onDelete}>
							<DeleteIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</TableCell>
			</StyledTableRow>
			<StyledTableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
					<Collapse in={isExpanded} timeout="auto" unmountOnExit>
						<Box margin={1} display="flex" flexDirection="row">
							<CertificateInfo certificate={cert} variant="summary" />
						</Box>
					</Collapse>
				</TableCell>
			</StyledTableRow>
		</>
	);
};

const Certificates = ({ connections, isCertSupported, doSort, sortBy, sortDirection }) => {
	// const navigate = useNavigate();
	const history = useHistory();
	const { enqueueSnackbar } = useSnackbar();
	const { client } = useContext(WebSocketContext);
	const [deleteOptions, setDeleteOptions] = useState({ open: false });
	const [certs, setCerts] = useState([]);

	const loadCerts = async () => {
		if (isCertSupported) {
			try {
				const { data } = await client.getCertificates();
				setCerts(Array.from(Object.values(data)));
			} catch (error) {
				enqueueSnackbar(`Error loading certificates from server. Reason: ${error.message || error}`, {
					variant: 'error'
				});
			}
		}
	};
	
	const handleDeleteCert = async (cert) => {
		try {
			await client
				.deleteCertificate(cert.id)
				// .undeployDeleteCertificate(cert.id)
				.catch((error) => enqueueSnackbar(error.message || error, { variant: 'error' }));
			await loadCerts();
		} catch (error) {
			enqueueSnackbar(error.message || error, { variant: 'error' });
		}

		// setDeleteOptions({ open: true, cert });
	};
	const closeDeleteDialog = () => {
		loadCerts();
		setDeleteOptions({ open: false });
	};
	const onAddNewCertificate = (event) => {
		event.stopPropagation();
		// navigate('/certs/detail/new');
		history.push('/certs/detail/new', { name: '', filename: '', connections: [] });
	};

	useEffect(() => {
		loadCerts();
	}, []);

	useEffect(() => {
		if (sortBy) setCerts(doSort([...certs], sortDirection, (a) => a[sortBy]));
	}, [sortBy, sortDirection]);

	return (
		<>
			<CertificateDeleteDialog
				client={client}
				onClose={closeDeleteDialog}
				cert={deleteOptions.cert}
				open={deleteOptions.open}
			/>
			<ContentContainer path={[{ route: 'home', name: 'Home' }, { name: 'Certificates' }]}>
				{isCertSupported ? (
					<>
						<ContainerHeader
							title="Client certificates management"
							subTitle="List of currently maintained client certificates. Upload Client certificate authorities and deploy them on your broker. "
						>
							<Button
								variant="outlined"
								color="primary"
								size="small"
								startIcon={<AddIcon />}
								onClick={onAddNewCertificate}
							>
								Add Certificate
							</Button>
						</ContainerHeader>
						<ContentTable columns={CERT_TABLE_COLUMNS}>
							{certs.map((cert) => (
								<CustomTableRow cert={cert} connections={connections} handleDelete={handleDeleteCert} />
							))}
						</ContentTable>
					</>
				) : (
					WarningHint({
						title: 'Certificates management feature is not available',
						message: 'Make sure that support for certificates management is included in your MMC license.'
					})
				)}
			</ContentContainer>
		</>
	);
};

const mapStateToProps = (state) => {
	return {
		// connection: state.brokerConnections?.currentConnection,
		connections: state.brokerConnections?.brokerConnections,
		isCertSupported: isLicensed(state.license?.license)
	};
};

export default connect(mapStateToProps)(Certificates);
