import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Collapse, Grid, IconButton, Table, TableCell, TableRow, TextField } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import CollapseIcon from '@material-ui/icons/KeyboardArrowUp';
import ExpandIcon from '@material-ui/icons/KeyboardArrowDown';
import { useSnackbar } from 'notistack';
import ContainerBreadCrumbs from '../../../components/ContainerBreadCrumbs';
import SaveCancelButtons from '../../../components/SaveCancelButtons';
import { WebSocketContext } from '../../../websockets/WebSocket';
import ContentContainer from '../../../components/ContentContainer';
import UploadButton from './UploadButton';
import CertificateInfo from './CertificateInfo';
import { loadCertificateInfo } from './certutils';
import ContainerHeader from '../../../components/ContainerHeader';
import { useFormStyles } from '../../../styles';

const useStyles = makeStyles((theme) => ({
    buttons: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    crossButton: {
        // fontSize: '0.8em',
        borderRadius: '100%',
    },
    tableCell: {
        padding: '2px',
    },
    closeIcon: {
        maxHeight: '60%',
        maxWidth: '60%',
    },
    form: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    margin: {
        margin: theme.spacing(2),
    },
}));
const saveMessage = (cert) => ({
    success: {
        add: `Certificate "${cert.name}" successfully added.`,
        update: `Certificate "${cert.name}" successfully updated.`,
    },
});

const isValid = (crt) => crt.name && crt.filename;
const isAvailable = (crt) => crt.cert || isValid(crt);

const CertificateDetail = () => {
    const classes = useStyles();
    const history = useHistory();
    const { enqueueSnackbar } = useSnackbar();
    const [canSave, setCanSave] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    // read initial state from history location
    const { cert: selectedCert = {}, certNames = [] } = history.location.state;
    const [cert, setCert] = useState(selectedCert);
    const context = useContext(WebSocketContext);
    const { client } = context;
    const initial = useRef(false);
    const formClasses = useFormStyles();

    const isNameUsed = cert.name !== selectedCert.name && certNames.includes(cert.name);

    useEffect(() => {
        if (initial.current) setCanSave(isValid(cert) && !isNameUsed);
        else initial.current = true;
    }, [cert]);

    const onNameChange = (event) => {
        const name = event.target.value;
        if (name !== cert.name) {
            setCert({ ...cert, name });
        }
    };
    const onCertUpload = async ({ error, data, file } = {}) => {
        if (error) enqueueSnackbar(`Failed to upload certificate file "${file.name}".`, { variant: 'error' });
        else {
            const certificate = { cert: data, filename: file.name };
            const { info, error: failed } = await loadCertificateInfo(certificate, client);
            if (!info || failed) {
                enqueueSnackbar(`File "${file.name}" is not a valid certificate!`, { variant: 'error' });
            } else {
                setCert({ ...cert, ...certificate });
            }
        }
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
            breadCrumbs={
                <ContainerBreadCrumbs
                    title="CA Certificate"
                    links={[
                        { name: 'Home', route: '/home' },
                        { name: 'Certificates', route: '/certs' },
                    ]}
                />
            }
            overFlowX="hidden"
        >
            <ContainerHeader
                title="Certificate"
                subTitle="Add or edit a certificate by adding a description and uploading the certificate file."
            />
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
                        error={isNameUsed}
                        helperText={isNameUsed && 'Certificate name already used!'}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        size="small"
                        margin="dense"
                        className={formClasses.textField}
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
                        size="small"
                        margin="dense"
                        className={formClasses.textField}
                        fullWidth
                        required
                        value={cert.filename}
                        defaultValue=""
                        inputProps={{ readOnly: true }}
                        // InputLabelProps={{ shrink: true }}
                        InputProps={{
                            startAdornment: <UploadButton onUpload={onCertUpload} />,
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
                            ),
                        }}
                    />
                </Grid>
                {isAvailable(cert) && (
                    <Grid item xs={12}>
                        <Table size="small" aria-label="certinfo-detail">
                            <TableRow>
                                <TableCell style={{ width: '10px' }}>
                                    <IconButton
                                        aria-label="expand row"
                                        size="small"
                                        onClick={() => setIsExpanded(!isExpanded)}
                                    >
                                        {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                                    </IconButton>
                                </TableCell>
                                <TableCell align="left">Certificate Details</TableCell>
                                {/*<TableCell width="88%"></TableCell>*/}
                            </TableRow>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit display="">
                                    <Box margin={1} display="flex" flexDirection="row">
                                        <CertificateInfo certificate={cert} variant="detailed" />
                                    </Box>
                                </Collapse>
                            </TableCell>
                        </Table>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <SaveCancelButtons onSave={onSave} saveDisabled={!canSave} onCancel={onCancel} />
                </Grid>
            </Grid>
        </ContentContainer>
    );
};

export default CertificateDetail;
