import React from 'react';
import Typography from '@material-ui/core/Typography';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles((theme) =>
	createStyles({
		disabled: {
			color: theme.palette.text.disabled
		}
	})
);

// currently only disabled is supported...
const StyledTypography = ({ disabled, text = '' }) => {
	const classes = useStyles();
	return <Typography className={disabled ? classes.disabled : ''}>{text}</Typography>;
};
export default StyledTypography;

// adds disabled class name to children: <Disable disabled={true}><Typography>...</Typography></Disable>
// export const Disable = ({ disabled, children }) => {
// 	const classes = useStyles();
// 	const disabledClassName = disabled ? classes.disabled : '';
// 	return React.Children.map(children, (child) => {
// 		const className = `${child.props.className} ${disabledClassName}`;
// 		const props = { ...child.props, className };
// 		return React.cloneElement(child, props);
// 	})
// };