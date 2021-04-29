import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import MessagePage from './MessagePage';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { makeStyles, withStyles } from '@material-ui/core/styles';

import { updateStream, updateStreams } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@material-ui/icons/Add';
import { Alert, AlertTitle } from '@material-ui/lab';
import ReloadIcon from '@material-ui/icons/Replay';
import AutoSuggest from './AutoSuggest';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import ClientIcon from '@material-ui/icons/Person';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import Grid from '@material-ui/core/Grid';
import GroupIcon from '@material-ui/icons/Group';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import ClearStreamIcon from '@material-ui/icons/ClearAll';
import ReplayIcon from '@material-ui/icons/PlayCircleFilled';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import { WebSocketContext } from '../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';

import ReplayStreamDialog from './streams/ReplayStreamDialog';

const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.tables?.odd
		},
		cursor: 'pointer'
	}
}))(TableRow);

const useStyles = makeStyles((theme) => ({
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink,
	link: {
		color: 'inherit'
	}
	// tableContainer: {
	// 	borderWidth: '1px',
	// 	borderStyle: 'solid',
	// }
}));

const STREAM_TABLE_COLUMNS = [
	{ id: 'streamname', key: 'Stream name' },
	{ id: 'textDescription', key: 'Description' },
	{ id: 'sourcetopic', key: 'Source topic' },
	{ id: 'targettopic', key: 'Target topic' },
	{ id: 'targetqos', key: 'Target QoS' },
	{ id: 'ttl', key: 'TTL' },
	{ id: 'process', key: 'Process' },
	{ id: 'persist', key: 'Persist' },
	{ id: 'active', key: 'Active' },
];

const Streams = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;
	const { streamprocessingFeature, connectionID, streams = [], onSort, sortBy, sortDirection } = props;
	const [replayStreamEditorOpen, setReplayStreamEditorOpen] = React.useState(false);
	const [replayStream, setReplayStream] = React.useState({});

	const handleClickReplayStreamEditorOpen = () => {
		setReplayStreamEditorOpen(true);
	};
  
	const handleReplayStreamEditorClose = () => {
		setReplayStreamEditorOpen(false);
	};

	const handleReplay = async (stream, { replayTopic, gte, lte, reverse, limit, speed }) => {
		try {
			await brokerClient.replayStream({
				streamname: stream.streamname,
				replayTopic,
				gte,
				lte,
				reverse,
				limit,
				speed
			});
			const streams = await brokerClient.listStreams();
			dispatch(updateStreams(streams));
			enqueueSnackbar(`Successfully started replay of stream "${stream.streamname}"`, {
				variant: 'success'
			});
			setReplayStreamEditorOpen(false);
		} catch (error) {
			enqueueSnackbar(`Error starting replay of stream "${stream.streamname}". Reason: ${error}`, {
				variant: 'error'
			});
			setReplayStreamEditorOpen(false);
		}
	}

	const onNewStream = () => {
		history.push('/streams/new');
	};

	const onReload = async () => {
		const streams = await brokerClient.listStreams();
		dispatch(updateStreams(streams));
	}

	const onDisableStream = async (streamname) => {
		await confirm({
			title: 'Confirm stream disable',
			description: `Do you really want to disable stream "${streamname}"?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		await brokerClient.disableStream(streamname);
		const streams = await brokerClient.listStreams();
		enqueueSnackbar('Stream successfully disabled', {
			variant: 'success'
		});
		dispatch(updateStreams(streams));
	};

	const onEnableStream = async (streamname) => {
		await brokerClient.enableStream(streamname);
		const streams = await brokerClient.listStreams();
		enqueueSnackbar('Stream successfully enabled', {
			variant: 'success'
		});
		dispatch(updateStreams(streams));
	};

	const onEnableProcessStream = async (streamname) => {
		await brokerClient.processStream(streamname, true);
		const streams = await brokerClient.listStreams();
		enqueueSnackbar('Stream processing successfully enabled', {
			variant: 'success'
		});
		dispatch(updateStreams(streams));
	};

	const onDisableProcessStream = async (streamname) => {
		await brokerClient.processStream(streamname, false);
		const streams = await brokerClient.listStreams();
		enqueueSnackbar('Stream processing successfully disabled', {
			variant: 'success'
		});
		dispatch(updateStreams(streams));
	};

	const onEnablePersistStream = async (streamname) => {
		await brokerClient.persistStream(streamname, true);
		const streams = await brokerClient.listStreams();
		enqueueSnackbar('Stream persistence successfully enabled', {
			variant: 'success'
		});
		dispatch(updateStreams(streams));
	};

	const onDisablePersistStream = async (streamname) => {
		await brokerClient.persistStream(streamname, false);
		const streams = await brokerClient.listStreams();
		enqueueSnackbar('Stream persistence successfully disabled', {
			variant: 'success'
		});
		dispatch(updateStreams(streams));
	};

	const onSelectStream = async (streamname) => {
		const stream = await brokerClient.getStream(streamname);
		dispatch(updateStream(stream));
		history.push(`/streams/detail/${streamname}`);
	};

	const onClearStreamMessages = async (streamname) => {
		await confirm({
			title: 'Confirm clear all stream messages',
			description: `Do you really want to clear all messages in the stream "${streamname}"?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		try {
			await brokerClient.clearStreamMessages(streamname);
			enqueueSnackbar(`Messages from stream "${streamname}" successfully cleared.`, {
				variant: 'success'
			});
		} catch(error) {
			enqueueSnackbar(`Error clearing messages from "${streamname}". Reason: ${error}`, {
				variant: 'error'
			});
		}
	};

	const onReplayStream = async (stream) => {
		setReplayStream(stream);
		setReplayStreamEditorOpen(true);
	};

	const onDeleteStream = async (streamname) => {
		await confirm({
			title: 'Confirm stream deletion',
			description: `Do you really want to delete stream "${streamname}"?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		await brokerClient.deleteStream(streamname);
		enqueueSnackbar(`Stream "${streamname}" successfully deleted`, {
			variant: 'success'
		});
		const streams = await brokerClient.listStreams();
		dispatch(updateStreams(streams));
	};

	return (
		<div>
			<ReplayStreamDialog 
				stream={replayStream} 
				open={replayStreamEditorOpen} 
				handleReplay={handleReplay}
				handleClose={handleReplayStreamEditorClose}
			/>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Streams
				</Typography>
			</Breadcrumbs>
			{/* TODO: Quick hack to detect whether feature is supported */}
			{streamprocessingFeature?.supported === false ? <><br/><Alert severity="warning">
				<AlertTitle>Enterprise Solution feature</AlertTitle>
				Streams are a premium feature. For more information visit <a className={classes.link} href="https://www.cedalo.com">cedalo.com</a> or contact us at <a className={classes.link} href="mailto:info@cedalo.com">info@cedalo.com</a>.
			</Alert></> : null}
			{streamprocessingFeature?.supported !== false && <Grid container spacing={1} alignItems="flex-end">
				<Grid item xs={6}>
					<Button
						variant="outlined"
						color="default"
						size="small"
						className={classes.button}
						startIcon={<AddIcon />}
						onClick={(event) => {
							event.stopPropagation();
							onNewStream();
						}}
					>
						New Stream
					</Button>
				</Grid>
				<Grid item xs={6}>
					<Box display="flex" flexDirection="row-reverse">
						<Tooltip title="Reload streams">
							<IconButton
								color="secondary"
								aria-label="Reload streams"
								component="span"
								onClick={(event) => {
									event.stopPropagation();
									onReload();
								}}
							>
								<ReloadIcon />
							</IconButton>
						</Tooltip>
					</Box>
				</Grid>
			</Grid>}
			<br />
			{streamprocessingFeature?.supported !== false && streams && streams.length > 0 ? (
				<div>
					<Hidden xsDown implementation="css">
						<TableContainer component={Paper} className={classes.tableContainer}>
							<Table size="medium">
								<TableHead>
									<TableRow>
										{STREAM_TABLE_COLUMNS.map((column) => (
											<TableCell
												key={column.id}
												sortDirection={sortBy === column.id ? sortDirection : false}
											>
												{/* <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortDirection}
                      onClick={() => onSort(column.id)}
                    > */}
												{column.key}
												{/* </TableSortLabel> */}
											</TableCell>
										))}
										<TableCell />
									</TableRow>
								</TableHead>
								<TableBody>
									{streams &&
										streams.map((stream) => (
											<StyledTableRow
												hover
												key={stream.streamname}
												onClick={(event) => {
													if (
														event.target.nodeName?.toLowerCase() === 'td'
													) {
														onSelectStream(stream.streamname);
													}
												}}
											>
												<TableCell>{stream.streamname}</TableCell>
												<TableCell>{stream.textdescription}</TableCell>
												<TableCell>{stream.sourcetopic}</TableCell>
												<TableCell>{stream.targettopic}</TableCell>
												<TableCell>{stream.targetqos}</TableCell>
												<TableCell>{stream.ttl}</TableCell>
												{/* <TableCell>{stream.replaying ? "replaying" : "stopped"}</TableCell> */}
												<TableCell>
													<Tooltip title="Process stream">
														<Switch
															checked={
																typeof stream.process === 'undefined' ||
																stream.process === true
															}
															onClick={(event) => {
																event.stopPropagation();
																if (event.target.checked) {
																	onEnableProcessStream(stream.streamname);
																} else {
																	onDisableProcessStream(stream.streamname);
																}
															}}
														/>
													</Tooltip>
												</TableCell>
												<TableCell>
													<Tooltip title="Persist stream">
														<Switch
															checked={
																typeof stream.persist === 'undefined' ||
																stream.persist === true
															}
															onClick={(event) => {
																event.stopPropagation();
																if (event.target.checked) {
																	onEnablePersistStream(stream.streamname);
																} else {
																	onDisablePersistStream(stream.streamname);
																}
															}}
														/>
													</Tooltip>
												</TableCell>
												<TableCell>
													<Tooltip title="Activate / Deactivate stream">
														<Switch
															checked={
																typeof stream.active === 'undefined' ||
																stream.active === true
															}
															onClick={(event) => {
																event.stopPropagation();
																if (event.target.checked) {
																	onEnableStream(stream.streamname);
																} else {
																	onDisableStream(stream.streamname);
																}
															}}
														/>
													</Tooltip>
												</TableCell>
												<TableCell align="right">
													<Tooltip title="Clear stream messages">
														<IconButton
															disabled={!stream.persist}
															size="small"
															onClick={(event) => {
																event.stopPropagation();
																onClearStreamMessages(stream.streamname);
															}}
														>
															<ClearStreamIcon fontSize="small" />
														</IconButton>
													</Tooltip>
													<Tooltip title="Replay stream">
														<IconButton
															disabled={!stream.persist}
															size="small"
															onClick={(event) => {
																event.stopPropagation();
																onReplayStream(stream);
															}}
														>
															<ReplayIcon fontSize="small" />
														</IconButton>
													</Tooltip>
													<Tooltip title="Delete stream">
														<IconButton
															size="small"
															onClick={(event) => {
																event.stopPropagation();
																onDeleteStream(stream.streamname);
															}}
														>
															<DeleteIcon fontSize="small" />
														</IconButton>
													</Tooltip>
												</TableCell>
											</StyledTableRow>
										))}
								</TableBody>
							</Table>
						</TableContainer>
					</Hidden>
					<Hidden smUp implementation="css">
						<Paper>
							<List className={classes.root}>
								{streams.map((stream) => (
									<React.Fragment>
										<ListItem
											alignItems="flex-start"
											onClick={(event) => onSelectStream(stream.streamname)}
										>
											<ListItemText
												primary={<span>{stream.streamname}</span>}
												secondary={
													<React.Fragment>
														<Typography
															component="span"
															variant="body2"
															className={classes.inline}
															color="textPrimary"
														>
															{stream.streamname}
														</Typography>
													</React.Fragment>
												}
											/>
											<ListItemSecondaryAction>
												<IconButton
													edge="end"
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														onSelectStream(stream.streamname);
													}}
													aria-label="edit"
												>
													<EditIcon fontSize="small" />
												</IconButton>

												<IconButton
													edge="end"
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														onDeleteStream(stream.streamname);
													}}
													aria-label="delete"
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</ListItemSecondaryAction>
										</ListItem>
										<Divider />
									</React.Fragment>
								))}
							</List>
						</Paper>
					</Hidden>
				</div>
			) : (
				<div>No streams found</div>
			)}
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		streams: state.streams?.streams,
		streamprocessingFeature: state.systemStatus?.features?.streamprocessing
	};
};

export default connect(mapStateToProps)(Streams);
