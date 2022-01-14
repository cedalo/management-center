import React, { useContext } from 'react';
import { amber, green, red } from '@material-ui/core/colors';
import { connect, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import OpenSourcePluginIcon from '@material-ui/icons/Code';
import Paper from '@material-ui/core/Paper';
import PluginDisabledIcon from '@material-ui/icons/Cancel';
import PluginEnabledIcon from '@material-ui/icons/CheckCircle';
import PremiumPluginIcon from '@material-ui/icons/Stars';
import { Link as RouterLink } from 'react-router-dom';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { useConfirm } from 'material-ui-confirm';
import useFetch from '../helpers/useFetch';

const useStyles = makeStyles((theme) => ({
	updateButton: {
		marginLeft: '20px'
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const Plugins = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client } = context;
	const [response, loading, hasError] = useFetch(`${process.env.PUBLIC_URL}/api/plugins`);

	const handlePluginLoad = async (pluginId, load) => {
		if (load) {
			await confirm({
				title: 'Confirm enabling of plugin',
				description: `Do you really want to enable the plugin "${pluginId}"?`,
				cancellationButtonProps: {
					variant: 'contained'
				},
				confirmationButtonProps: {
					color: 'primary',
					variant: 'contained'
				}
			});
			try {
				await client.loadPlugin(pluginId);
				window.location.reload();
			} catch(error) {
				enqueueSnackbar(`Error enabling plugin. Reason: ${error.message || error}.`, {
					variant: 'error'
				});
			}
		} else {
			await confirm({
				title: 'Confirm disabling of plugin',
				description: `Do you really want to disable the plugin "${pluginId}"?`,
				cancellationButtonProps: {
					variant: 'contained'
				},
				confirmationButtonProps: {
					color: 'primary',
					variant: 'contained'
				}
			});
			try {
				await client.unloadPlugin(pluginId);
				window.location.reload();
			} catch(error) {
				enqueueSnackbar(`Error disabling plugin. Reason: ${error.message || error}.`, {
					variant: 'error'
				});
			}
		}
	};
	if (response) {
		return (
			<div>
				<Breadcrumbs aria-label="breadcrumb">
					<RouterLink className={classes.breadcrumbLink} to="/home">
						Home
					</RouterLink>
					<Typography className={classes.breadcrumbItem} color="textPrimary">
						Plugins
					</Typography>
				</Breadcrumbs>
				<br />
				<TableContainer component={Paper} className={classes.tableContainer}>
					<Table size="medium">
						<TableHead>
							<TableRow>
								<TableCell>Type</TableCell>
								<TableCell>ID</TableCell>
								<TableCell>Version</TableCell>
								<TableCell>Name</TableCell>
								<TableCell>Description</TableCell>
								<TableCell>Feature</TableCell>
								<TableCell>Status</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{response.map((plugin) => (
								<TableRow>
									<TableCell>
										{plugin.type === 'premium' ? (
											<PremiumPluginIcon style={{ color: amber[500] }} fontSize="small" />
										) : (
											<OpenSourcePluginIcon fontSize="small" />
										)}
									</TableCell>
									<TableCell>{plugin.id}</TableCell>
									<TableCell>{plugin.version}</TableCell>
									<TableCell>{plugin.name}</TableCell>
									<TableCell>{plugin.description}</TableCell>
									<TableCell>{plugin.feature}</TableCell>
									<TableCell>
										{plugin.status.type === 'loaded' ? (
											<PluginEnabledIcon fontSize="small" style={{ color: green[500] }} />
										) : (
											<Tooltip title={plugin.status.message ? plugin.status.message : null}>
												<PluginDisabledIcon fontSize="small" style={{ color: red[500] }} />
											</Tooltip>
										)}
									</TableCell>
									<TableCell>
										<Tooltip title={plugin.status.type === 'loaded' ? 'Disable' : 'Enable'}>
											<Switch
												disabled={plugin.status.type === 'error' || !plugin.actions.enable}
												checked={plugin.status.type === 'loaded'}
												name="pluginEnabled"
												onChange={(event) => {
													handlePluginLoad(plugin.id, event.target.checked);
												}}
												inputProps={{ 'aria-label': 'Plugin enabled' }}
											/>
										</Tooltip>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
		);
	} else {
		return null;
	}
};

const mapStateToProps = (state) => {
	return {
		license: state.license?.license,
		version: state.version?.version
	};
};

export default connect(mapStateToProps)(Plugins);
