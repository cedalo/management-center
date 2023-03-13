import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import {makeStyles} from '@material-ui/core/styles';
import {useFormStyles} from '../styles';
import TextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
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
import React, {useContext, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {updateStreams} from '../actions/actions';
import useLocalStorage from '../helpers/useLocalStorage';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import './jsoneditor-fix.css';

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
	},
	margin: {
		margin: theme.spacing(2)
	},
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
	const formClasses = useFormStyles();

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
			<ContainerBreadCrumbs title="New Stream" links={[{name: 'Home', route: '/home'},{name: 'Streams', route: '/streams'}]}/>
			<ContainerHeader
				title="New Stream"
				subTitle="Create a new Stream. The Stream name has to be unique."
			/>
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
							size="small"
							margin="dense"
							className={formClasses.textField}
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
							size="small"
							margin="dense"
							className={formClasses.textField}
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
							size="small"
							margin="dense"
							className={formClasses.textField}
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
							size="small"
							margin="dense"
							className={formClasses.textField}
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
							size="small"
							margin="dense"
							className={formClasses.textField}
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
							size="small"
							margin="dense"
							className={formClasses.textField}
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
						<Grid item xs={12}>
							<Button
								variant="contained"
								style={{marginRight: '10px', marginTop: '10px'}}
								size="small"
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
								size="small"
								style={{marginTop: '10px'}}
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
	);
};

const mapStateToProps = (state) => {
	return {
		streams: state.streams?.streams
	};
};

export default connect(mapStateToProps)(StreamNew);
