import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { amber, green, red } from '@mui/material/colors';
import { connect, useDispatch } from 'react-redux';

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DownloadIcon from '@mui/icons-material/GetApp';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MessagePage from './MessagePage';
import OpenSourcePluginIcon from '@mui/icons-material/Code';
import OpenStreamsheetsIcon from '@mui/icons-material/Navigation';
import Paper from '@mui/material/Paper';
import PluginDisabledIcon from '@mui/icons-material/Cancel';
import PluginEnabledIcon from '@mui/icons-material/CheckCircle';
import PremiumPluginIcon from '@mui/icons-material/Stars';
import PreviewStreamsheetsIcon from '@mui/icons-material/Visibility';
import { Link as RouterLink } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import moment from 'moment';
import { useConfirm } from 'material-ui-confirm';
import useFetch from '../helpers/useFetch';

const PREFIX = 'Streamsheets';

const classes = {
    button: `${PREFIX}-button`,
    updateButton: `${PREFIX}-updateButton`,
    badges: `${PREFIX}-badges`,
    closeButton: `${PREFIX}-closeButton`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.button}`]: {
		margin: theme.spacing(1)
	},

    [`& .${classes.updateButton}`]: {
		marginLeft: '20px'
	},

    [`& .${classes.badges}`]: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},

    [`& .${classes.closeButton}`]: {
		position: 'absolute',
		right: theme.spacing(1),
		top: theme.spacing(1),
		color: theme.palette.grey[500]
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

const Streamsheets = (props) => {

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const [previewOpen, setPreviewOpen] = React.useState(false);
	const [selectedInstance, setSelectedInstance] = React.useState({});

	const { client } = context;
	const [response, loading, hasError] = useFetch(
		`${process.env.PUBLIC_URL}/api/config/tools/streamsheets`
	);

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
            <Root>
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
						<IconButton
                            aria-label="close"
                            className={classes.closeButton}
                            onClick={onClosePreviewInstance}
                            size="large">
							<CloseIcon />
						</IconButton>
					</DialogTitle>
					<iframe
						width="1100px"
						height="600px"
						src={selectedInstance?.url}
						title={selectedInstance?.name}
					></iframe>
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
											{streamsheets.type === 'premium' ? (
												<PremiumPluginIcon style={{ color: amber[500] }} fontSize="small" />
											) : (
												<OpenSourcePluginIcon fontSize="small" />
											)}
										</TableCell>
										<TableCell>{streamsheets.id}</TableCell>
										<TableCell>{streamsheets.version}</TableCell>
										<TableCell>{streamsheets.name}</TableCell>
										<TableCell>{streamsheets.description}</TableCell>
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
			</Root>
        );
	} else {
		return null;
	}
};

const mapStateToProps = (state) => {
	return {};
};

export default connect(mapStateToProps)(Streamsheets);
