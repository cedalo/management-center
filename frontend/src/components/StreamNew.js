import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
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

import AccountCircle from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import ClientIDIcon from '@mui/icons-material/Fingerprint';
import ClientIcon from '@mui/icons-material/Person';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import PasswordIcon from '@mui/icons-material/VpnKey';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import useLocalStorage from '../helpers/useLocalStorage';

const PREFIX = 'StreamNew';

const classes = {
    root: `${PREFIX}-root`,
    buttons: `${PREFIX}-buttons`,
    form: `${PREFIX}-form`,
    textField: `${PREFIX}-textField`,
    margin: `${PREFIX}-margin`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
		'& > *': {
			margin: theme.spacing(1)
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
			width: '75ch'
		}
	},

    [`& .${classes.buttons}`]: {
		'& > *': {
			margin: theme.spacing(1)
		}
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

    [`& .${classes.margin}`]: {
		margin: theme.spacing(2)
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

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

const StreamNew = (props) => {

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
        <Root>
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
		</Root>
    );
};

const mapStateToProps = (state) => {
	return {
		streams: state.streams?.streams
	};
};

export default connect(mapStateToProps)(StreamNew);
