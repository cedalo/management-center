import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import MessagePage from './MessagePage';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { makeStyles, withStyles } from '@material-ui/core/styles';

import { updateStreams } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@material-ui/icons/Add';
import AutoSuggest from './AutoSuggest';
import Chip from '@material-ui/core/Chip';
import ClientIcon from '@material-ui/icons/Person';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import Fab from '@material-ui/core/Fab';
import GroupIcon from '@material-ui/icons/Group';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
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

const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.tables?.odd
		}
	}
}))(TableRow);

const useStyles = makeStyles((theme) => ({
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink,
	fab: {
		position: 'absolute',
		bottom: theme.spacing(2),
		right: theme.spacing(2)
	},
}));

const STREAM_TABLE_COLUMNS = [
	{ id: 'streamname', key: 'Stream name' },
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
	const { connectionID, streams = [], onSort, sortBy, sortDirection } = props;

	const onNewStream = () => {
		history.push('/streams/new');
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
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Streams
				</Typography>
			</Breadcrumbs>
			<br />
			{streams && streams.length > 0 ? (
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
												style={{ cursor: 'pointer' }}
											>
												<TableCell>{stream.streamname}</TableCell>
												<TableCell>{stream.sourcetopic}</TableCell>
												<TableCell>{stream.targettopic}</TableCell>
												<TableCell>{stream.targetqos}</TableCell>
												<TableCell>{stream.ttl}</TableCell>
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
													<Tooltip title="Activat / Deactivate stream">
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
			<Fab
				color="primary"
				aria-label="add"
				className={classes.fab}
				onClick={(event) => {
					event.stopPropagation();
					onNewStream();
				}}
			>
				<AddIcon />
			</Fab>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		streams: state.streams?.streams
	};
};

export default connect(mapStateToProps)(Streams);
