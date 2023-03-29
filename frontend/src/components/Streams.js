import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AddIcon from '@material-ui/icons/Add';
import ClearStreamIcon from '@material-ui/icons/ClearAll';
import DeleteIcon from '@material-ui/icons/Delete';
import ReplayIcon from '@material-ui/icons/PlayCircleFilled';
import ReloadIcon from '@material-ui/icons/Replay';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateStream, updateStreams} from '../actions/actions';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
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
	link: {
		color: 'inherit'
	}
}));

const STREAM_TABLE_COLUMNS = [
	{id: 'name', key: 'Name', width: '10%', align: 'left'},
	{id: 'textDescription', key: 'Description', width: '15%', align: 'left'},
	{id: 'sourcetopic', key: 'Source Topic', width: '20%', align: 'left'},
	{id: 'targettopic', key: 'Target Topic', width: '20%', align: 'left'},
	{id: 'process', key: 'Process', width: '5%', align: 'center'},
	{id: 'persist', key: 'Persist', width: '5%', align: 'center'},
	{id: 'active', key: 'Active', width: '5%', align: 'center'},
	{id: 'action', key: 'Action', width: '10%', align: 'center'},
];

const Streams = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const {enqueueSnackbar} = useSnackbar();
	const {client: brokerClient} = context;
	const {streamprocessingFeature, connectionID, streams = [], onSort, sortBy, sortDirection, connected} = props;
	const [replayStreamEditorOpen, setReplayStreamEditorOpen] = React.useState(false);
	const [replayStream, setReplayStream] = React.useState({});
	const small = useMediaQuery(theme => theme.breakpoints.down('xs'));
	const medium = useMediaQuery(theme => theme.breakpoints.between('sm', 'sm'));

	const handleClickReplayStreamEditorOpen = () => {
		setReplayStreamEditorOpen(true);
	};
	const handleReplayStreamEditorClose = () => {
		setReplayStreamEditorOpen(false);
	};
	const handleReplay = async (stream, {replayTopic, gte, lte, reverse, limit, speed}) => {
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
		history.push(`/streams/${streamname}`);
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
		} catch (error) {
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
		<div style={{height: '100%'}}>
			<ReplayStreamDialog
				stream={replayStream}
				open={replayStreamEditorOpen}
				handleReplay={handleReplay}
				handleClose={handleReplayStreamEditorClose}
			/>
			<ContainerBreadCrumbs title="Streams" links={[{name: 'Home', route: '/home'}]}/>
			<div style={{height: 'calc(100% - 26px)'}}>
				<div style={{display: 'grid', gridTemplateRows: 'max-content auto', height: '100%'}}>
					<ContainerHeader
						title="Streams"
						subTitle="List of all defined streams. Stream are used to transfer or persist topic payloads."
						connectedWarning={!connected}
						featureWarning={streamprocessingFeature?.supported === false ? "Streams" : undefined}
					>
						{streamprocessingFeature?.supported !== false ? [
							<Button
								variant="outlined"
								color="primary"
								size="small"
								style={{marginRight: '10px'}}
								startIcon={<AddIcon/>}
								onClick={(event) => {
									event.stopPropagation();
									onNewStream();
								}}
							>
								New Stream
							</Button>,
							<Button
								variant="outlined"
								color="primary"
								size="small"
								style={{paddingRight: '0px', minWidth: '30px'}}
								startIcon={<ReloadIcon/>}
								onClick={(event) => {
									event.stopPropagation();
									onReload();
								}}
							/>
						] : null}
					</ContainerHeader>
					{streamprocessingFeature?.supported !== false && streams && streams.length > 0 ? (
						<div style={{height: '100%', overflowY: 'auto'}}>
							<TableContainer>
								<Table size="small">
									<TableHead>
										<TableRow>
											{STREAM_TABLE_COLUMNS.map((column) => (
												<TableCell
													key={column.id}
													sortDirection={sortBy === column.id ? sortDirection : false}
													align={column.align}
													style={{
														width: column.width,
														display: (!small && !medium) ||
														(column.id === 'name' && (small || medium)) ||
														(column.id === 'sourcetopic' && (small || medium)) ||
														(column.id === 'action' && (small || medium)) ||
														(column.id === 'targettopic' && medium) ? undefined : 'none'
													}}
												>
													<span>
													{column.key}
														</span>
												</TableCell>
											))}
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
													{small || medium ? null :
														<TableCell>{stream.textdescription}</TableCell>
													}
													<TableCell>{stream.sourcetopic}</TableCell>
													{small ? null :
														<TableCell>{stream.targettopic}</TableCell>
													}
													{/*{small || medium ? null : [*/}
													{/*	<TableCell>{stream.targetqos}</TableCell>,*/}
													{/*	<TableCell>{stream.ttl}</TableCell>*/}
													{/*]}*/}
													{small || medium ? null : [
														<TableCell align="center">
															<Tooltip title="Process stream">
																<Switch
																	color="primary"
																	checked={
																		typeof stream.process === 'undefined' ||
																		stream.process === true
																	}
																	onClick={(event) => {
																		event.stopPropagation();
																		if (event.target.checked) {
																			onEnableProcessStream(
																				stream.streamname);
																		} else {
																			onDisableProcessStream(
																				stream.streamname);
																		}
																	}}
																/>
															</Tooltip>
														</TableCell>,
														<TableCell align="center">
															<Tooltip title="Persist stream">
																<Switch
																	color="primary"
																	checked={
																		typeof stream.persist === 'undefined' ||
																		stream.persist === true
																	}
																	onClick={(event) => {
																		event.stopPropagation();
																		if (event.target.checked) {
																			onEnablePersistStream(
																				stream.streamname);
																		} else {
																			onDisablePersistStream(
																				stream.streamname);
																		}
																	}}
																/>
															</Tooltip>
														</TableCell>,
														<TableCell align="center">
															<Tooltip title="Activate / Deactivate stream">
																<Switch
																	color="primary"
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
													]}
													<TableCell align="center">
														<div style={{display: 'flex'}}>
															<Tooltip title="Clear stream messages">
																<IconButton
																	disabled={!stream.persist}
																	size="small"
																	onClick={(event) => {
																		event.stopPropagation();
																		onClearStreamMessages(stream.streamname);
																	}}
																>
																	<ClearStreamIcon fontSize="small"/>
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
																	<ReplayIcon fontSize="small"/>
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
																	<DeleteIcon fontSize="small"/>
																</IconButton>
															</Tooltip>
														</div>
													</TableCell>
												</StyledTableRow>
											))}
									</TableBody>
								</Table>
							</TableContainer>
						</div>
					) : (
						<div>No streams found</div>
					)}
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		streams: state.streams?.streams,
		streamprocessingFeature: state.systemStatus?.features?.streamprocessing,
		connected: state.brokerConnections?.connected,
	};
};

export default connect(mapStateToProps)(Streams);
