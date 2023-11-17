import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { useSnackbar } from 'notistack';

// used for closing snackbar

function SnackbarCloseButton({ snackbarKey }) {
    const { closeSnackbar } = useSnackbar();

    return (
        <IconButton onClick={() => closeSnackbar(snackbarKey)}>
            <CloseIcon />
        </IconButton>
    );
}

export default SnackbarCloseButton;