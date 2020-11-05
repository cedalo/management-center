import { connect, useDispatch } from 'react-redux';
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Paper from '@material-ui/core/Paper';
import ClientIDIcon from '@material-ui/icons/Fingerprint';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import PasswordIcon from '@material-ui/icons/VpnKey';
import ClientIcon from '@material-ui/icons/Person';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import AccountCircle from '@material-ui/icons/AccountCircle';
import SaveIcon from '@material-ui/icons/Save';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Link as RouterLink } from 'react-router-dom';
import { WebSocketContext } from '../websockets/WebSocket';
import { updateRoles } from '../actions/actions';

const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
			margin: theme.spacing(1)
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
			width: '75ch'
		}
	},
	buttons: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},
	form: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	textField: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
	},
	margin: {
		margin: theme.spacing(2)
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const RoleNew = (props) => {
	const classes = useStyles();

	const [rolename, setRolename] = useState('');
	const [textname, setTextname] = useState('');
	const [textdescription, setTextdescription] = useState('');

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { client } = context;

	const validate = () => {
		const valid = rolename !== '';
		return valid;
	};

	const onSaveRole = async () => {
		await client.createRole(rolename, textname, textdescription);
		const roles = await client.listRoles();
		dispatch(updateRoles(roles));
		history.push(`/security/roles`);
	};

	const onCancel = async () => {
		await confirm({
			title: 'Cancel role creation',
			description: `Do you really want to cancel creating this role?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		history.goBack();
	};

	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security">
					Security
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Roles
				</Typography>
			</Breadcrumbs>
			<br />
			<div className={classes.root}>
				<Paper>
					<form className={classes.form} noValidate autoComplete="off">
						<div className={classes.margin}>
							<Grid container spacing={1} alignItems="flex-end">
								<Grid item xs={12}>
									<TextField
										required
										id="rolename"
										label="Role name"
										onChange={(event) => setRolename(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<AccountCircle />
												</InputAdornment>
											)
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										id="textname"
										label="Text name"
										onChange={(event) => setTextname(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										id="textdescription"
										label="Text description"
										onChange={(event) => setTextdescription(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid>
								<Grid container xs={12} alignItems="flex-start">
									<Grid item xs={12} className={classes.buttons}>
										<Button
											variant="contained"
											disabled={!validate()}
											color="primary"
											className={classes.button}
											startIcon={<SaveIcon />}
											onClick={(event) => {
												event.stopPropagation();
												onSaveRole();
											}}
										>
											Save
										</Button>
										<Button
											variant="contained"
											onClick={(event) => {
												event.stopPropagation();
												onCancel();
											}}
										>
											Cancel
										</Button>
									</Grid>
								</Grid>
							</Grid>
						</div>
					</form>
				</Paper>
			</div>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {};
};

export default connect(mapStateToProps)(RoleNew);
