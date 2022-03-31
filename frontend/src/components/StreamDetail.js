import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateStream, updateStreams } from '../actions/actions';
import { useSnackbar } from 'notistack';
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import './jsoneditor-fix.css';
import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/github'
import 'brace/theme/monokai'
import Ajv from 'ajv';
import useLocalStorage from '../helpers/useLocalStorage';

import AccountCircle from '@mui/icons-material/AccountCircle';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import ClientIDIcon from '@mui/icons-material/Fingerprint';
import ClientIcon from '@mui/icons-material/Person';
import CredentialsIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import GroupIcon from '@mui/icons-material/Group';
import GroupsIcon from '@mui/icons-material/Group';
import HidePasswordIcon from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import PasswordIcon from '@mui/icons-material/VpnKey';
import PropTypes from 'prop-types';
import SaveIcon from '@mui/icons-material/Save';
import ShowPasswordIcon from '@mui/icons-material/Visibility';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import qs from 'qs';
import { useConfirm } from 'material-ui-confirm';

const PREFIX = 'StreamDetail';

const classes = {
    root: `${PREFIX}-root`,
    paper: `${PREFIX}-paper`,
    form: `${PREFIX}-form`,
    textField: `${PREFIX}-textField`,
    buttons: `${PREFIX}-buttons`,
    margin: `${PREFIX}-margin`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const StyledRedirect = styled(Redirect)((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
		width: '100%'
	},

    [`& .${classes.paper}`]: {
		padding: '15px'
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

const ajv = new Ajv({
	allErrors: true,
	verbose: true,
	// code: {
	// 	// NEW
	// 	es5: true,
	// 	lines: true,
	// 	source: true,
	// 	process: undefined, // (code: string) => string
	// 	optimize: true,
	// },
});

function a11yProps(index) {
	return {
		id: `scrollable-prevent-tab-${index}`,
		'aria-controls': `scrollable-prevent-tabpanel-${index}`
	};
}

const streamShape = PropTypes.shape({
	streamname: PropTypes.string,
});

const StreamDetail = (props) => {

	const [value, setValue] = React.useState(0);
	const [showPassword, setShowPassword] = React.useState(false);
	const [editMode, setEditMode] = React.useState(false);
	const { enqueueSnackbar } = useSnackbar();
	const [darkMode, setDarkMode] = useLocalStorage('cedalo.managementcenter.darkMode');

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
			return updatedStream.streamname !== ''
				&& updatedStream.sourcetopic !== '';
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
		try {
			await brokerClient.modifyStream(updatedStream);
			enqueueSnackbar('Stream successfully updated', {
				variant: 'success'
			});
			const streamObject = await brokerClient.getStream(updatedStream.streamname);
			dispatch(updateStream(streamObject));
			const streams = await brokerClient.listStreams();
			dispatch(updateStreams(streams));
			setEditMode(false);
		} catch (error) {
			enqueueSnackbar(`Error modifying stream "${updatedStream.streamname}". Reason: ${error}`, {
				variant: 'error'
			});
		}
	};

	const onCancelEdit = async () => {
		await confirm({
			title: 'Cancel editing stream',
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
									label="Stream name"
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
									id="textdescription"
									label="Description"
									value={updatedStream.textdescription}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
									onChange={(event) => {
										if (editMode) {
											setUpdatedStream({
												...updatedStream,
												textdescription: event.target.value
											});
										}
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									required={editMode}
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
									InputProps={{ inputProps: { min: 0, max: 2 } }}
									className={classes.textField}
									onChange={(event) => {
										if (editMode) {
											setUpdatedStream({
												...updatedStream,
												targetqos: parseInt(event.target.value)
											});
										}
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									disabled={!editMode}
									id="ttl"
									label="TTL"
									value={updatedStream.ttl}
									defaultValue=""
									variant="outlined"
									fullWidth
									type="number"
									InputProps={{ inputProps: { min: 0 } }}
									className={classes.textField}
									onChange={(event) => {
										if (editMode) {
											setUpdatedStream({
												...updatedStream,
												ttl: parseInt(event.target.value)
											});
										}
									}}
								/>
							</Grid>
							{/* <Grid item xs={12}>
								<TextField
									disabled={!editMode}
									id="key"
									label="Key"
									value={updatedStream.key}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
									onChange={(event) => {
										if (editMode) {
											setUpdatedStream({
												...updatedStream,
												key: event.target.value
											});
										}
									}}
								/>
							</Grid> */}
							{ editMode && <Grid item xs={12}>
								<Editor
									ace={ace}
									ajv={ajv}
									// schema={schema}
									value={updatedStream.query || {}}
									theme={darkMode === 'true' ? "ace/theme/monokai" : "ace/theme/github"}
									onChange={(query) => {
										if (editMode) {
											setUpdatedStream({
												...updatedStream,
												query
											});
										} else {
											enqueueSnackbar('Please enable edit mode before editing the query', {
												variant: 'error'
											});
										}
									}}
									mode="code"
									navigationBar={false}
									search={false}
									allowedModes={[ 'code', 'view', 'form', 'tree']}
								/>
							</Grid>
							}
							<Grid item xs={12}>
								<FormControlLabel
									control={
										<Switch
											disabled={!editMode}
											checked={
												typeof updatedStream.process === 'undefined' ||
												updatedStream.process === true
											}
											onClick={(event) => {
												if (editMode) {
													setUpdatedStream({
														...updatedStream,
														process: event.target.checked
													});
												}
											}}
										/>
									}
									label="Process"
								/>
								<FormControlLabel
									control={
										<Switch
											disabled={!editMode}
											checked={
												typeof updatedStream.persist === 'undefined' ||
												updatedStream.persist === true
											}
											onClick={(event) => {
												if (editMode) {
													setUpdatedStream({
														...updatedStream,
														persist: event.target.checked
													});
												}
											}}
										/>
									}
									label="Persist"
								/>
								<FormControlLabel
									control={
										<Switch
											disabled={!editMode}
											checked={
												typeof updatedStream.active === 'undefined' ||
												updatedStream.active === true
											}
											onClick={(event) => {
												if (editMode) {
													setUpdatedStream({
														...updatedStream,
														active: event.target.checked
													});
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
								onUpdateStream();
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
		<StyledRedirect to="/streams" push />
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
