import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {Grid, IconButton, TextField } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { useSnackbar } from 'notistack';
import SaveCancelButtons from '../../../components/SaveCancelButtons';
import { WebSocketContext } from '../../../websockets/WebSocket';
import ContentContainer from './ContentContainer';
import UploadButton from './UploadButton';

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
	}
}));
const deployMessage = (cert) => ({
	error: {
		add: `'Failed to deploy certificate "${cert.name}"`,
		update: `'Failed to deploy certificate "${cert.name}"`
	},
	success: {
		add: `Certificate "${cert.name}" successfully added.`,
		update: `Certificate "${cert.name}" successfully updated.`
	},
	warning: {
		add: `New certificate "${cert.name}" could not be deployed to all brokers.`,
		update: `Certificate "${cert.name}" could not be updated on all brokers. Kept previous and updated certificates!`
	}
});

const isValid = (crt) => crt.name && crt.filename && crt.cert;

const notifyError = (message, enqueueSnackbar) =>
	enqueueSnackbar(`${message} Reason: ${error.message || error}`, {
		variant: 'error'
	});

const CertificateDetail = () => {
	const classes = useStyles();
	const history = useHistory();
	const { enqueueSnackbar } = useSnackbar();
	const [canSave, setCanSave] = useState(false);
	const [cert, setCert] = useState(history.location.state);
	const context = useContext(WebSocketContext);
	const { client } = context;
	const initial = useRef(false);

	useEffect(() => {
		if (initial.current) setCanSave(isValid(cert));
		else initial.current = true;
	}, [cert]);

	const onNameChange = (event) => {
		const name = event.target.value;
		if (name !== cert.name) {
			setCert({ ...cert, name });
		}
	};
	const onCertUpload = ({ error, data, file } = {}) => {
		if (error) notifyError(`Failed to upload certificate file "${file.name}".`, enqueueSnackbar);
		else setCert({ ...cert, filename: file.name, cert: data });
	};
	const onCertDelete = (/* event */) => {
		setCert({ ...cert, filename: '', cert: null });
	};
	const onSave = async (/* event */) => {
		const action = cert.id == null ? 'add' : 'update';
		try {
			const { status } = await (action === 'add' ? client.addCertificate(cert) : client.updateCertificate(cert));
			switch (status) {
				case 200:
					enqueueSnackbar(deployMessage(cert).success[action], { variant: 'success' });
					break;
				case 207:
					enqueueSnackbar(deployMessage(cert).warning[action], { variant: 'warning' });
					break;
				default:
					enqueueSnackbar(deployMessage(cert).error[action], { variant: 'error' });
			}
		} catch (error) {
			enqueueSnackbar(`Error ${action} certificate "${cert.name}".`, { variant: 'error' });
		}
		history.goBack();
	};
	const onCancel = (/* event */) => {
		history.goBack();
	};

	return (
		<ContentContainer
			path={[
				{ link: 'home' },
				{ link: 'admin' },
				{ link: 'admin/certs', title: 'Certificates' },
				{ title: 'CA Certificate' }
			]}
		>
			<form className={classes.form} noValidate autoComplete="off">
				<div className={classes.margin}>
					<Grid container spacing={1} alignItems="flex-end">
						<Grid item xs={12}>
							<TextField
								id="caid"
								label="ID"
								variant="outlined"
								className={classes.textField}
								InputLabelProps={{ shrink: true }}
								fullWidth
								value={cert.id}
								defaultValue=""
								disabled
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								id="caname"
								label="Descriptive Name"
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
									startAdornment: <UploadButton name="ca" onUpload={onCertUpload} />,
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
						<Grid container xs={12} alignItems="flex-start">
							<Grid item xs={12} className={classes.buttons}>
								<SaveCancelButtons onSave={onSave} saveDisabled={!canSave} onCancel={onCancel} />
							</Grid>
						</Grid>
					</Grid>
				</div>
			</form>
		</ContentContainer>
	);
};

export default CertificateDetail;
