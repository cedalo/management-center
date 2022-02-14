import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { updateSettings } from '../actions/actions';

import AddIcon from '@material-ui/icons/Add';
import Avatar from '@material-ui/core/Avatar';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Chip from '@material-ui/core/Chip';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import Fab from '@material-ui/core/Fab';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import GroupIcon from '@material-ui/icons/Group';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import { Link as RouterLink } from 'react-router-dom';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';
import UserIcon from '@material-ui/icons/Person';
import { WebSocketContext } from '../websockets/WebSocket';
import useLocalStorage from '../helpers/useLocalStorage';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const Settings = ({ settings, sendMessage }) => {
	const classes = useStyles();
	const theme = useTheme();
	const { enqueueSnackbar } = useSnackbar();
	const dispatch = useDispatch();
	const context = useContext(WebSocketContext);
	const { client: brokerClient } = context;
	const [darkMode, setDarkMode] = useLocalStorage('cedalo.managementcenter.darkMode');

	const onChangeTheme = () => {
		setDarkMode(darkMode === 'true' ? 'false' : 'true');
	};

	const onChangeAllowTrackingUsageData = async (allowTrackingUsageData) => {
		try {
			const updatedSettings = await brokerClient.updateSettings({
				allowTrackingUsageData
			});
			dispatch(updateSettings(updatedSettings));
		} catch (error) {
			enqueueSnackbar(`Error disconnecting broker. Reason: ${error.message ? error.message : error}`, {
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
			<br />
			{/* <FormGroup row>
				<FormControlLabel
					control={
						<Switch
							checked={darkMode === 'true'}
							disabled
							onChange={onChangeTheme}
							name="darkMode"
							color="primary"
						/>
					}
					label="Dark Mode"
				/>
			</FormGroup> */}
			<FormGroup row>
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
