/********************************************************************************
 * Copyright (c) 2020 Cedalo GmbH
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 ********************************************************************************/
// import PropTypes from 'prop-types';
import React from 'react';
import IconSearch from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
import Input from '@material-ui/core/Input';

export default class FilterName extends React.Component {
    render() {
        return (
            <Input
                type="search"
                id="resFilterField"
                value={this.props.filter}
                onChange={(event) => this.props.onUpdateFilter(event.target.value)}
                startAdornment={
                    <InputAdornment position="start">
                        <IconSearch
                            sx={
                                {
                                    // color: (theme) => `${theme.components.MuiAppBar.styleOverrides.colorIcon.backgroundColor})`,
                                }
                            }
                        />
                    </InputAdornment>
                }
                placeholder="Filter"
                // sx={{
                // 	width: '90%',
                // 	color: (theme) => `${theme.components.MuiAppBar.styleOverrides.colorIcon.backgroundColor})`,
                // 	'&.MuiInput-root': {
                // 		'&:hover': {
                // 			borderWidth: '1px',
                // 			borderColor: (theme) =>
                // 				`${theme.components.MuiAppBar.styleOverrides.colorIcon.backgroundColor})`
                // 		},
                // 		'&:hover:not(.Mui-disabled):before': {
                // 			borderColor: (theme) =>
                // 				`${theme.components.MuiAppBar.styleOverrides.colorIcon.backgroundColor})`
                // 		}
                // 	},
                // 	'&.MuiInput-underline:before': {
                // 		// borderColor: (theme) => `${theme.components.MuiAppBar.styleOverrides.colorIcon.backgroundColor})`,
                // 		// borderWidth: '1px',
                // 		border: 'none'
                // 	},
                // 	'&.MuiInput-underline:after': {
                // 		borderWidth: '1px',
                // 		borderColor: (theme) =>
                // 			`${theme.components.MuiAppBar.styleOverrides.colorIcon.backgroundColor})`
                // 	},
                // 	'&.Mui-focused': {
                // 		backgroundColor: (theme) =>
                // 			`${theme.components.MuiAppBar.styleOverrides.colorIcon.backgroundColor}, 0.1)`,
                // 		borderColor: (theme) =>
                // 			`${theme.components.MuiAppBar.styleOverrides.colorIcon.backgroundColor})`
                // 	}
                // }}
            />
        );
    }
}
