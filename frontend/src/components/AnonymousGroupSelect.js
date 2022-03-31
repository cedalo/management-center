import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { connect } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputBase from '@mui/material/InputBase';

// import {
// 	colors,
//   } from '@mui/material';

import { WebSocketContext } from '../websockets/WebSocket';

const PREFIX = 'AnonymousGroupSelect';

const classes = {
    root: `${PREFIX}-root`,
    root2: `${PREFIX}-root2`,
    label: `${PREFIX}-label`,
    formControl: `${PREFIX}-formControl`
};

const StyledFormControl = styled(FormControl)((
    {
        theme
    }
) => ({
    [`& .${classes.root2}`]: {
		backgroundColor: 'rgba(255,255,255,0.2)',
		border: 'thin solid rgba(255,255,255,0.5)'
	},

    [`& .${classes.label}`]: {
		fontSize: '12px',
		textTransform: 'uppercase',
		transform: 'translate(14px, 20px) scale(1)'
	},

    [`&.${classes.formControl}`]: {
		// margin: theme.spacing(1),
		// height: "25px",
		margin: theme.spacing(1),
		minWidth: 200
		// color: colors.white,
	}
}));

const CustomInput = InputBase;

const AnonymousGroupSelect = ({ anonymousGroup, groups = [], onUpdateAnonymousGroup }) => {


	const groupSuggestions = groups
		.map((group) => group.groupname)
		.sort()
		.map((groupname) => ({
			label: groupname,
			value: groupname
		}));

	return (
        <StyledFormControl id="anonymous-group-select" variant="outlined" className={classes.formControl}>
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
            </StyledFormControl>
    );
};

const mapStateToProps = (state) => {
	return {
		anonymousGroup: state.groups?.anonymousGroup,
		groups: state.groups?.groups,
	};
};

export default connect(mapStateToProps)(AnonymousGroupSelect);
