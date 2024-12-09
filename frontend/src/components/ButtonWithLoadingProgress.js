import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
    },
    wrapper: {
        margin: theme.spacing(0.5),
        position: 'relative',
        '& > *': {
            marginRight: theme.spacing(1),
        },
    },
    buttonSuccess: {
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700],
        },
    },
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '25%',
        marginTop: -12,
        marginLeft: -12,
    },
}));

const ButtonWithLoadingProgress = (props) => {
    const classes = useStyles();
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const timer = React.useRef();
    const { onClick, saveDisabled, buttonText } = props;

    const buttonClassname = clsx({
        [classes.buttonSuccess]: success,
    });

    React.useEffect(() => {
        return () => {
            clearTimeout(timer.current);
        };
    }, []);

    const handleButtonClick = async () => {
        if (!loading) {
            setSuccess(false);
            setLoading(true);
            try {
                await onClick();
                setSuccess(true);
                setLoading(false);
            } catch (error) {
                setSuccess(false);
                setLoading(false);
            }
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.wrapper}>
                <Button
                    variant="contained"
                    color="primary"
                    className={buttonClassname}
                    disabled={loading || saveDisabled}
                    onClick={handleButtonClick}
                    startIcon={<SaveIcon />}
                >
                    {buttonText}
                </Button>
                {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
        </div>
    );
};

export default ButtonWithLoadingProgress;
