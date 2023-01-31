import React, { useContext, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, IconButton, Paper, TextField } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { WebSocketContext } from '../../../websockets/WebSocket';
import PathCrumbs from './PathCrumbs';
import SaveCancelButtons from '../../../components/SaveCancelButtons';
import AutoSuggest from '../../../components/AutoSuggest';
import UploadButton from './UploadButton';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
	buttons: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},
	crossButton: {
		// fontSize: '0.8em',
		borderRadius: '100%'
	},
	closeIcon: {
		maxHeight: '60%',
		maxWidth: '60%'
	},
	form: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	margin: {
		margin: theme.spacing(2)
	},
	paper: {
		padding: theme.spacing(2),
		textAlign: 'center',
		color: theme.palette.text.secondary
	},
	textField: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
	}
}));

const compareByName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

const CertificateDetail = ({ connections = [] }) => {
	const classes = useStyles();
	const history = useHistory();
	const { enqueueSnackbar } = useSnackbar();
	const [cert, setCert] = useState(history.location.state);
	const context = useContext(WebSocketContext);
	const { client } = context;
	const allConnections = connections.sort(compareByName).map((conn) => ({ label: conn.name, value: conn.id }));

	const onNameChange = (event) => {
		setCert({ ...cert, name: event.target.value });
	};
	const onCertUpload = ({ error, data, file } = {}) => {
		// CERT: error notification
		if (error) console.log(error);
		else setCert({ ...cert, filename: file.name, cert: data });
	};
	const onCertDelete = (/* event */) => {
		setCert({ ...cert, filename: '', cert: null });
	};
	const onConnectionChoosed = (choosedConns) => {
		choosedConns = choosedConns || [];
		setCert({ ...cert, connections: choosedConns.map((conn) => ({ id: conn.value, name: conn.label })) });
	};
	const onSave = async (/* event */) => {
		try {
			if (cert.id == null) {
				await client.addCertificate(cert);
				enqueueSnackbar(`Certificate "${cert.name}" successfully added.`, { variant: 'success' });
			} else {
				await client.updateCertificate(cert);
				enqueueSnackbar(`Certificate "${cert.name}" successfully updated.`, { variant: 'success' });
			}
		} catch (error) {
			const action = cert.id == null ? 'adding' : 'updating';
			enqueueSnackbar(`Error ${action} certificate "${cert.name}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
		history.goBack();
	};
	const onCancel = (event) => {
		history.goBack();
	};
	// CERT: return false if no changes were made...
	const validate = (crt) => {
		return crt.name && crt.filename && crt.cert;
	};

	return (
		<>
			<PathCrumbs
				path={[
					{ link: 'home' },
					{ link: 'admin' },
					{ link: 'admin/certs', title: 'Certs' },
					{ title: 'Certificate' }
				]}
			/>
			<br />
			<br />
			<Paper className={classes.paper}>
				<form className={classes.form} noValidate autoComplete="off">
					<div className={classes.margin}>
						<Grid container spacing={1} alignItems="flex-end">
							<Grid item xs={12}>
								<TextField
									id="caname"
									label="Name"
									variant="outlined"
									className={classes.textField}
									InputLabelProps={{ shrink: true }}
									fullWidth
									required
									value={cert.name}
									defaultValue=""
									onChange={onNameChange}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									id="cacert"
									label="CA Certificate"
									variant="outlined"
									className={classes.textField}
									fullWidth
									required
									value={cert.filename}
									defaultValue=""
									inputProps={{ readOnly: true }}
									size={{ width: '80%' }}
									// InputLabelProps={{ shrink: true }}
									InputProps={{
										startAdornment: (
											<UploadButton name="ca" onUpload={onCertUpload} size={{ width: '20%' }} />
										),
										endAdornment: (
											<IconButton
												className={classes.crossButton}
												style={{ backgroundColor: 'transparent' }}
												size="small"
												onClick={onCertDelete}
												disabled={!cert.filename}
											>
												<Close className={classes.closeIcon} />
											</IconButton>
										)
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<AutoSuggest
									placeholder="Deploy certificate to connections..."
									// CERT: filter those already added
									suggestions={allConnections}
									values={(cert.connections || []).map((conn) => ({
										label: conn.name,
										value: conn.id
									}))}
									handleChange={onConnectionChoosed}
									TextFieldProps={{
										label: 'Deploy to connections',
										variant: 'outlined'
									}}
								/>
							</Grid>
							<Grid container xs={12} alignItems="flex-start">
								<Grid item xs={12} className={classes.buttons}>
									<SaveCancelButtons
										onSave={onSave}
										saveDisabled={!validate(cert)}
										onCancel={onCancel}
									/>
								</Grid>
							</Grid>
						</Grid>
					</div>
				</form>
			</Paper>
		</>
	);
};

const mapStateToProps = (state) => {
	return { connections: state.brokerConnections?.brokerConnections };
};

export default connect(mapStateToProps)(CertificateDetail);
