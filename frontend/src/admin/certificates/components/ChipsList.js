import React from 'react';
import TextField from '@material-ui/core/TextField';
import { Chip, Grid } from '@material-ui/core';


const ChipsGrid = (values) => (
	<Grid container spacing={2}>
		{values.map((broker) => (
			<Grid item>
				<Chip size="small" color="primary" label={broker.label}/>
			</Grid>
		))}
	</Grid>
);

const ChipList = ({ component, values }) => {
	return (
		<TextField
			label="Deployed to"
			variant="outlined"
			component={component}
			placeholder={values && values.length ? '' : 'Not deployed'}
			fullWidth
			InputProps={{
				disabled: true,
				startAdornment: ChipsGrid(values)
			}}
		/>
	);
};

export default ChipList;
