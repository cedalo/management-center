import React from 'react';

export default [
	{
		selector: '[data-tour="step-nav-bar-home"]',
		content: () => (
			<div style={{fontSize: '10pt'}}>
				<p>
					This is a Streamsheets App. On the first glimpse, it looks very much like a regular spreadsheet page,
					but have a  closer look, there are some additions, which allow for the static spreadsheet
					character to transform into a dynamic Streamsheet.
				</p>
			</div>
		),
	},
	{
		selector: '[data-tour="page-status"]',
		content: () => (
			<div style={{fontSize: '10pt'}}>
				<p>
					This is a Streamsheets App. On the first glimpse, it looks very much like a regular spreadsheet page,
					but have a  closer look, there are some additions, which allow for the static spreadsheet
					character to transform into a dynamic Streamsheet.
				</p>
			</div>
		),
	},
];
