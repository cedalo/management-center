import { useConfirm } from 'material-ui-confirm';

const CANCEL_CONFIRM_OPTS = {
    confirmationText: 'Yes, cancel',
    cancellationText: 'No',
};

// simple wrapper around useConfirm to create specialized confirm dialogs
// NOTE: use <ConfirmProvider defaultOptions={}> to set global confirm options
export const useConfirmDialog = (defOpts) => {
    const confirm = useConfirm();
    return (opts) => confirm({ ...defOpts, ...opts });
};

export const useConfirmCancel = () => useConfirmDialog(CANCEL_CONFIRM_OPTS);
