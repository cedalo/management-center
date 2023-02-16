import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button, IconButton, TableCell, TableRow, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { useSnackbar } from 'notistack';
import ContainerHeader from '../../../components/ContainerHeader';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { WarningHint } from './AlertHint';
import ChipsList from './ChipsList';
import ContentContainer from './ContentContainer';
import ContentTable from './ContentTable';
import DeleteCertificateDialog from './DeleteCertificateDialog';

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
	{ id: 'name', key: 'Name', sortable: true },
	{ id: 'filename', key: 'Filename', sortable: true },
	{ id: 'broker', key: 'Broker', sortable: false }
];

const hasLicenseFeature = (name) => (license) => true || !!license?.features.some((feature) => feature.name === name);
const isLicensed = hasLicenseFeature('cert-management');

const CustomTableRow = ({ cert, onSelect, onDelete }) => {
	return (
		<StyledTableRow hover key={cert.name} onClick={onSelect(cert)} style={{ cursor: 'pointer' }}>
			<TableCell>{cert.name}</TableCell>
			<TableCell>{cert.filename}</TableCell>
			<BadgesCell>
				<ChipsList
					values={(cert.connections || []).map((conn) => ({
						label: conn.name
					}))}
				/>
			</BadgesCell>
			<TableCell align="right">
				<Tooltip title="Delete Certificate">
					<IconButton size="small" onClick={onDelete(cert)}>
						<DeleteIcon fontSize="small" />
					</IconButton>
				</Tooltip>
			</TableCell>
		</StyledTableRow>
	);
};

const Certificates = ({ isCertSupported, doSort, onSort, sortBy, sortDirection }) => {
	// const navigate = useNavigate();
	const history = useHistory();
	const { enqueueSnackbar } = useSnackbar();
	const { client } = useContext(WebSocketContext);
	const [deleteOptions, setDeleteOptions] = useState({ open: false });
	const [certs, setCerts] = useState([]);

	const loadCerts = async () => {
		try {
			const { data } = await client.getCertificates();
			setCerts(Array.from(Object.values(data)));
		} catch (error) {
			enqueueSnackbar(`Error loading certificate from server. Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
	};

	const onDeleteCert = (cert) => (event) => {
		event.stopPropagation();
		setDeleteOptions({ open: true, cert });
	};
	const closeDeleteDialog = () => {
		loadCerts();
		setDeleteOptions({ open: false });
	};
	const onAddNewCertificate = (event) => {
		event.stopPropagation();
		// navigate('/admin/certs/detail/new');
		history.push('/admin/certs/detail/new', { name: '', filename: '', connections: [] });
	};
	const onSelectCertificate = (cert) => (event) => {
		event.stopPropagation();
		history.push(`/admin/certs/detail/${cert.id}`, cert);
	};

	useEffect(() => {
		loadCerts();
	}, []);

	useEffect(() => {
		if (sortBy) setCerts(doSort([...certs], sortDirection, (a) => a[sortBy]));
	}, [sortBy, sortDirection]);

	return (
		<>
			<DeleteCertificateDialog
				client={client}
				onClose={closeDeleteDialog}
				cert={deleteOptions.cert}
				open={deleteOptions.open}
			/>
			<ContentContainer path={[{ link: 'home' }, { link: 'admin' }, { title: 'Certificates' }]}>
				{isCertSupported ? (
					<>
						<ContainerHeader title="Certificates" subTitle="List of currently maintained certificates.">
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
							{/* TODO sort rows */}
							{certs.map((cert) => (
								<CustomTableRow cert={cert} onSelect={onSelectCertificate} onDelete={onDeleteCert} />
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
		connection: state.brokerConnections?.currentConnection,
		isCertSupported: isLicensed(state.license?.license)
	};
};

export default connect(mapStateToProps)(Certificates);
