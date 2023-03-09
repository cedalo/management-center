import Typography from '@material-ui/core/Typography';
import React from 'react';


export default function ConnectionHeader(props) {
	// const theme = useTheme();

	return (
		<div style={{marginBottom: '20px'}}>
			<Typography style={{marginTop: `${props.topMargin || '10px'}`, marginBottom: '5px'}} variant="h6">
				{props.title}
			</Typography>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
				<Typography style={{fontSize: '10pt'}}>
					{props.subTitle}
				</Typography>
				{props.children ?
					<div style={{marginLeft: '15px', minWidth: `${props.buttonsWidth || '160px'}`, display: 'flex', justifyContent: 'flex-end'}}>
						{props.children}
					</div> : null
				}
			</div>
		</div>
	);
};

