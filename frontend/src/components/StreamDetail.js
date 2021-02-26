import React, { useContext, useState } from 'react';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateStream, updateStreams } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AccountCircle from '@material-ui/icons/AccountCircle';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import ClientIDIcon from '@material-ui/icons/Fingerprint';
import ClientIcon from '@material-ui/icons/Person';
import CredentialsIcon from '@material-ui/icons/Lock';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import GroupIcon from '@material-ui/icons/Group';
import GroupsIcon from '@material-ui/icons/Group';
import HidePasswordIcon from '@material-ui/icons/VisibilityOff';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PasswordIcon from '@material-ui/icons/VpnKey';
import PropTypes from 'prop-types';
import SaveIcon from '@material-ui/icons/Save';
import ShowPasswordIcon from '@material-ui/icons/Visibility';
import Switch from '@material-ui/core/Switch';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import qs from 'qs';
import { useConfirm } from 'material-ui-confirm';

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`scrollable-prevent-tabpanel-${index}`}
			aria-labelledby={`scrollable-prevent-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box pt={3}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired
};

function a11yProps(index) {
	return {
		id: `scrollable-prevent-tab-${index}`,
		'aria-controls': `scrollable-prevent-tabpanel-${index}`
	};
}

const streamShape = PropTypes.shape({
	streamname: PropTypes.string,
});

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%'
	},
	paper: {
		padding: '15px'
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

const StreamDetail = (props) => {
	const classes = useStyles();
	const [value, setValue] = React.useState(0);
	const [showPassword, setShowPassword] = React.useState(false);
	const [editMode, setEditMode] = React.useState(false);
	const { enqueueSnackbar } = useSnackbar();

	const { stream = {}, defaultStream } = props;
	const [updatedStream, setUpdatedStream] = React.useState({
		...stream
	});

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const { client: brokerClient } = context;

	const validate = () => {
		if (editMode) {
			return updatedStream.streamname !== '';
		} else {
			return updatedStream.streamname !== '';
		}
	};

	const onDisableStream = async (streamname) => {
		await confirm({
			title: 'Confirm stream disable',
			description: `Do you really want to disable stream "${streamname}"?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		await brokerClient.disableStream(streamname);
		const stream = await brokerClient.getStream(streamname);
		dispatch(updateStream(stream));
		const streams = await brokerClient.listStreams();
		enqueueSnackbar('Stream successfully disabled', {
			variant: 'success'
		});
		dispatch(updateStreams(streams));
	};

	const onEnableStream = async (streamname) => {
		await brokerClient.enableStream(streamname);
		const stream = await brokerClient.getStream(streamname);
		dispatch(updateStream(stream));
		const streams = await brokerClient.listStreams();
		enqueueSnackbar('Stream successfully enabled', {
			variant: 'success'
		});
		dispatch(updateStreams(streams));
	};

	const onUpdateStream = async () => {
		await brokerClient.modifyStream(updatedStream);
		enqueueSnackbar('Stream successfully updated', {
			variant: 'success'
		});
		const streamObject = await brokerClient.getStream(updatedStream.streamname);
		dispatch(updateStream(streamObject));
		const streams = await brokerClient.listStreams();
		dispatch(updateStreams(streams));
		setEditMode(false);
	};

	const onCancelEdit = async () => {
		await confirm({
			title: 'Cancel stream editing',
			description: `Do you really want to cancel editing this stream?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		setUpdatedStream({
			...stream
		});
		setEditMode(false);
	};
	const {
		match: {
			params: { streamName }
		}
	} = props;
	// TODO: get stream by streamname if current stream is not defined

	return stream.streamname ? (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/streams">
					Streams
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					{stream.streamname}
				</Typography>
			</Breadcrumbs>
			<br />
			<Paper className={classes.paper}>
				<form className={classes.form} noValidate autoComplete="off">
					<div className={classes.margin}>
						<Grid container spacing={1} alignItems="flex-end">
							<Grid item xs={12}>
								<TextField
									required={editMode}
									disabled={true}
									onChange={(event) => {
										if (editMode) {
											setUpdatedStream({
												...updatedStream,
												streamname: event.target.value
											});
										}
									}}
									id="streamname"
									label="streamname"
									value={updatedStream.streamname}
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
									disabled={!editMode}
									id="source-topic"
									label="Source topic"
									value={updatedStream.sourcetopic}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
									onChange={(event) => {
										if (editMode) {
											setUpdatedStream({
												...updatedStream,
												sourcetopic: event.target.value
											});
										}
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									disabled={!editMode}
									id="target-topic"
									label="Target topic"
									value={updatedStream.targettopic}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
									onChange={(event) => {
										if (editMode) {
											setUpdatedStream({
												...updatedStream,
												targettopic: event.target.value
											});
										}
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									disabled={!editMode}
									id="target-qos"
									label="Target QoS"
									value={updatedStream.targetqos}
									defaultValue=""
									variant="outlined"
									fullWidth
									type="number"
									className={classes.textField}
									onChange={(event) => {
										if (editMode) {
											setUpdatedStream({
												...updatedStream,
												targetqos: event.target.value
											});
										}
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<FormControlLabel
									control={
										<Switch
											checked={
												typeof stream.process === 'undefined' ||
												stream.process === true
											}
											onClick={(event) => {
												event.stopPropagation();
												if (event.target.checked) {
													onEnableProcessStream(stream.streamname);
												} else {
													onDisableProcessStream(stream.streamname);
												}
											}}
										/>
									}
									label="Process"
								/>
								<FormControlLabel
									control={
										<Switch
											checked={
												typeof stream.persist === 'undefined' ||
												stream.persist === true
											}
											onClick={(event) => {
												event.stopPropagation();
												if (event.target.checked) {
													onEnablePersistStream(stream.streamname);
												} else {
													onDisablePersistStream(stream.streamname);
												}
											}}
										/>
									}
									label="Persist"
								/>
								<FormControlLabel
									control={
										<Switch
											checked={
												typeof stream.active === 'undefined' ||
												stream.active === true
											}
											onClick={(event) => {
												event.stopPropagation();
												if (event.target.checked) {
													onEnableStream(stream.streamname);
												} else {
													onDisableStream(stream.streamname);
												}
											}}
										/>
									}
									label="Active"
								/>
							</Grid>
						</Grid>
					</div>
				</form>
				{/* </TabPanel> */}
				{/* <TabPanel value={value} index={1}>
	  <List className={classes.root}>
          {stream.groups?.map((group) => (
            <React.Fragment>
              <ListItem button>
                <ListItemText
                  primary={group.groupname}
                  secondary={group.textdescription}
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
      </TabPanel> */}
				{!editMode && (
					<Grid item xs={12} className={classes.buttons}>
						<Button
							variant="contained"
							color="primary"
							className={classes.button}
							startIcon={<EditIcon />}
							onClick={() => setEditMode(true)}
						>
							Edit
						</Button>
					</Grid>
				)}
				{editMode && (
					<Grid item xs={12} className={classes.buttons}>
						<Button
							variant="contained"
							disabled={!validate()}
							color="primary"
							className={classes.button}
							startIcon={<SaveIcon />}
							onClick={(event) => {
								event.stopPropagation();
								onUpdateClient();
							}}
						>
							Save
						</Button>
						<Button
							variant="contained"
							onClick={(event) => {
								event.stopPropagation();
								onCancelEdit();
							}}
						>
							Cancel
						</Button>
					</Grid>
				)}
			</Paper>
		</div>
	) : (
		<Redirect to="/streams" push />
	);
};

StreamDetail.propTypes = {
	stream: streamShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		stream: state.streams?.stream
	};
};

export default connect(mapStateToProps)(StreamDetail);
