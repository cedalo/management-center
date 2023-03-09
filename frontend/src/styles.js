import {makeStyles} from '@material-ui/core/styles';

export const useFormStyles = makeStyles((theme) => ({
	textField: {
		maxWidth: '50ch',
	},
	autoComplete: {
		maxWidth: '75ch',
	},
	buttonTop: {
		marginTop: '15px',
	},
	buttonTopRight: {
		marginTop: '15px',
		marginRight: '15px',
	}
}));

