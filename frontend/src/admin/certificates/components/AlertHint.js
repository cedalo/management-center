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

export const InfoHint = ({ title, message }) => AlertHint({ title, message, severity: 'info' });
export const ErrorHint = ({ title, message }) => AlertHint({ title, message, severity: 'error' });
export const WarningHint = ({ title, message }) => AlertHint({ title, message, severity: 'warning' });
