import React, { useContext } from 'react';
import { useSnackbar } from 'notistack';
import { connect, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import SaveIcon from '@material-ui/icons/AddCircle';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { updateDefaultACLAccess } from '../actions/actions';

const ACL_TABLE_COLUMNS = [
	{ id: 'type', key: 'Type' },
	{ id: 'allow', key: 'Allow / Deny' }
];

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%',
		backgroundColor: theme.palette.background.paper
	},
	buttons: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},
	margin: {
		margin: theme.spacing(1)
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const DefaultACLAccess = ({ defaultACLAccess }) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { client } = context;

	const handleChangeDefaultACLAccess = async (acl, allow) => {
		await client.setDefaultACLAccess([{
			acltype: acl.acltype,
			allow
		}]);
		const defaultACLAccess = await client.getDefaultACLAccess();
		dispatch(updateDefaultACLAccess(defaultACLAccess));
		enqueueSnackbar('Default ACL access successfully set', {
			variant: 'success'
		});
	}

	return (
		<div>
			<Breadcrumbs maxItems={2} aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security">
					Security
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security/roles">
					Roles
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Default ACL Access
				</Typography>
			</Breadcrumbs>
			<br />
			<Paper className={classes.paper}>
				<Hidden xsDown implementation="css">
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									{ACL_TABLE_COLUMNS.map((column) => (
										<TableCell
											key={column.id}
										>
											{column.key}
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{defaultACLAccess &&
									defaultACLAccess?.acls.map((acl) => (
										<TableRow
											hover
											// TODO: add key
											// key={role.rolename}
										>
											<TableCell>{acl.acltype}</TableCell>

											<TableCell>
												<Select
													value={acl.allow ? 'allow' : 'deny'}
													onChange={(event) => {
														handleChangeDefaultACLAccess(acl, event.target.value === 'allow');
													}}
												>
													<MenuItem value="allow">allow</MenuItem>
													<MenuItem value="deny">deny</MenuItem>
												</Select>
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
							{defaultACLAccess &&
								defaultACLAccess?.acls?.map((acl) => (
									<React.Fragment>
										<ListItem button>
											<ListItemText
												primary={acl.acltype}
												secondary={
													<React.Fragment>
														<Typography
															component="span"
															variant="body2"
															className={classes.inline}
															color="textPrimary"
														>
															Allow: <Checkbox checked={acl.allow} disabled />
														</Typography>
													</React.Fragment>
												}
											/>
											<ListItemSecondaryAction>
												<IconButton edge="end" aria-label="delete">
													<DeleteIcon />
												</IconButton>
											</ListItemSecondaryAction>
										</ListItem>
										<Divider variant="inset" component="li" />
									</React.Fragment>
								))}
						</List>
					</Paper>
				</Hidden>
			</Paper>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		defaultACLAccess: state.roles?.defaultACLAccess
	};
};

export default connect(mapStateToProps)(DefaultACLAccess);
