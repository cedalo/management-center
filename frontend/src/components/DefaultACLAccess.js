import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { connect, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import SaveIcon from '@mui/icons-material/AddCircle';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { updateDefaultACLAccess } from '../actions/actions';

const PREFIX = 'DefaultACLAccess';

const classes = {
    root: `${PREFIX}-root`,
    buttons: `${PREFIX}-buttons`,
    margin: `${PREFIX}-margin`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
		width: '100%',
		backgroundColor: theme.palette.background.paper
	},

    [`& .${classes.buttons}`]: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},

    [`& .${classes.margin}`]: {
		margin: theme.spacing(1)
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

const ACL_TABLE_COLUMNS = [
	{ id: 'type', key: 'Type' },
	{ id: 'allow', key: 'Allow / Deny' }
];

const DefaultACLAccess = ({ defaultACLAccess }) => {

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
        <Root>
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
				<Hidden smDown implementation="css">
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
												<IconButton edge="end" aria-label="delete" size="large">
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
		</Root>
    );
};

const mapStateToProps = (state) => {
	return {
		defaultACLAccess: state.roles?.defaultACLAccess
	};
};

export default connect(mapStateToProps)(DefaultACLAccess);
