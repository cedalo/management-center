import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { updateTest } from '../actions/actions';
import { useSnackbar } from 'notistack';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
// import Fab from '@material-ui/core/Fab';
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
	{ id: 'testId', key: 'Test Id' },
	{ id: 'name', key: 'Name' },
	{ id: 'testCount', key: 'Number of tests' },
];

const TestCollections = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;

	const onSelectTest = async (requestId) => {
		const test = await brokerClient.gettest(requestId);
		dispatch(updatetest(test));
		history.push(`/tests/detail/${requestId}`);
	};

	const onDeleteTest = async (username) => {
	};

	const { dynamicsecurityFeature, connectionID, tests = [], onSort, sortBy, sortDirection } = props;

	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Tests
				</Typography>
			</Breadcrumbs>
			<br/>

			{tests && tests.length > 0 ? (
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
									{tests &&
										tests.map((test) => (
											<StyledTableRow
												hover
												key={test?.info?.id}
												onClick={(event) => onSelectTest(test?.info?.id)}
												style={{ cursor: 'pointer' }}
											>
												<TableCell>{test?.info?.id}</TableCell>
												<TableCell>{test?.info?.name}</TableCell>
												<TableCell>{test?.items?.length}</TableCell>
												<TableCell align="right">
													<Tooltip title="Delete test">
														<IconButton
															size="small"
															onClick={(event) => {
																event.stopPropagation();
																onDeleteTest(test?.info?.id);
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
								{tests.map((test) => (
									<React.Fragment>
										<ListItem
											alignItems="flex-start"
											onClick={(event) => onSelectTest(test?.info?.id)}
										>
											<ListItemText
												primary={<span>{test?.info?.id}</span>}
												secondary={
													<React.Fragment>
														<Typography
															component="span"
															variant="body2"
															className={classes.inline}
															color="textPrimary"
														>
															{test?.info?.name}
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
														onSelectTest(test?.info?.id);
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
														onDeleteTest(test?.info?.id);
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
				<div>No tests found</div>
			)}
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		tests: state.tests.tests
	};
};

export default connect(mapStateToProps)(TestCollections);
