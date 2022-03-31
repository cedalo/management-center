import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { green, red } from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';

import AddIcon from '@mui/icons-material/Add';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ConfigurationIcon from '@mui/icons-material/Tune';
import ConnectedIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import DisconnectedIcon from '@mui/icons-material/Cancel';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import Fab from '@mui/material/Fab';
import Hidden from '@mui/material/Hidden';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import { Link as RouterLink } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { connect } from 'react-redux';
const PREFIX = 'Configurations';

const classes = {
    avatar: `${PREFIX}-avatar`,
    imageIcon: `${PREFIX}-imageIcon`,
    iconRoot: `${PREFIX}-iconRoot`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.avatar}`]: {
		backgroundColor: 'white'
	},

    [`& .${classes.imageIcon}`]: {
		height: '100%',
		width: '20px'
	},

    [`& .${classes.iconRoot}`]: {
		textAlign: 'center'
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

// import {
// 	colors,
//   } from '@mui/material';


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

const Configurations = ({ brokerConfigurations, onSort, sortBy, sortDirection }) => {

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
        <Root>
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
					<Hidden smDown implementation="css">
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
		</Root>
    );
};

const mapStateToProps = (state) => {
	return {
		brokerConfigurations: state.brokerConfigurations.brokerConfigurations
	};
};

export default connect(mapStateToProps)(Configurations);
