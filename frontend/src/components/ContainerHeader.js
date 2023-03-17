import CircularProgress from '@material-ui/core/CircularProgress';
import {useTheme} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {Alert, AlertTitle} from '@material-ui/lab';
import React from 'react';
import ConnectedWarning from './ConnectedWarning';


export default function ConnectionHeader(props) {
	const small = useMediaQuery(theme => theme.breakpoints.down('xs'));
	const theme = useTheme();

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
							minWidth: `${props.buttonsWidth || '180px'}`,
							display: 'flex',
							justifyContent: small ? undefined : 'flex-end'
						}}
					>
						{props.children}
					</div> : null
				}
			</div>
			{props.connectedWarning ? <ConnectedWarning connected={false} /> : null}
			{props.brokerFeatureWarning ?
				<Alert severity="warning"  style={{height: 'fit-content', marginTop: '15px'}}>
					<AlertTitle>Feature not available</AlertTitle>
					Make sure that the broker connected has {props.brokerFeatureWarning} enabled.
				</Alert> : null
			}
			{props.featureWarning ?
				<Alert severity="warning"  style={{height: 'fit-content', marginTop: '15px'}}>
					<AlertTitle>Premium feature</AlertTitle>
					{props.featureWarning} are a premium feature. For more information visit <a style={{color: theme.palette.primary.main}} href="https://www.cedalo.com">cedalo.com</a> or
					contact us at <a style={{color: theme.palette.primary.main}} href="mailto:info@cedalo.com">info@cedalo.com</a>.
				</Alert> : null
			}
			{props.warnings && props.warnings()?.map(warning => (
				<Alert severity={warning.severity} style={{height: 'fit-content', marginTop: '15px'}}>
					<AlertTitle>{warning.title}</AlertTitle>
					{warning.error}
				</Alert>))
			}
		</div>
	);
};

