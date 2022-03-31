import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { amber, green, red } from '@mui/material/colors';
import { connect, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import Breadcrumbs from '@mui/material/Breadcrumbs';
import OpenSourcePluginIcon from '@mui/icons-material/Code';
import Paper from '@mui/material/Paper';
import PluginDisabledIcon from '@mui/icons-material/Cancel';
import PluginEnabledIcon from '@mui/icons-material/CheckCircle';
import PremiumPluginIcon from '@mui/icons-material/Stars';
import { Link as RouterLink } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import moment from 'moment';
import { useConfirm } from 'material-ui-confirm';
import useFetch from '../helpers/useFetch';

const PREFIX = 'Plugins';

const classes = {
    updateButton: `${PREFIX}-updateButton`,
    badges: `${PREFIX}-badges`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.updateButton}`]: {
		marginLeft: '20px'
	},

    [`& .${classes.badges}`]: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

const Plugins = (props) => {

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
            <Root>
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
			</Root>
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
