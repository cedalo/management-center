import { Button } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import WaitDialog from '../../../components/WaitDialog';
import { WarningHint } from './AlertHint';

const deleteMessage = (cert) =>
	`Removing certificate "${cert.name}" from management-center and registered connections...`;
const errorMessage = (cert, error) =>
	`Error deleting certificate "${cert.name}" from server. Reason: ${error.message || error}`;
const warningMessage = (cert) => `Failed to revoke certificate "${cert.name}" from all registered brokers.`;

const DeleteCertificateDialog = ({ open, cert, client, onClose }) => {
	const [options, setOptions] = useState({ actions: undefined, message: '' });
	const { enqueueSnackbar } = useSnackbar();

	useEffect(() => {
		if (cert) {
			setOptions({ message: deleteMessage(cert) });
			deleteCert(cert);
		}
	}, [open]);

	const onForceDelete = async () => {
		// remove from management center
		try {
			await client.deleteCertificate(cert.id, true);
		} catch (error) {
			enqueueSnackbar(errorMessage(cert, error), { variant: 'error' });
		} finally {
			onClose();
		}
	};
	const deleteCert = async (cert) => {
		// await wait(3000);
		try {
			const { deploy } = await client.deleteCertificate(cert.id);
			// check deploy status
			if (deploy.status == 207) {
				const message = WarningHint({ message: warningMessage(cert) });
				const actions = (
					<>
						<Button onClick={onForceDelete}>Delete Anyway</Button>
						<Button onClick={onClose}>Ok</Button>
					</>
				);
				// keep open to and ask for
				setOptions({ message, actions });
			} else {
				onClose();
			}
		} catch (error) {
			enqueueSnackbar(errorMessage(cert, error), { variant: 'error' });
			onClose();
		}
	};

	return <WaitDialog title="Delete certificate" message={options.message} open={open} actions={options.actions} />;
};
export default DeleteCertificateDialog;
