import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { updateSettings } from '../actions/actions';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import { Link as RouterLink } from 'react-router-dom';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import useLocalStorage from '../helpers/useLocalStorage';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const Settings = ({ settings, onChangeTheme, sendMessage }) => {
	const classes = useStyles();
	const { enqueueSnackbar } = useSnackbar();
	const dispatch = useDispatch();
	const context = useContext(WebSocketContext);
	const { client: brokerClient } = context;
	const [darkMode] = useLocalStorage('cedalo.managementcenter.darkMode');

	const onChangeAllowTrackingUsageData = async (allowTrackingUsageData) => {
		try {
			const updatedSettings = await brokerClient.updateSettings({
				allowTrackingUsageData
			});
			dispatch(updateSettings(updatedSettings));
		} catch (error) {
			enqueueSnackbar(`Error upating settings. Reason: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
		}
	};

	const onChangeEnableTopicTree = async (topicTreeEnabled) => {
		try {
			const updatedSettings = await brokerClient.updateSettings({
				topicTreeEnabled
			});
			dispatch(updateSettings(updatedSettings));
		} catch (error) {
			enqueueSnackbar(`Error enableTopicTree. Reason: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
		}
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
					Settings
				</Typography>
			</Breadcrumbs>
			<FormGroup>
				<FormControlLabel
					control={
						<Switch
							checked={darkMode === 'true'}
							onChange={(event) => onChangeTheme(event.target.checked)}
							name="darkMode"
							color="primary"
						/>
					}
					label="Dark Mode"
				/>
				<FormControlLabel
					control={
						<Switch
							checked={settings?.allowTrackingUsageData === true}
							onClick={(event) => {
								event.stopPropagation();
								if (event.target.checked) {
									onChangeAllowTrackingUsageData(true);
								} else {
									onChangeAllowTrackingUsageData(false);
								}
							}}
							name="allowTrackingUsageData"
							color="primary"
						/>
					}
					label="Allow tracking of usage data"
				/>
				<FormControlLabel
					control={
						<Switch
							checked={settings?.topicTreeEnabled === true}
							onClick={(event) => {
								event.stopPropagation();
								if (event.target.checked) {
									onChangeEnableTopicTree(true);
								} else {
									onChangeEnableTopicTree(false);
								}
							}}
							name="topicTreeEnabled"
							color="primary"
						/>
					}
					label="Topic Tree"
				/>
			</FormGroup>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		settings: state.settings?.settings
	};
};

export default connect(mapStateToProps)(Settings);
