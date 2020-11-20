import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';

// import {
// 	colors,
//   } from '@material-ui/core';

import { WebSocketContext } from '../websockets/WebSocket';

const CustomInput = withStyles((theme) => ({
	root: {
		'label + &': {
			marginTop: theme.spacing(1)
		}
	}
}))(InputBase);

const useStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: 'rgba(255,255,255,0.2)',
		border: 'thin solid rgba(255,255,255,0.5)'
	},
	label: {
		fontSize: '12px',
		textTransform: 'uppercase',
		transform: 'translate(14px, 20px) scale(1)'
	},
	formControl: {
		// margin: theme.spacing(1),
		// height: "25px",
		margin: theme.spacing(1),
		minWidth: 200
		// color: colors.white,
	}
}));

const AnonymousGroupSelect = ({ anonymousGroup, groups = [], onUpdateAnonymousGroup }) => {
	const classes = useStyles();

	const groupSuggestions = groups
		.map((group) => group.groupname)
		.sort()
		.map((groupname) => ({
			label: groupname,
			value: groupname
		}));

	return <FormControl id="anonymous-group-select" variant="outlined" className={classes.formControl}>
			<InputLabel
				id="anonymous-group-label"
				classes={{
					root: classes.label
				}}
			>
				Anonymous group
			</InputLabel>
			<Select
				label="Anonymous group"
				classes={classes}
				classes={{
					root: classes.select
				}}
				placeholder="Select anonymous group"
				options={groupSuggestions}
				value={anonymousGroup?.groupname || ''}
				onChange={(event) => {
					onUpdateAnonymousGroup(event.target.value);
				}}
			>
				{
					groupSuggestions.map(group => 
						<MenuItem value={group.value} primaryText={group.label}>{group.label}</MenuItem>
					)
				}
			</Select>
		</FormControl>
};

const mapStateToProps = (state) => {
	return {
		anonymousGroup: state.groups?.anonymousGroup,
		groups: state.groups?.groups,
	};
};

export default connect(mapStateToProps)(AnonymousGroupSelect);
