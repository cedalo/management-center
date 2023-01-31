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
import AutoSuggest from '../../../components/AutoSuggest';
import PremiumFeatureDialog from '../../../components/PremiumFeatureDialog';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { WarningHint } from './AlertHint';
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
	{ id: 'connections', key: 'Connections', sortable: false }
];

const Certificates = (props) => {
	const classes = useStyles();
	// const navigate = useNavigate();
	const history = useHistory();
	const { enqueueSnackbar } = useSnackbar();
	const { client } = useContext(WebSocketContext);

	// CERT: instead of isSupportedTLS maybe check for certs?
	const { isSupportedTLS } = props;
	const { onSort, sortBy, sortDirection, disableSort } = props;
	const [premiumFeatureDialogOpen, setPremiumFeatureDialogOpen] = useState(false);
	const [certs, setCerts] = useState([]);

	const loadCerts = async () => {
		try {
			const allCerts = await client.getCertificates();
			setCerts(Array.from(Object.values(allCerts)));
		} catch (error) {
			enqueueSnackbar(`Error loading certificate from server. Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
	};
	const deleteCert = async (cert) => {
		try {
			await client.deleteCertificate(cert.id);
			loadCerts();
		} catch (error) {
			enqueueSnackbar(
				`Error deleting certificate "${cert.name}" from server. Reason: ${error.message || error}`,
				{
					variant: 'error'
				}
			);
		}
	};

	useEffect(() => {
		loadCerts();
	}, []);

	const handleClosePremiumFeatureDialog = () => {
		setPremiumFeatureDialogOpen(false);
	};

	const onAddNewCertificate = (event) => {
		console.log('add new certificate!');
		event.stopPropagation();
		// navigate('/admin/certs/detail/new');
		history.push('/admin/certs/detail/new', { name: '', filename: '', connections: [] });
	};

	const onSelectCertificate = (cert) => (event) => {
		if (event.target.nodeName?.toLowerCase() === 'td') {
			event.stopPropagation();
			console.log('select certificate!');
			history.push(`/admin/certs/detail/${cert.id}`, cert);
		}
	};

	return (
		<div>
			<PremiumFeatureDialog open={premiumFeatureDialogOpen} handleClose={handleClosePremiumFeatureDialog} />
			<PathCrumbs path={[{ link: 'home' }, { link: 'admin' }, { title: 'Certificate' }]} />
			<br />
			{isSupportedTLS ? (
				<>
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
					{/* wrap in box or paper */}
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
											{/* CERT: want to show registered connections */}
											<AutoSuggest
											// suggestions={connectionSuggestions}
											// values={cert.connections
											// 		.filter((brokerid) => !!connectionsMap.get(brokerid))
											// 		.map((brokerid) => ({
											// 	label: connectionsMap.get(brokerid).name,
											// 	value: connectionsMap.get(brokerid).id
											// }))}
											// handleChange={(value) => {
											// 	onUpdateConnections(cert, value);
											// }}
											/>
										</TableCell>
										<TableCell align="right">
											<Tooltip title="Delete Certificate">
												<IconButton size="small" onClick={() => deleteCert(cert)}>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						) : (
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
