import moment from 'moment';
import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import PluginDisabledIcon from '@material-ui/icons/Cancel';
import PluginEnabledIcon from '@material-ui/icons/CheckCircle';
import Switch from '@material-ui/core/Switch';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import DownloadIcon from '@material-ui/icons/GetApp';
import OpenSourcePluginIcon from '@material-ui/icons/Code';
import PremiumPluginIcon from '@material-ui/icons/Stars';
import { amber, green, red } from '@material-ui/core/colors';
import OpenStreamsheetsIcon from '@material-ui/icons/Navigation';
import PreviewStreamsheetsIcon from '@material-ui/icons/Visibility';

import { Link as RouterLink } from 'react-router-dom';

import { WebSocketContext } from '../websockets/WebSocket';
import MessagePage from './MessagePage';
import useFetch from '../helpers/useFetch';

const useStyles = makeStyles((theme) => ({
	button: {
		margin: theme.spacing(1),
	},
	updateButton: {
		marginLeft: '20px'
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const Streamsheets = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const [previewOpen, setPreviewOpen] = React.useState(false);
	const [selectedInstance, setSelectedInstance] = React.useState({});

	const { client } = context;
	const [response, loading, hasError] = useFetch(`http://${window.location.hostname}:8088/api/config/tools/streamsheets`);

	const onPreviewInstance = async (instance) => {
		setSelectedInstance(instance);
		setPreviewOpen(true);
	};

	const onClosePreviewInstance = () => {
		setSelectedInstance({});
		setPreviewOpen(false);
	  };

	const onSelectInstance = async (instance) => {
		window.open(instance.url, '_blank');
	};

	const onDownloadStreamsheets = async (instance) => {
		window.open('https://www.cedalo.com', '_blank');
	};

	if (response) {
		return (
			<div>
				<Dialog
					onClose={onClosePreviewInstance}
					aria-labelledby="Streamsheets preview"
					open={previewOpen}
					maxWidth={false}
					// style={{
					// 	width: '1400px',
					// }}
				>
					<DialogTitle id="streamsheets-preview">
						{selectedInstance?.name}
						<Button
							variant="contained"
							color="primary"
							className={classes.button}
							startIcon={<OpenStreamsheetsIcon />}
							onClick={(event) => {
								event.stopPropagation();
								onSelectInstance(selectedInstance);
							}}
							size="small"
						>
							Open in new tab
						</Button>
						{/* <IconButton
							size="small"
							aria-label="Open Streamsheets instance"
							onClick={(event) => {
								event.stopPropagation();
								onSelectInstance(selectedInstance);
							}}
						>
							<OpenStreamsheetsIcon fontSize="small" />
						</IconButton> */}
					</DialogTitle>
					<iframe width="1100px" height="600px" src={selectedInstance?.url} title={selectedInstance?.name}></iframe>
				</Dialog>
				<Breadcrumbs aria-label="breadcrumb">
					<RouterLink className={classes.breadcrumbLink} to="/home">
						Home
					</RouterLink>
					<Typography className={classes.breadcrumbItem} color="textPrimary">
						Streamsheets
					</Typography>
				</Breadcrumbs>
				<br />
				{response?.instances && response?.instances?.length > 0 ? (
					<TableContainer component={Paper} className={classes.tableContainer}>
						<Table size="medium">
							<TableHead>
								<TableRow>
									<TableCell>Type</TableCell>
									<TableCell>ID</TableCell>
									<TableCell>Version</TableCell>
									<TableCell>Name</TableCell>
									<TableCell>Description</TableCell>
									<TableCell>Actions</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{response?.instances?.map((streamsheets) => (
									<TableRow
										// hover
										// onClick={(event) => {
										// 	onSelectInstance(streamsheets);
										// }}
										// style={{ cursor: 'pointer' }}
									>
										<TableCell>
											{streamsheets.type === 'premium' ? <PremiumPluginIcon style={{ color: amber[500] }} fontSize="small" /> : <OpenSourcePluginIcon fontSize="small" /> }
										</TableCell>
										<TableCell>
											{streamsheets.id}
										</TableCell>
										<TableCell>
											{streamsheets.version}
										</TableCell>
										<TableCell>
											{streamsheets.name}
										</TableCell>
										<TableCell>
											{streamsheets.description}
										</TableCell>
										<TableCell align="right">
											<Tooltip title="Open Streamsheets instance">
												<Button
													variant="contained"
													color="primary"
													className={classes.button}
													startIcon={<PreviewStreamsheetsIcon />}
													onClick={(event) => {
														event.stopPropagation();
														onPreviewInstance(streamsheets);
													}}
													size="small"
												>
													Open
												</Button>
												{/* <IconButton
													size="small"
													aria-label="Preview Streamsheets instance"
													onClick={(event) => {
														event.stopPropagation();
														onPreviewInstance(streamsheets);
													}}
													size="small"
													variant="contained"
												>
													<PreviewStreamsheetsIcon fontSize="small" />
												</IconButton> */}
											</Tooltip>
											{/* <Tooltip title="Open Streamsheets instance">
												<Button
													variant="contained"
													color="primary"
													className={classes.button}
													startIcon={<OpenStreamsheetsIcon />}
													onClick={(event) => {
														event.stopPropagation();
														onSelectInstance(streamsheets);
													}}
													size="small"
												>
													Open
												</Button> */}
												{/* <IconButton
													size="small"
													aria-label="Open Streamsheets instance"
													onClick={(event) => {
														event.stopPropagation();
														onSelectInstance(streamsheets);
													}}
												>
													<OpenStreamsheetsIcon fontSize="small" />
												</IconButton> */}
											{/* </Tooltip> */}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
					) : (
						<MessagePage 
							message="We could not find any Streamsheets installation."
							buttonIcon={<DownloadIcon />}
							buttonText="Get Streamsheets now!"
							callToAction={onDownloadStreamsheets}
						/>
					)}
			</div>
		)
	} else {
		return null;
	}
};

const mapStateToProps = (state) => {
	return {
		license: state.license?.license,
		version: state.version?.version
	};
};

export default connect(mapStateToProps)(Streamsheets);
