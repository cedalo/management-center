import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { updateTest, updateTestCollection } from '../actions/actions';
import { useSnackbar } from 'notistack';

import ConnectedIcon from '@material-ui/icons/CheckCircle';
import DisconnectedIcon from '@material-ui/icons/Warning';
import AddIcon from '@material-ui/icons/Add';
import { Alert, AlertTitle } from '@material-ui/lab';
import AutoSuggest from './AutoSuggest';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import ClientIcon from '@material-ui/icons/Person';
import DeleteIcon from '@material-ui/icons/Delete';
import RunTestIcon from '@material-ui/icons/PlayArrow';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
// import Fab from '@material-ui/core/Fab';
import GroupIcon from '@material-ui/icons/Group';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import { getBrokerById } from '../helpers/utils';
import BrokerStatusIcon from './BrokerStatusIcon';

const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.tables?.odd
		}
	}
}))(TableRow);

const useStyles = makeStyles((theme) => ({
	tableContainer: {
		minHeight: '500px',
		'& td:nth-child(2)': {
			minWidth: '100px'
		}
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
	// fab: {
	// 	position: 'absolute',
	// 	bottom: theme.spacing(2),
	// 	right: theme.spacing(2)
	// },
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const TABLE_COLUMNS = [
	{ id: 'status', key: 'Status' },
	{ id: 'testName', key: 'Test name' },
	{ id: 'requestTopic', key: 'Request Topic' },
	{ id: 'target', key: 'Target' },
	{ id: 'protocol', key: 'Protocol' },
	{ id: 'payloadFormat', key: 'Payload format' },
];


const TestCollectionDetail = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;

	const { testCollection, brokerConnections, onSort, sortBy, sortDirection } = props;

	console.log(brokerConnections);
	const onSelectTest = async (id) => {
		const test = await brokerClient.getTest(testCollection?.info?.id, id);
		dispatch(updateTest(test));
		history.push(`/testcollections/tests/detail/${id}`);
	};

	const onDeleteTest = async (id) => {
	};

	const onRunTest = async (id) => {
		try {
			const response = await brokerClient.runTest(testCollection?.info?.id, id);
			console.log(response);
			enqueueSnackbar(`Test successfully executed.`, {
				variant: 'success'
			});
		} catch(error) {
			enqueueSnackbar(`Error executing test. Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error;
		}
	};

	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/testcollections">
					Test Collections
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					{testCollection?.info?.name}
				</Typography>
			</Breadcrumbs>
			<br/>

			{testCollection && testCollection.items?.length > 0 ? (
				<div>
					<Hidden xsDown implementation="css">
						<TableContainer component={Paper} className={classes.tableContainer}>
							<Table size="medium">
								<TableHead>
									<TableRow>
										{TABLE_COLUMNS.map((column) => (
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
									{testCollection &&
										testCollection.items.map((item) => (
											<StyledTableRow
												hover
												key={item?.name}
												onClick={(event) => onSelectTest(item?.id)}
												style={{ cursor: 'pointer' }}
											>
												<TableCell><BrokerStatusIcon brokerConnection={getBrokerById(brokerConnections, item?.target?.brokerId)} /></TableCell>
												<TableCell>{item?.name}</TableCell>
												<TableCell>{item?.requestTopic}</TableCell>
												<TableCell>{item?.target?.brokerId}</TableCell>
												<TableCell>{item?.target?.protocol}</TableCell>
												<TableCell>{item?.request?.body?.mode}</TableCell>
												<TableCell align="right">
													<Tooltip title="Run test">
														<IconButton
															size="small"
															onClick={(event) => {
																event.stopPropagation();
																onRunTest(item?.id);
															}}
														>
															<RunTestIcon fontSize="small" />
														</IconButton>
													</Tooltip>
													{/* <Tooltip title="Delete test">
														<IconButton
															size="small"
															onClick={(event) => {
																event.stopPropagation();
																onDeleteTest(item?.id);
															}}
														>
															<DeleteIcon fontSize="small" />
														</IconButton>
													</Tooltip> */}
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
								{testCollection?.items.map((item) => (
									<React.Fragment>
										<ListItem
											alignItems="flex-start"
											onClick={(event) => onSelectTest(item?.id)}
										>
											<ListItemText
												primary={<span>{item?.id}</span>}
												secondary={
													<React.Fragment>
														<Typography
															component="span"
															variant="body2"
															className={classes.inline}
															color="textPrimary"
														>
															{item?.name}
														</Typography>
														<span></span>
													</React.Fragment>
												}
											/>
											<ListItemSecondaryAction>
												<IconButton
													edge="end"
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														onSelectTest(item?.id);
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
														onDeleteTest(item?.id);
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
				<div>No items found</div>
			)}
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		brokerConnections: state.brokerConnections?.brokerConnections,
		testCollection: state.tests.testCollection
	};
};

export default connect(mapStateToProps)(TestCollectionDetail);
