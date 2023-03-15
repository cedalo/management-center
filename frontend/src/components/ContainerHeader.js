import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import React from 'react';


export default function ConnectionHeader(props) {
	const small = useMediaQuery(theme => theme.breakpoints.down('xs'));
	const medium = useMediaQuery(theme => theme.breakpoints.between('sm', 'sm'));

	return (
		<div style={{marginBottom: '20px'}}>
			<Typography style={{marginTop: `${props.topMargin || '10px'}`, marginBottom: '5px'}} variant="h6">
				{props.title}
			</Typography>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
				{small ? null :
				<Typography style={{fontSize: '10pt'}}>
					{props.subTitle}
				</Typography>}
				{props.children ?
					<div
						style={{
							marginLeft: small ? undefined : '15px',
							minWidth: `${props.buttonsWidth || '160px'}`,
							display: 'flex',
							justifyContent: small ? undefined : 'flex-end'
						}}
					>
						{props.children}
					</div> : null
				}
			</div>
		</div>
	);
};

