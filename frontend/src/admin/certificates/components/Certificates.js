import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
	Button,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Tooltip
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { useSnackbar } from 'notistack';
import PremiumFeatureDialog from '../../../components/PremiumFeatureDialog';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { WarningHint } from './AlertHint';
import ChipsList from './ChipsList';
import DeleteCertificateDialog from './DeleteCertificateDialog';
import PathCrumbs from './PathCrumbs';

const useStyles = makeStyles((theme) => ({
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink,
	badges: {
		'& > *': {
			margin: theme.spacing(0.5)
		}
	},
	tableContainer: {
		minHeight: '500px'
	}
}));

const CERT_TABLE_COLUMNS = [
	{ id: 'name', key: 'Name', sortable: true },
	{ id: 'filename', key: 'Filename', sortable: true },
	{ id: 'brokers', key: 'Brokers', sortable: false }
];

const Certificates = (props) => {
	const classes = useStyles();
	// const navigate = useNavigate();
	const history = useHistory();
	const { enqueueSnackbar } = useSnackbar();
	const { client } = useContext(WebSocketContext);

	// CERT: instead of isSupportedTLS maybe check for certs?
	const { isSupportedTLS } = props;
	const { doSort, onSort, sortBy, sortDirection, disableSort } = props;
	const [premiumFeatureDialogOpen, setPremiumFeatureDialogOpen] = useState(false);
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
	}
	const closeDeleteDialog = () => {
		loadCerts();
		setDeleteOptions({ open: false });
	}
	const handleClosePremiumFeatureDialog = () => {
		setPremiumFeatureDialogOpen(false);
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
		// CERT: handle sort reset else setCerts(certs);
	}, [sortBy, sortDirection])

	return (
		<div>
			<PremiumFeatureDialog open={premiumFeatureDialogOpen} handleClose={handleClosePremiumFeatureDialog} />
			<PathCrumbs path={[{ link: 'home' }, { link: 'admin' }, { title: 'Certificate' }]} />
			<br />
			{isSupportedTLS ? (
				<>
					<DeleteCertificateDialog
						client={client}
						onClose={closeDeleteDialog}
						cert={deleteOptions.cert}
						open={deleteOptions.open}
					/>
					<Button
						variant="outlined"
						color="default"
						size="small"
						className={classes.button}
						startIcon={<AddIcon />}
						onClick={onAddNewCertificate}
					>
						Add Certificate
					</Button>
					{certs.length > 0 && (
						<Button
							size="small"
							color="primary"
							variant="outlined"
							style={{ marginLeft: '20px' }}
							onClick={disableSort}
						>
							Reset
						</Button>
					)}
					<br />
					<br />
					<TableContainer component={Paper} className={classes.tableContainer}>
						<Table>
							<TableHead>
								<TableRow>
									{CERT_TABLE_COLUMNS.map((column) => (
										<TableCell
											key={column.id}
											sortDirection={sortBy === column.id ? sortDirection : false}
										>
											{column.sortable ? (
												<TableSortLabel
													active={sortBy === column.id}
													direction={sortDirection}
													onClick={() => onSort(column.id)}
												>
													{column.key}
												</TableSortLabel>
											) : (
												<>{column.key}</>
											)}
										</TableCell>
									))}
									<TableCell />
								</TableRow>
							</TableHead>
							<TableBody>
								{certs.map((cert) => (
									<TableRow
										hover
										key={cert.name}
										onClick={onSelectCertificate(cert)}
										style={{ cursor: 'pointer' }}
									>
										<TableCell>{cert.name}</TableCell>
										<TableCell>{cert.filename}</TableCell>
										<TableCell className={classes.badges}>
											<ChipsList
												values={(cert.connections || []).map((conn) => ({ label: conn.name }))}
											/>
										</TableCell>
										<TableCell align="right">
											<Tooltip title="Delete Certificate">
												<IconButton size="small" onClick={onDeleteCert(cert)}>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</>
			) : (
				WarningHint({
					title: 'TLS feature is not available',
					message: 'Make sure that support for custom TLS certificates is included in your MMC license.'
				})
			)}
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		connection: state.brokerConnections?.currentConnection,
		isSupportedTLS: state.systemStatus?.features?.tls?.supported
	};
};

export default connect(mapStateToProps)(Certificates);
