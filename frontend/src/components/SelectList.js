import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import Typography from '@material-ui/core/Typography';
import React, {useState} from 'react';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';


const checkedIcon = <CheckBoxIcon fontSize="small" />;
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;

const useStyles = makeStyles((theme) =>
	createStyles({
		disabled: {
			color: theme.palette.text.disabled
		}
	})
);
export default function SelectList({values, onChange, disabled, suggestions, getValue, getLabel, variant, label, className}) {
	const [inputValueClients, setInputValueClients] = useState('');
	const classes = useStyles();

	return (
		<Autocomplete
			multiple
			size="small"
			disabled={disabled}
			limitTags={3}
			ChipProps={{ color: 'primary' }}
			options={suggestions}
			className={className}
			disableCloseOnSelect
			getOptionLabel={(option) => (option ? option.label : '')}
			getOptionSelected={(option, value) =>
				option.value === value.value && values.find((val) => value.value === getValue(val))
			}
			value={values.map((value) => ({
				label: getLabel ? getLabel(value) : getValue(value),
				value: getValue(value)
			}))}
			onChange={(ev, selection, ...args) => {
				selection = selection.filter((option) => !option.disabled)
				onChange(ev, selection, ...args);
			}}
			inputValue={inputValueClients}
			onInputChange={(event, newInputValue, reason) => {
				if (reason !== 'reset') {
					setInputValueClients(newInputValue);
				}
			}}
			renderOption={(option, { selected }) => (
				<React.Fragment>
					<Checkbox
						icon={icon}
						color="primary"
						checkedIcon={checkedIcon}
						style={{ marginRight: 8, padding: '2px' }}
						checked={!!values.find((value) => option.value === getValue(value))}
						disabled={option.disabled}
					/>
					<Typography className={option.disabled ? classes.disabled : ''}>{option.label}</Typography>
				</React.Fragment>
			)}
			renderInput={(params) => (
				<TextField
					{...params}
					variant={variant || 'standard'}
					label={label}
					margin={variant ? 'normal' : 'none'}
					size="small"
					placeholder=""
				/>
			)}
		/>
	);
};

