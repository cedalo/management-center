import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {Box, Collapse, Grid, IconButton, Table, TableCell, TableRow, TextField } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import CollapseIcon from '@material-ui/icons/KeyboardArrowUp';
import ExpandIcon from '@material-ui/icons/KeyboardArrowDown';
import { useSnackbar } from 'notistack';
import SaveCancelButtons from '../../../components/SaveCancelButtons';
import { WebSocketContext } from '../../../websockets/WebSocket';
import ContentContainer from './ContentContainer';
import UploadButton from './UploadButton';
import CertificateInfo from './CertificateInfo';

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
const saveMessage = (cert) => ({
	success: {
		add: `Certificate "${cert.name}" successfully added.`,
		update: `Certificate "${cert.name}" successfully updated.`
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
	const [isExpanded, setIsExpanded] = useState(false);
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
			await (action === 'add' ? client.addCertificate(cert) : client.updateCertificate(cert));
			enqueueSnackbar(saveMessage(cert).success[action], { variant: 'success' });
		} catch (error) {
			enqueueSnackbar(`Failed to ${action} "${cert.name}"! Reason: ${error.message}`, { variant: 'error' });
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
				{ link: 'certs', title: 'Certificates' },
				{ title: 'CA Certificate' }
			]}
		>
			<form className={classes.form} noValidate autoComplete="off">
				<div className={classes.margin}>
					<Grid container spacing={1} alignItems="flex-end">
						{/* <Grid item xs={12}>
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
						</Grid> */}
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
						<Grid item xs={12}>
							{/* <CertificateInfo certificate={cert} variant="detailed" /> */}
							<Table aria-label="certinfo-detail">
								<TableRow>
									<TableCell width="2%">
										<IconButton
											aria-label="expand row"
											size="small"
											onClick={() => setIsExpanded(!isExpanded)}
										>
											{isExpanded ? <CollapseIcon /> : <ExpandIcon />}
										</IconButton>
									</TableCell>
									<TableCell width="10%" align="left">
										Certificate Details
									</TableCell>
									<TableCell width="88%"></TableCell>
								</TableRow>
								<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
									<Collapse in={isExpanded} timeout="auto" unmountOnExit>
										<Box margin={1} display="flex" flexDirection="row">
											<CertificateInfo certificate={cert} variant="detailed" />
										</Box>
									</Collapse>
								</TableCell>
							</Table>
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
