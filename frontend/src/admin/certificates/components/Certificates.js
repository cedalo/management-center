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
import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';
import ContainerBreadCrumbs from '../../../components/ContainerBreadCrumbs';
import ContainerHeader from '../../../components/ContainerHeader';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { WarningHint } from './AlertHint';
import ChipsList from './ChipsList';
import ContentContainer from '../../../components/ContentContainer';
import ContentTable from './ContentTable';
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
	{ id: 'info', key: '', sortable: false, width: '10px' },
	{ id: 'name', key: 'Descriptive Name', sortable: true },
	{ id: 'filename', key: 'Filename', sortable: true },
	{ id: 'broker', key: 'Used by', sortable: false },
	{ id: 'deploy', key: 'Deploy', align: 'center', sortable: false, width: '10px' },
	{ id: 'delete', key: 'Delete', align: 'center', sortable: false, width: '10px' }
];

const hasLicenseFeature = (name) => (license) => !!license?.features.some((feature) => feature.name === name);
const isLicensed = hasLicenseFeature('cert-management');
const failedDeleteMessage = (cert, error) =>
	`Failed to delete certificate "${cert.name}"! Reason: ${error.message || error}`;

const CustomTableRow = ({ cert, connections, handleDelete, names }) => {
	const history = useHistory();
	const [isExpanded, setIsExpanded] = useState(false);

	const onExpand = (event) => {
		event.stopPropagation();
		setIsExpanded(!isExpanded);
	};
	const onDelete = (event) => {
		event.stopPropagation();
		handleDelete(cert);
	};
	const onSelect = (event) => {
		event.stopPropagation();
		// push names to state as well...
		history.push(`/certs/detail/${cert.id}`, { cert, certNames: names });
	};
	const onDeploy = (event) => {
		event.stopPropagation();
		history.push(`/certs/deploy/${cert.id}`, cert);
	};

	return (
		<>
			<StyledTableRow hover key={cert.name} onClick={onSelect} style={{ cursor: 'pointer' }}>
				<TableCell style={{padding: '6px'}}>
					<IconButton aria-label="expand row" size="small" onClick={onExpand}>
						{isExpanded ? <CollapseIcon /> : <ExpandIcon />}
					</IconButton>
				</TableCell>
				<TableCell>{cert.name}</TableCell>
				<TableCell>{cert.filename}</TableCell>
				<BadgesCell>
					<ChipsList
						values={getUsedConnections(connections, cert).map((conn) => ({
							label: conn.name
						}))}
					/>
				</BadgesCell>
				<TableCell align="center">
					<Tooltip title="Deploy/Undeploy Certificate">
						<IconButton size="small" onClick={onDeploy}>
							<UploadIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</TableCell>
				<TableCell align="center">
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

const Certificates = ({ connections, isCertSupported }) => {
	// const navigate = useNavigate();
	const history = useHistory();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client } = useContext(WebSocketContext);
	const [certs, setCerts] = useState([]);
	const certNames = certs.map((cert) => cert.name);

	const loadCerts = async () => {
		if (isCertSupported) {
			try {
				const { data } = await client.getCertificates();
				setCerts(Array.from(Object.values(data)));
			} catch (error) {
				enqueueSnackbar(`Failed to load certificates from server. Reason: ${error.message || error}`, {
					variant: 'error'
				});
			}
		}
	};

	const handleDeleteCert = async (cert) => {
		try {
			// throws on cancel
			await confirm({
				title: 'Confirm delete',
				description: `Do you really want to delete certificate "${cert.name}" and remove it from all brokers?`
			});
			await client
				.deleteCertificate(cert.id)
				.then(() => enqueueSnackbar(`Successfully deleted certificate "${cert.name}"!`, { variant: 'success' }))
				.catch((error) => enqueueSnackbar(failedDeleteMessage(cert, error), { variant: 'error' }));
			await loadCerts();
		} catch (error) {
			if (error) enqueueSnackbar(failedDeleteMessage(cert, error), { variant: 'error' });
		}
	};

	const onAddNewCertificate = (event) => {
		event.stopPropagation();
		// navigate('/certs/detail/new');
		history.push('/certs/detail/new', { name: '', filename: '', certNames });
	};

	useEffect(() => {
		loadCerts();
	}, []);

	return (
		<ContentContainer
			breadCrumbs={<ContainerBreadCrumbs title="Certificates" links={[{name: 'Home', route: '/home'}]}/>}
			dataTour="page-certs"
		>
			{isCertSupported ? (
				<>
					<ContainerHeader
						title="Client certificate management"
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
							<CustomTableRow cert={cert} names={certNames} connections={connections} handleDelete={handleDeleteCert} />
						))}
					</ContentTable>
				</>
			) : (
				WarningHint({
					title: 'Certificate management feature is not available',
					message: 'Make sure that support for certificate management is included in your MMC license.'
				})
			)}
		</ContentContainer>
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
