import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import { updateCluster, updateClusters } from '../actions/actions';
import { useSnackbar } from 'notistack';

import { Alert, AlertTitle } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ClusterIcon from '@mui/icons-material/Storage';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import ClientIDIcon from '@mui/icons-material/Fingerprint';
import ClientIcon from '@mui/icons-material/Person';
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
import { WebSocketContext } from '../../../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import AutoSuggest from '../../../components/AutoSuggest';
import SaveCancelButtons from '../../../components/SaveCancelButtons';

const PREFIX = 'ClusterNew';

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

const ClusterNew = (props) => {
	const { clusters, clusterManagementFeature } = props;


	const [clustername, setClustername] = useState('');
	const [clusterDescription, setClusterDescription] = useState('');
	const [backendUsername, setBackendUsername] = useState('');
	const [backendPassword, setBackendPassword] = useState('');
	const [hostname, setBackendHostname] = useState('');
	const [port, setBackendPort] = useState(0);

	const clusternameExists = props?.clusters?.find((searchCluster) => {
		return searchCluster.clustername === clustername;
	});

	const validate = () => {
		const valid = !clusternameExists && clustername !== '';
		return valid;
	};

	const { enqueueSnackbar } = useSnackbar();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { client } = context;

	const onSaveCluster = async () => {
		try {
			await client.createCluster({
				clustername, 
				description: clusterDescription,
			});
			const clusters = await client.listClusters();
			dispatch(updateClusters(clusters));
			history.push(`/admin/clusters`);
			enqueueSnackbar(`Cluster "${clustername}" successfully created.`, {
				variant: 'success'
			});
		} catch (error) {
			enqueueSnackbar(`Error creating cluster "${clustername}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error;
		}
	};

	const onCancel = async () => {
		await confirm({
			title: 'Cancel cluster creation',
			description: `Do you really want to cancel creating this cluster?`,
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
					Admin
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Clusters
				</Typography>
			</Breadcrumbs>
			<br />
			{/* TODO: Quick hack to detect whether feature is supported */}
			{clusterManagementFeature?.error ? <><br /><Alert severity="warning">
				<AlertTitle>{clusterManagementFeature.error.title}</AlertTitle>
				{clusterManagementFeature.error.message}
			</Alert></> : null}
			{!clusterManagementFeature?.error && <div className={classes.root}>
				<Paper>
					<form className={classes.form} noValidate autoComplete="off">
						<div className={classes.margin}>
							<Grid container spacing={1} alignItems="flex-end">
								<Grid item xs={12}>
									<TextField
										error={clusternameExists}
										helperText={clusternameExists && 'A cluster with this clustername already exists.'}
										required
										id="clustername"
										label="Cluster name"
										onChange={(event) => setClustername(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<ClusterIcon />
												</InputAdornment>
											)
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										required={false}
										id="description"
										label="Cluster description"
										onChange={(event) => setClusterDescription(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid>
								{/* <Grid item xs={12}>
									<TextField
										required={false}
										id="backend-username"
										label="Backend username"
										onChange={(event) => setBackendUsername(event.target.value)}
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
										required={false}
										type="password"
										id="backend-password"
										label="Backend password"
										onChange={(event) => setBackendPassword(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<PasswordIcon />
												</InputAdornment>
											)
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										required={false}
										type="url"
										id="backend-hosts-hostname"
										label="Backend Hostname"
										onChange={(event) => setBackendHostname(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										required={false}
										type="number"
										id="backend-hosts-port"
										label="Backend Port"
										onChange={(event) => setBackendPort(parseInt(event.target.value))}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid> */}
								<Grid container xs={12} alignItems="flex-start">
									<Grid item xs={12} className={classes.buttons}>
										<SaveCancelButtons
											onSave={onSaveCluster}
											saveDisabled={!validate()}
											onCancel={onCancel}
										/>
									</Grid>
								</Grid>
							</Grid>
						</div>
					</form>
				</Paper>
			</div>}
		</Root>
    );
};

const mapStateToProps = (state) => {
	return {
		clusters: state.clusters?.clusters,
		clusterManagementFeature: state.systemStatus?.features?.clustermanagement,
	};
};

export default connect(mapStateToProps)(ClusterNew);
