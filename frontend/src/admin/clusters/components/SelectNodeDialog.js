import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { connect } from 'react-redux';
import ConnectionNewComponent from '../../../components/ConnectionNewComponent';

const PREFIX = 'SelectNodeDialog';

const classes = {
    root: `${PREFIX}-root`,
    form: `${PREFIX}-form`,
    textField: `${PREFIX}-textField`,
    margin: `${PREFIX}-margin`,
    formControl: `${PREFIX}-formControl`,
    select: `${PREFIX}-select`
};

const StyledDialog = styled(Dialog)((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
		'& > *': {
			margin: theme.spacing(1)
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
			width: '75ch'
		}
	},

    [`& .${classes.form}`]: {
		display: 'flex',
		flexWrap: 'wrap'
	},

    [`& .${classes.textField}`]: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
	},

    [`& .${classes.margin}`]: {
		margin: theme.spacing(2)
	},

    [`& .${classes.formControl}`]: {
	  margin: theme.spacing(1),
	  minWidth: 120,
	},

    [`& .${classes.select}`]: {
		fontSize: '14px',
	}
}));

const clusterDoesNotContainNode = (brokerConnection, cluster) => {
	const result = cluster?.nodes?.find((node) => node.id === brokerConnection.id);
	return result ? false : true;
}

const getDialogContent = ({
	brokerConnections, 
	cluster, 
	handleAddNode, 
	privateIPAddress,
	handleSelectBroker, 
	setPrivateIPAddress,
	selectedBroker, 
	classes, 
	handleClose
}) => {

	const availableBrokerConnections = brokerConnections.filter((brokerConnection) => clusterDoesNotContainNode(brokerConnection, cluster));

	if (!selectedBroker && availableBrokerConnections[0]) {
		handleSelectBroker(availableBrokerConnections[0].id);
	}

	if (!brokerConnections || brokerConnections.length === 0) {
		return <>
			<DialogTitle align="center" id="not-connected-dialog-title" onClose={handleClose}>
				You have not configured any broker.
			</DialogTitle>
			<DialogContent>
				<Grid container spacing={24} justifyContent="center" style={{ maxWidth: '100%' }}>
					<Grid item xs={12} align="center">
						<DialogContentText id="alert-dialog-description">
							Please create a connection first.
						</DialogContentText>
						<ConnectionNewComponent />
					</Grid>
				</Grid>
			</DialogContent>
		</>;
	} else {
		return <>
			<DialogTitle align="center" id="add-node-dialog-title">
				Select the broker to add as node
			</DialogTitle>
			<DialogContent>
				<Grid container spacing={24} justifyContent="center" style={{ maxWidth: '100%' }}>
					<Grid item xs={12} align="center">
						<FormControl variant="outlined">
							<InputLabel htmlFor="broker">Broker</InputLabel>
							<Select
								autoFocus
								defaultValue={availableBrokerConnections[0]?.id}
								value={selectedBroker}
								onChange={(event) => handleSelectBroker(event.target.value)}
								label="Broker"
							>
								{
									availableBrokerConnections.map(brokerConnection => 
										<MenuItem
											value={brokerConnection.id}
											classes={{
												root: classes.select
											}}
										>
											{`${brokerConnection.name} (${brokerConnection.id})`}
										</MenuItem>
									)
								}
							</Select>
						</FormControl>
					</Grid>
					<br />
					<Grid item xs={12} align="center">
						<TextField
							required={true}
							id="private-ip-address"
							label="Private IP address"
							onChange={(event) => setPrivateIPAddress(event.target.value)}
							defaultValue=""
							variant="outlined"
							fullWidth
							className={classes.textField}
						/>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button
					disabled={privateIPAddress === ''}
					onClick={() => handleAddNode(selectedBroker, privateIPAddress)}>
					Add node
				</Button>
			</DialogActions>
		</>;
	} 
}
const SelectNodeDialog = ({ brokerConnections, cluster, open, handleClose, handleAddNode }) => {

	const [selectedBroker, setSelectedBroker] = React.useState('');
	const [privateIPAddress, setPrivateIPAddress] = React.useState('');

	const handleSelectBroker = (broker) => {
		setSelectedBroker(broker);
	}

	return (
        <StyledDialog
			open={open}
			onClose={handleClose}
			aria-labelledby="add-node-dialog-title"
			aria-describedby="add-node-dialog-description"
		>
			{
				getDialogContent({
					brokerConnections, 
					cluster, 
					handleAddNode, 
					handleSelectBroker, 
					privateIPAddress,
					setPrivateIPAddress,
					selectedBroker, 
					classes, 
					handleClose
				})
			}
		</StyledDialog>
    );
};

const mapStateToProps = (state) => {
	return {
		brokerConnections: state.brokerConnections?.brokerConnections,
	};
};

export default connect(mapStateToProps)(SelectNodeDialog);
