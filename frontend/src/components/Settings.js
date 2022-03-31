import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { updateSettings } from '../actions/actions';

import AddIcon from '@mui/icons-material/Add';
import Avatar from '@mui/material/Avatar';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import Fab from '@mui/material/Fab';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import GroupIcon from '@mui/icons-material/Group';
import Hidden from '@mui/material/Hidden';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import { Link as RouterLink } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import UserIcon from '@mui/icons-material/Person';
import { WebSocketContext } from '../websockets/WebSocket';
import useLocalStorage from '../helpers/useLocalStorage';
import { useSnackbar } from 'notistack';

const PREFIX = 'Settings';

const classes = {
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

const Settings = ({ settings, sendMessage }) => {

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
        <Root>
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
		</Root>
    );
};

const mapStateToProps = (state) => {
	return {
		settings: state.settings?.settings
	};
};

export default connect(mapStateToProps)(Settings);
