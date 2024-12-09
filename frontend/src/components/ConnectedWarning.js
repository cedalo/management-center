import { Alert, AlertTitle } from '@material-ui/lab';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Delayed from '../utils/Delayed';
import { useTheme } from '@material-ui/core/styles';

const ConnectedWarning = ({ connected }) => {
    const theme = useTheme();

    if (connected) {
        return null;
    }

    return (
        <Delayed waitBeforeShow={1000}>
            <Alert severity="warning" style={{ height: 'fit-content', marginTop: '15px' }}>
                <AlertTitle>System information not accessible!</AlertTitle>
                The selected broker connection is not active. Please connect the current broker in the
                <RouterLink to="/connections" style={{ margin: '0px 4px', color: theme.palette.primary.main }}>
                    Connections List
                </RouterLink>
                or select a connected broker from the connection selection on the title bar.
            </Alert>
        </Delayed>
    );
};

export default ConnectedWarning;
