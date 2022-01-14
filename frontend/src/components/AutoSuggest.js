import { emphasize, makeStyles, useTheme } from '@material-ui/core/styles';

import CancelIcon from '@material-ui/icons/Cancel';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import NoSsr from '@material-ui/core/NoSsr';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
		minWidth: 250
	},
	input: {
		display: 'flex',
		padding: 0,
		height: 'auto'
	},
	valueContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		flex: 1,
		alignItems: 'center',
		overflow: 'hidden',
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
	chip: {
		margin: theme.spacing(1, 1)
	},
	chipFocused: {
		backgroundColor: emphasize(
			theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
			0.08
		)
	},
	noOptionsMessage: {
		padding: theme.spacing(1, 2)
	},
	singleValue: {
		fontSize: 14
	},
	placeholder: {
		position: 'absolute',
		left: 2,
		bottom: 6,
		fontSize: 14
	},
	paper: {
		position: 'absolute',
		zIndex: 1,
		marginTop: theme.spacing(1),
		left: 0,
		right: 0
	},
	divider: {
		height: theme.spacing(1)
	}
}));

function NoOptionsMessage(props) {
	return (
		<Typography color="textSecondary" className={props.selectProps.classes.noOptionsMessage} {...props.innerProps}>
			{props.children}
		</Typography>
	);
}

NoOptionsMessage.propTypes = {
	children: PropTypes.node,
	innerProps: PropTypes.object.isRequired,
	selectProps: PropTypes.object.isRequired
};

function inputComponent({ inputRef, ...props }) {
	return <div ref={inputRef} {...props} />;
}

inputComponent.propTypes = {
	inputRef: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.shape({
			current: PropTypes.any.isRequired
		})
	])
};

function Control(props) {
	const {
		children,
		innerProps,
		innerRef,
		selectProps: { classes, TextFieldProps }
	} = props;

	return (
		<TextField
			fullWidth
			InputProps={{
				inputComponent,
				inputProps: {
					className: classes.input,
					ref: innerRef,
					children,
					...innerProps
				}
			}}
			{...TextFieldProps}
		/>
	);
}

Control.propTypes = {
	children: PropTypes.node,
	innerProps: PropTypes.shape({
		onMouseDown: PropTypes.func.isRequired
	}).isRequired,
	innerRef: PropTypes.oneOfType([
		PropTypes.oneOf([null]),
		PropTypes.func,
		PropTypes.shape({
			current: PropTypes.any.isRequired
		})
	]).isRequired,
	selectProps: PropTypes.object.isRequired
};

function Option(props) {
	return (
		<MenuItem
			ref={props.innerRef}
			selected={props.isFocused}
			component="div"
			style={{
				fontWeight: props.isSelected ? 500 : 400
			}}
			{...props.innerProps}
		>
			{props.children}
		</MenuItem>
	);
}

Option.propTypes = {
	children: PropTypes.node,
	innerProps: PropTypes.shape({
		id: PropTypes.string.isRequired,
		key: PropTypes.string.isRequired,
		onClick: PropTypes.func.isRequired,
		onMouseMove: PropTypes.func.isRequired,
		onMouseOver: PropTypes.func.isRequired,
		tabIndex: PropTypes.number.isRequired
	}).isRequired,
	innerRef: PropTypes.oneOfType([
		PropTypes.oneOf([null]),
		PropTypes.func,
		PropTypes.shape({
			current: PropTypes.any.isRequired
		})
	]).isRequired,
	isFocused: PropTypes.bool.isRequired,
	isSelected: PropTypes.bool.isRequired
};

function Placeholder(props) {
	const { selectProps, innerProps = {}, children } = props;
	return (
		<Typography color="textSecondary" className={selectProps.classes.placeholder} {...innerProps}>
			{children}
		</Typography>
	);
}

Placeholder.propTypes = {
	children: PropTypes.node,
	innerProps: PropTypes.object,
	selectProps: PropTypes.object.isRequired
};

function SingleValue(props) {
	return (
		<Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
			{props.children}
		</Typography>
	);
}

SingleValue.propTypes = {
	children: PropTypes.node,
	innerProps: PropTypes.any.isRequired,
	selectProps: PropTypes.object.isRequired
};

function ValueContainer(props) {
	return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

ValueContainer.propTypes = {
	children: PropTypes.node,
	selectProps: PropTypes.object.isRequired
};

function MultiValue(props) {
	return (
		// <Chip
		//   tabIndex={-1}
		//   label={props.children}
		//   className={clsx(props.selectProps.classes.chip, {
		//     [props.selectProps.classes.chipFocused]: props.isFocused,
		//   })}
		//   onDelete={props.removeProps.onClick}
		//   deleteIcon={<CancelIcon {...props.removeProps} />}
		// />
		<Chip
			tabIndex={-1}
			size="small"
			// icon={<GroupIcon />}
			label={props.children}
			color="primary"
			onDelete={props.removeProps.onClick}
			deleteIcon={<CancelIcon {...props.removeProps} />}
		/>
	);
}

MultiValue.propTypes = {
	children: PropTypes.node,
	isFocused: PropTypes.bool.isRequired,
	removeProps: PropTypes.shape({
		onClick: PropTypes.func.isRequired,
		onMouseDown: PropTypes.func.isRequired,
		onTouchEnd: PropTypes.func.isRequired
	}).isRequired,
	selectProps: PropTypes.object.isRequired
};

function Menu(props) {
	return (
		<Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
			{props.children}
		</Paper>
	);
}

Menu.propTypes = {
	children: PropTypes.element.isRequired,
	innerProps: PropTypes.object.isRequired,
	selectProps: PropTypes.object.isRequired
};

const components = {
	Control,
	Menu,
	MultiValue,
	NoOptionsMessage,
	Option,
	Placeholder,
	SingleValue,
	ValueContainer
};

export default function AutoSuggest({ disabled, handleDelete, handleChange, suggestions, values, placeholder }) {
	const classes = useStyles();
	const theme = useTheme();

	const selectStyles = {
		input: (base) => ({
			...base,
			color: theme.palette.text.primary,
			'& input': {
				font: 'inherit'
			}
		})
	};

	return (
		<div className={classes.root}>
			<NoSsr>
				<Select
					isDisabled={disabled}
					classes={classes}
					styles={selectStyles}
					inputId="react-select-multiple"
					TextFieldProps={{
						InputLabelProps: {
							htmlFor: 'react-select-multiple',
							shrink: true
						}
					}}
					placeholder={placeholder || 'Select...'}
					options={suggestions}
					components={components}
					value={values}
					onChange={handleChange}
					isMulti
				/>
			</NoSsr>
		</div>
	);
}
