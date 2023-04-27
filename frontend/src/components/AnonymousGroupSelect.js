import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import InputBase from '@material-ui/core/InputBase';


const AnonymousGroupSelect = ({ anonymousGroup, groupsAll = [], onUpdateAnonymousGroup }) => {
	const groupSuggestions = groupsAll
		.sort()
		.map((groupname) => ({
			label: groupname,
			value: groupname
		}));

	return <FormControl
		style={{
			position: 'absolute',
			top: '67px',
			right: '10px',
			width: '200px'
		}}
		id="anonymous-group-select"
		variant="outlined"
	>
			<TextField
				label="Anonymous Group"
				variant="outlined"
				select
				size="small"
				placeholder="Select Anonymous Group"
				options={groupSuggestions}
				value={anonymousGroup?.groupname || ''}
				onChange={(event) => {
					onUpdateAnonymousGroup(event.target.value);
				}}
			>
				{
					groupSuggestions.map(group =>
						<MenuItem key={group.value} value={group.value} primaryText={group.label}>{group.label}</MenuItem>
					)
				}
			</TextField>
		</FormControl>
};

const mapStateToProps = (state) => {
	return {
		anonymousGroup: state.groups?.anonymousGroup,
		groupsAll: state.groups?.groupsAll?.groups
	};
};

export default connect(mapStateToProps)(AnonymousGroupSelect);
