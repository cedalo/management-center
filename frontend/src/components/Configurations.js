import React, { useContext } from 'react';
import { green, red } from '@material-ui/core/colors';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import AddIcon from '@material-ui/icons/Add';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import ConfigurationIcon from '@material-ui/icons/Tune';
import ConnectedIcon from '@material-ui/icons/CheckCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import DisconnectedIcon from '@material-ui/icons/Cancel';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import Fab from '@material-ui/core/Fab';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import { Link as RouterLink } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { connect } from 'react-redux';
// import {
// 	colors,
//   } from '@material-ui/core';


const GROUP_TABLE_COLUMNS = [
	{ id: 'id', key: 'ID' },
	{ id: 'configurationName', key: 'Name' },
	{ id: 'URL', key: 'URL' },
	{ id: 'status', key: 'Status' }
];

const createStatusIcon = (status) =>
	status && status.connected ? (
		<ConnectedIcon fontSize="small" style={{ color: green[500] }} />
	) : (
		<DisconnectedIcon fontSize="small" style={{ color: red[500] }} />
	);

const useStyles = makeStyles((theme) => ({
	avatar: {
		backgroundColor: 'white'
	},
	imageIcon: {
		height: '100%',
		width: '20px'
	},
	iconRoot: {
		textAlign: 'center'
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const Configurations = ({ brokerConfigurations, onSort, sortBy, sortDirection }) => {
	const classes = useStyles();
	const theme = useTheme();
	const context = useContext(WebSocketContext);
	const [connection, setConnection] = React.useState('');
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [openedPopoverId, setOpenedPopoverId] = React.useState(null);

	const handlePopoverOpen = (target, id) => {
		setOpenedPopoverId(id);
		setAnchorEl(target);
	};

	const handleClose = () => {
		setOpenedPopoverId(null);
		setAnchorEl(null);
	};

	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/config">
					Config
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Configurations
				</Typography>
			</Breadcrumbs>
			<br />
			{brokerConfigurations && brokerConfigurations.connections && brokerConfigurations.connections.length > 0 ? (
				<div>
					<Hidden xsDown implementation="css">
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										{GROUP_TABLE_COLUMNS.map((column) => (
											<TableCell
												key={column.id}
												sortDirection={sortBy === column.id ? sortDirection : false}
											>
												<TableSortLabel
													active={sortBy === column.id}
													direction={sortDirection}
													onClick={() => onSort(column.id)}
												>
													{column.key}
												</TableSortLabel>
											</TableCell>
										))}
										<TableCell />
									</TableRow>
								</TableHead>
								<TableBody>
									{brokerConfigurations &&
										brokerConfigurations.connections.map((brokerConfiguration) => (
											<TableRow
												hover
												key={brokerConfiguration.name}
												//   onClick={() => onSelectConfiguration(brokerConfiguration.name)}
												//   style={{ cursor: "pointer" }}
											>
												<TableCell>{brokerConfiguration.id}</TableCell>
												<TableCell>{brokerConfiguration.name}</TableCell>
												<TableCell>{brokerConfiguration.url}</TableCell>
												<TableCell>
													<Popover
														id={brokerConfiguration.id}
														open={openedPopoverId === brokerConfiguration.id}
														anchorEl={anchorEl}
														onClose={handleClose}
														anchorOrigin={{
															vertical: 'bottom',
															horizontal: 'center'
														}}
														transformOrigin={{
															vertical: 'top',
															horizontal: 'center'
														}}
													>
														<Typography className={classes.typography}>
															{brokerConfiguration.status.connected ? (
																<Paper>Broker successfully connected</Paper>
															) : (
																<TableContainer component={Paper}>
																	<Table>
																		<TableBody>
																			<TableRow>
																				<TableCell>
																					<strong>Error number</strong>
																				</TableCell>
																				<TableCell>
																					{
																						brokerConfiguration.status
																							?.error?.errno
																					}
																				</TableCell>
																			</TableRow>
																			<TableRow>
																				<TableCell>
																					<strong>Error code</strong>
																				</TableCell>
																				<TableCell>
																					{
																						brokerConfiguration.status
																							?.error?.code
																					}
																				</TableCell>
																			</TableRow>
																			<TableRow>
																				<TableCell>
																					<strong>System call</strong>
																				</TableCell>
																				<TableCell>
																					{
																						brokerConfiguration.status
																							?.error?.syscall
																					}
																				</TableCell>
																			</TableRow>
																			<TableRow>
																				<TableCell>
																					<strong>Address</strong>
																				</TableCell>
																				<TableCell>
																					{
																						brokerConfiguration.status
																							?.error?.address
																					}
																				</TableCell>
																			</TableRow>
																			<TableRow>
																				<TableCell>
																					<strong>Port</strong>
																				</TableCell>
																				<TableCell>
																					{
																						brokerConfiguration.status
																							?.error?.port
																					}
																				</TableCell>
																			</TableRow>
																		</TableBody>
																	</Table>
																</TableContainer>
															)}
														</Typography>
													</Popover>
													<IconButton
														size="small"
														onClick={(event) => {
															event.stopPropagation();
															handlePopoverOpen(event.target, brokerConfiguration.id);
														}}
													>
														{createStatusIcon(brokerConfiguration.status)}
													</IconButton>
													{}
												</TableCell>
												<TableCell align="right">
													{/* <IconButton
						  size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteConfiguration(brokerConfiguration.name);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
						  size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteConfiguration(brokerConfiguration.name);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton> */}
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</TableContainer>
					</Hidden>
					<Hidden smUp implementation="css">
						<Paper>
							<List className={classes.root}>
								{brokerConfigurations && Array.isArray(brokerConfigurations.connections)
									? brokerConfigurations.connections.map((brokerConfiguration) => (
											<React.Fragment>
												<ListItem alignItems="flex-start">
													<ListItemText
														primary={<span>{brokerConfiguration.name}</span>}
														secondary={
															<React.Fragment>
																<Typography
																	component="span"
																	variant="body2"
																	className={classes.inline}
																	color="textPrimary"
																>
																	{brokerConfiguration.url}
																</Typography>
															</React.Fragment>
														}
													/>
													{/* <ListItemSecondaryAction>
					  <IconButton edge="end" aria-label="edit">
						<EditIcon />
					  </IconButton>
					  <IconButton edge="end" aria-label="delete">
						<DeleteIcon />
					  </IconButton>
					</ListItemSecondaryAction> */}
												</ListItem>
												<Divider />
											</React.Fragment>
									  ))
									: null}
							</List>
						</Paper>
					</Hidden>
				</div>
			) : (
				<div>No configurations found</div>
			)}
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		brokerConfigurations: state.brokerConfigurations.brokerConfigurations
	};
};

export default connect(mapStateToProps)(Configurations);
