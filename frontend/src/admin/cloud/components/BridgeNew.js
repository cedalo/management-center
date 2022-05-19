import React, { useContext, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { updateBridge, updateBridges } from '../actions/actions';
import { useSnackbar } from 'notistack';

import { Alert, AlertTitle } from '@material-ui/lab';
import ClusterIcon from '@material-ui/icons/Storage';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import Paper from '@material-ui/core/Paper';
import { Link as RouterLink } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import SaveCancelButtons from '../../../components/SaveCancelButtons';

const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
			margin: theme.spacing(1)
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
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

const BridgeNew = (props) => {
	const { bridges, bridgesFeature } = props;
	const classes = useStyles();

	const [bridgename, setBridgename] = useState('Example');
	const [bridgeDescription, setBridgeDescription] = useState('Example bridge');

	const bridgenameExists = props?.bridges?.find((searchBridge) => {
		return searchBridge.bridgename === bridgename;
	});

	const validate = () => {
		const valid = 
			!bridgenameExists 
			&& bridgename !== ''
			&& bridgename.match(/^[0-9a-zA-Z]+$/);
		return valid;
	};

	const { enqueueSnackbar } = useSnackbar();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { client } = context;

	const onSaveBridge = async () => {
		try {
			await client.createBridge({
				bridgename, 
				description:bridgeDescription
			});
			const bridges = await client.listBridges();
			dispatch(updateBridges(bridges));
			history.push(`/admin/cloud/bridges`);
			enqueueSnackbar(`Bridge "${bridgename}" successfully created.`, {
				variant: 'success'
			});
		} catch (error) {
			enqueueSnackbar(`Error creating bridge "${bridgename}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error;
		}
	};

	const onCancel = async () => {
		await confirm({
			title: 'Cancel bridge creation',
			description: `Do you really want to cancel creating this bridge?`,
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
				<RouterLink className={classes.breadcrumbLink} to="/security">
					Admin
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Bridges
				</Typography>
			</Breadcrumbs>
			<br />
			{/* TODO: Quick hack to detect whether feature is supported */}
			{bridgesFeature?.error ? <><br /><Alert severity="warning">
				<AlertTitle>{bridgesFeature.error.title}</AlertTitle>
				{bridgesFeature.error.message}
			</Alert></> : null}
			{!bridgesFeature?.error && <div className={classes.root}>
				<Paper>
					<form className={classes.form} noValidate autoComplete="off">
						<div className={classes.margin}>
							<Grid container spacing={1} alignItems="flex-end">
								<Grid item xs={12} sm={4}>
									<TextField
										error={bridgenameExists}
										helperText={bridgenameExists && 'A bridge with this name already exists.'}
										required
										id="bridgename"
										label="Bridge name"
										onChange={(event) => setBridgename(event.target.value)}
										defaultValue="Example"
										variant="outlined"
										fullWidth
										className={classes.textField}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<ClusterIcon />
												</InputAdornment>
											)
										}}
									/>
								</Grid>
								<Grid item xs={12} sm={8}>
									<TextField
										required={false}
										id="description"
										label="Bridge description"
										onChange={(event) => setBridgeDescription(event.target.value)}
										defaultValue="Example bridge"
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid>
								<Grid container xs={12} alignItems="flex-start">
									<Grid item xs={12} className={classes.buttons}>
										<SaveCancelButtons
											onSave={onSaveBridge}
											saveDisabled={!validate()}
											onCancel={onCancel}
										/>
									</Grid>
								</Grid>
							</Grid>
						</div>
					</form>
				</Paper>
			</div>}
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		bridges: state.bridges?.bridges,
		bridgesFeature: state.systemStatus?.features?.bridgesFeature,
	};
};

export default connect(mapStateToProps)(BridgeNew);
