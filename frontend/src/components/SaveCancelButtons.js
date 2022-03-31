import React from 'react';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import CircularProgress from '@mui/material/CircularProgress';
import { green } from '@mui/material/colors';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';

const PREFIX = 'SaveButton';

const classes = {
    root: `${PREFIX}-root`,
    wrapper: `${PREFIX}-wrapper`,
    buttonSuccess: `${PREFIX}-buttonSuccess`,
    buttonProgress: `${PREFIX}-buttonProgress`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`&.${classes.root}`]: {
		display: 'flex',
		alignItems: 'center',
	},

    [`& .${classes.wrapper}`]: {
		margin: theme.spacing(0.5),
		position: 'relative',
		'& > *': {
			marginRight: theme.spacing(1)
		}
	},

    [`& .${classes.buttonSuccess}`]: {
		backgroundColor: green[500],
		'&:hover': {
			backgroundColor: green[700],
		},
	},

    [`& .${classes.buttonProgress}`]: {
		color: green[500],
		position: 'absolute',
		top: '50%',
		left: '25%',
		marginTop: -12,
		marginLeft: -12,
	}
}));

const SaveButton = (props) => {

	const [loading, setLoading] = React.useState(false);
	const [success, setSuccess] = React.useState(false);
	const timer = React.useRef();
	const { onSave, saveDisabled, onCancel } = props; 

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
				await onSave();
				setSuccess(true);
				setLoading(false);
			} catch (error) {
				setSuccess(false);
				setLoading(false);
			}
		}
	};


	return (
        <Root className={classes.root}>
			<div className={classes.wrapper}>
				<Button
					variant="contained"
					color="primary"
					className={buttonClassname}
					disabled={loading || saveDisabled}
					onClick={handleButtonClick}
					startIcon={<SaveIcon />}
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
				{loading && <CircularProgress size={24} className={classes.buttonProgress} />}
			</div>
		</Root>
    );
};

export default SaveButton;
