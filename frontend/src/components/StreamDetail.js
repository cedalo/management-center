import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import Ajv from 'ajv';
import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/github'
import 'brace/theme/monokai'
import {JsonEditor as Editor} from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {updateStream, updateStreams} from '../actions/actions';
import useLocalStorage from '../helpers/useLocalStorage';
import {useFormStyles} from '../styles';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
import './jsoneditor-fix.css';
import { useConfirmCancel } from '../helpers/useConfirmDialog';


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

const streamShape = PropTypes.shape({
	streamname: PropTypes.string,
});

const StreamDetail = (props) => {
	const [value, setValue] = React.useState(0);
	const [showPassword, setShowPassword] = React.useState(false);
	const [editMode, setEditMode] = React.useState(false);
	const {enqueueSnackbar} = useSnackbar();
	const [darkMode, setDarkMode] = useLocalStorage('cedalo.managementcenter.darkMode');
	const formClasses = useFormStyles();
	const {stream = {}, defaultStream} = props;
	const [updatedStream, setUpdatedStream] = React.useState({
		...stream
	});

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const confirmCancel = useConfirmCancel();
	const {client: brokerClient} = context;

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
			description: `Do you really want to disable stream "${streamname}"?`
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
		await confirmCancel({
			title: 'Cancel editing stream',
			description: `Do you really want to cancel editing this stream?`
		});
		setUpdatedStream({
			...stream
		});
		setEditMode(false);
	};
	const {
		match: {
			params: {streamName}
		}
	} = props;
	// TODO: get stream by streamname if current stream is not defined

	return stream.streamname ? (
		<ContentContainer
			breadCrumbs={<ContainerBreadCrumbs title={stream.streamname} links={[{name: 'Home', route: '/home'}, {
				name: 'Streams',
				route: '/streams'
			}]}/>}
		>
			<ContainerHeader
				title={`Edit Stream: ${stream.streamname}`}
				subTitle="View or modify Stream Settings or change state flags. Click on 'Edit' to modify the settings. The stream definition is only visible in edit mode."
			/>
			<FormGroup>
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
					label="Stream Name"
					value={updatedStream.streamname}
					defaultValue=""
					variant="outlined"
					fullWidth
					size="small"
					margin="normal"
					className={formClasses.textField}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<AccountCircle/>
							</InputAdornment>
						)
					}}
				/>
				<TextField
					disabled={!editMode}
					id="textdescription"
					label="Description"
					value={updatedStream.textdescription}
					defaultValue=""
					variant="outlined"
					fullWidth
					size="small"
					margin="normal"
					className={formClasses.textField}
					onChange={(event) => {
						if (editMode) {
							setUpdatedStream({
								...updatedStream,
								textdescription: event.target.value
							});
						}
					}}
				/>
				<TextField
					required={editMode}
					disabled={!editMode}
					id="source-topic"
					label="Source Topic"
					value={updatedStream.sourcetopic}
					defaultValue=""
					variant="outlined"
					fullWidth
					size="small"
					margin="normal"
					className={formClasses.textField}
					onChange={(event) => {
						if (editMode) {
							setUpdatedStream({
								...updatedStream,
								sourcetopic: event.target.value
							});
						}
					}}
				/>
				<TextField
					disabled={!editMode}
					id="target-topic"
					label="Target Topic"
					value={updatedStream.targettopic}
					defaultValue=""
					variant="outlined"
					fullWidth
					size="small"
					margin="normal"
					className={formClasses.textField}
					onChange={(event) => {
						if (editMode) {
							setUpdatedStream({
								...updatedStream,
								targettopic: event.target.value
							});
						}
					}}
				/>
				<TextField
					disabled={!editMode}
					id="target-qos"
					label="Target QoS"
					value={updatedStream.targetqos}
					defaultValue=""
					variant="outlined"
					fullWidth
					type="number"
					InputProps={{inputProps: {min: 0, max: 2}}}
					size="small"
					margin="normal"
					className={formClasses.textField}
					onChange={(event) => {
						if (editMode) {
							setUpdatedStream({
								...updatedStream,
								targetqos: parseInt(event.target.value)
							});
						}
					}}
				/>
				<TextField
					disabled={!editMode}
					id="ttl"
					label="TTL"
					value={updatedStream.ttl}
					defaultValue=""
					variant="outlined"
					fullWidth
					type="number"
					InputProps={{inputProps: {min: 0}}}
					size="small"
					margin="normal"
					className={formClasses.textField}
					onChange={(event) => {
						if (editMode) {
							setUpdatedStream({
								...updatedStream,
								ttl: parseInt(event.target.value)
							});
						}
					}}
				/>
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
				{editMode &&
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
						allowedModes={['code', 'view', 'form', 'tree']}
					/>
				}
				<Grid>
					<FormControlLabel
						control={
							<Switch
								color="primary"
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
								color="primary"
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
								color="primary"
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
				{!editMode && (
					<Button
						style={{marginTop: '15px', width: '120px'}}
						variant="contained"
						color="primary"
						size="small"
						startIcon={<EditIcon/>}
						onClick={() => setEditMode(true)}
					>
						Edit
					</Button>
				)}
				{editMode && (
					<Grid item xs={12}>
						<Button
							variant="contained"
							disabled={!validate()}
							style={{marginRight: '10px', marginTop: '10px', marginBottom: '15px'}}
							size="small"
							color="primary"
							startIcon={<SaveIcon/>}
							onClick={(event) => {
								event.stopPropagation();
								onUpdateStream();
							}}
						>
							Save
						</Button>
						<Button
							variant="contained"
							style={{marginTop: '10px', marginBottom: '15px'}}
							size="small"
							onClick={(event) => {
								event.stopPropagation();
								onCancelEdit();
							}}
						>
							Cancel
						</Button>
					</Grid>
				)}
			</FormGroup>
		</ContentContainer>
	) : (
		<Redirect to="/streams" push/>
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
