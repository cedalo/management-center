import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import AccountCircle from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import ClientIDIcon from '@mui/icons-material/Fingerprint';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import PasswordIcon from '@mui/icons-material/VpnKey';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { updateGroups } from '../actions/actions';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import SaveCancelButtons from './SaveCancelButtons';

const PREFIX = 'GroupNew';

const classes = {
    root: `${PREFIX}-root`,
    buttons: `${PREFIX}-buttons`,
    form: `${PREFIX}-form`,
    textField: `${PREFIX}-textField`,
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
		'& > *': {
			margin: theme.spacing(1)
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
			width: '75ch'
		}
	},

    [`& .${classes.buttons}`]: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},

    [`& .${classes.form}`]: {
		display: 'flex',
		flexWrap: 'wrap'
	},

    [`& .${classes.textField}`]: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
	},

    [`& .${classes.margin}`]: {
		margin: theme.spacing(2)
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

const GroupNew = (props) => {


	const [groupname, setGroupname] = useState('');
	const [textname, setTextname] = useState('');
	const [textdescription, setTextdescription] = useState('');

	const { enqueueSnackbar } = useSnackbar();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { client } = context;

	const groupnameExists = props?.groups?.find((searchGroup) => {
		return searchGroup.groupname === groupname;
	});

	const validate = () => {
		const valid = groupname !== '';
		return valid;
	};

	const onSaveGroup = async () => {
		try {
			await client.createGroup(groupname, '', textname, textdescription);
			const groups = await client.listGroups();
			dispatch(updateGroups(groups));
			history.push(`/security/groups`);
			enqueueSnackbar(`Group "${groupname}" successfully created.`, {
				variant: 'success'
			});
		} catch(error) {
			enqueueSnackbar(`Error creating group "${groupname}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error;
		}
	};

	const onCancel = async () => {
		await confirm({
			title: 'Cancel group creation',
			description: `Do you really want to cancel creating this group?`,
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
        <Root>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security">
					Security
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Groups
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
										error={groupnameExists}
										helperText={groupnameExists && 'A group with this name already exists.'}
										required
										id="groupname"
										label="Groupname"
										onChange={(event) => setGroupname(event.target.value)}
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
										<SaveCancelButtons
											onSave={onSaveGroup}
											saveDisabled={!validate()}
											onCancel={onCancel}
										/>
									</Grid>
								</Grid>
							</Grid>
						</div>
					</form>
				</Paper>
			</div>
		</Root>
    );
};

const mapStateToProps = (state) => {
	return {
		groups: state.groups?.groups
	};
};

export default connect(mapStateToProps)(GroupNew);
