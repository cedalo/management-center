import React from 'react';
import { Alert, AlertTitle } from '@material-ui/lab';

const AlertHint = ({ message, severity, title }) => (
	<>
		<div style={{ padding: '10px' }}></div>
		<Alert severity={severity} style={{ textAlign: 'left' }}>
			<AlertTitle>{title}</AlertTitle>
			{message}
		</Alert>
	</>
);

export const WarningHint = (props) => AlertHint({ ...props, severity: 'warning' });
// CERT: more to come
// export const ErrorHint
// export const InfoHint
