import React, { useContext, useState } from 'react';
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import './jsoneditor-fix.css';
import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/github'
import 'brace/theme/monokai'
import Ajv from 'ajv';
import { useSnackbar } from 'notistack';

import { connect, useDispatch } from 'react-redux';
import { updateStreams } from '../actions/actions';

import AccountCircle from '@material-ui/icons/AccountCircle';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import ClientIDIcon from '@material-ui/icons/Fingerprint';
import ClientIcon from '@material-ui/icons/Person';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PasswordIcon from '@material-ui/icons/VpnKey';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import SaveIcon from '@material-ui/icons/Save';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import useLocalStorage from '../helpers/useLocalStorage';

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

const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
			margin: theme.spacing(1)
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
			width: '75ch'
		}
	},
	buttons: {
		'& > *': {
			margin: theme.spacing(1)
		}
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
	margin: {
		margin: theme.spacing(2)
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const StreamNew = (props) => {
	const classes = useStyles();
	const { enqueueSnackbar } = useSnackbar();

	const [streamname, setStreamname] = useState('');
	const [textdescription, setTextdescription] = useState('');
	const [sourceTopic, setSourceTopic] = useState('');
	const [targetTopic, setTargetTopic] = useState('');
	// const [key, setKey] = useState('');
	const [targetQoS, setTargetQoS] = useState(2);
	const [ttl, setTTL] = useState(86400);
	const [query, setQuery] = useState({});
	const [darkMode, setDarkMode] = useLocalStorage('cedalo.managementcenter.darkMode');

	const streamnameExists = props?.streams?.find((searchStream) => {
		return searchStream.streamname === streamname;
	});

	const validate = () => {
		const valid = !streamnameExists
			&& streamname !== ''
			&& sourceTopic !== '';
		return valid;
	};

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { client } = context;

	const onSaveStream = async () => {
		try {
			await client.createStream({
				streamname, 
				textdescription,
				sourceTopic, 
				targetTopic,
				targetQoS,
				ttl,
				// key,
				query
			});
			const streams = await client.listStreams();
			dispatch(updateStreams(streams));
			history.push(`/streams`);
			enqueueSnackbar(`Stream "${streamname}" successfully created.`, {
				variant: 'success'
			});
		} catch(error) {
			enqueueSnackbar(`Error creating stream "${streamname}". Reason: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
		}
	};

	const onCancel = async () => {
		await confirm({
			title: 'Cancel stream creation',
			description: `Do you really want to cancel creating this stream?`,
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
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Streams
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
										error={streamnameExists}
										helperText={streamnameExists && 'A stream with this name already exists.'}
										required
										id="streamname"
										label="Stream name"
										onChange={(event) => setStreamname(event.target.value)}
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
										id="description"
										label="Description"
										onChange={(event) => setTextdescription(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										required
										id="sourcetopic"
										label="Source Topic"
										onChange={(event) => setSourceTopic(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										id="targettopic"
										label="Target topic"
										onChange={(event) => setTargetTopic(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										id="targetqos"
										label="Target QoS"
										onChange={(event) => setTargetQoS(event.target.value)}
										defaultValue={-1}
										type="number"
										InputProps={{ inputProps: { min: -1, max: 2 } }}
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										id="ttl"
										label="TTL"
										onChange={(event) => setTTL(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid>
								{/* <Grid item xs={12}>
									<TextField
										id="key"
										label="Key"
										onChange={(event) => setKey(event.target.value)}
										defaultValue=""
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid> */}
								<Grid item xs={12}>
									<Editor
										className={classes.editor}
										// value={}
										ace={ace}
										// onChange={this.handleChange}
										ajv={ajv}
										value={query}
										theme={darkMode === 'true' ? "ace/theme/monokai" : "ace/theme/github"}
										onChange={(json) => setQuery(json)}
										mode="code"
										navigationBar={false}
										search={false}
										allowedModes={[ 'code', 'view', 'form', 'tree']}
									/>
								</Grid>
								<Grid container xs={12} alignItems="flex-start">
									<Grid item xs={12} className={classes.buttons}>
										<Button
											variant="contained"
											disabled={!validate()}
											color="primary"
											className={classes.button}
											startIcon={<SaveIcon />}
											onClick={(event) => {
												event.stopPropagation();
												onSaveStream();
											}}
										>
											Save
										</Button>
										<Button
											variant="contained"
											onClick={(event) => {
												event.stopPropagation();
												onCancel();
											}}
										>
											Cancel
										</Button>
									</Grid>
								</Grid>
							</Grid>
						</div>
					</form>
				</Paper>
			</div>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		streams: state.streams?.streams
	};
};

export default connect(mapStateToProps)(StreamNew);
