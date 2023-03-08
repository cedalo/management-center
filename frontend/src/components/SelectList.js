import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import React, {useState} from 'react';

const checkedIcon = <CheckBoxIcon fontSize="small" />;
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;

export default function SelectList({values, onChange, disabled, suggestions, getValue, getLabel, variant, label}) {
	const [inputValueClients, setInputValueClients] = useState('');

	return (
		<Autocomplete
			multiple
			size="small"
			disabled={disabled}
			limitTags={3}
			ChipProps={{ color: "primary" }}
			options={suggestions}
			disableCloseOnSelect
			getOptionLabel={(option) =>
				option ? option.label : ''
			}
			getOptionSelected={(option, value) =>
				values.find(() => option.value === value.value)
			}
			value={values.map((value) => ({
				label: getLabel ? getLabel(value) : getValue(value),
				value: getValue(value)
			}))}
			onChange={onChange}
			inputValue={inputValueClients}
			onInputChange={(event, newInputValue, reason) => {
				if (reason !== 'reset') {
					setInputValueClients(newInputValue);
				}
			}}
			renderOption={(option, { selected }) => (
				<React.Fragment >
					<Checkbox
						icon={icon}
						color="primary"
						checkedIcon={checkedIcon}
						style={{ marginRight: 8, padding: '2px' }}
						checked={values.find((value) => option.value === getValue(value))}
					/>
					{option.label}
				</React.Fragment>
			)}
			renderInput={(params) => (
				<TextField
					{...params} variant={variant || 'standard'} label={label} size="small" placeholder=""
				/>
			)}
		/>);
};

