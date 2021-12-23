import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { connect } from 'react-redux';
import ConnectionNewComponent from '../../../components/ConnectionNewComponent';

const useStyles = makeStyles((theme) => ({
	formControl: {
	  margin: theme.spacing(1),
	  minWidth: 120,
	},
	select: {
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
	handleSelectBroker, 
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
				<Grid container spacing={24} justify="center" style={{ maxWidth: '100%' }}>
					<Grid item xs={12} align="center">
						<DialogContentText id="alert-dialog-description">
							Please create a connection first.
						</DialogContentText>
						<ConnectionNewComponent />
					</Grid>
				</Grid>
			</DialogContent>
		</>
	} else {
		return <>
			<DialogTitle align="center" id="add-node-dialog-title">
				Select the broker to add as node
			</DialogTitle>
			<DialogContent>
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
			</DialogContent>
			<DialogActions>
				<Button
					onClick={() => handleAddNode(selectedBroker)}>
					Add node
				</Button>
			</DialogActions>
		</>
	} 
}
const SelectNodeDialog = ({ brokerConnections, cluster, open, handleClose, handleAddNode }) => {
	const classes = useStyles();
	const [selectedBroker, setSelectedBroker] = React.useState('');

	const handleSelectBroker = (broker) => {
		setSelectedBroker(broker);
	}

	return (
		<Dialog
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
					selectedBroker, 
					classes, 
					handleClose
				})
			}
		</Dialog>
	);
};

const mapStateToProps = (state) => {
	return {
		brokerConnections: state.brokerConnections?.brokerConnections,
	};
};

export default connect(mapStateToProps)(SelectNodeDialog);
