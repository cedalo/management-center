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
import TextField from '@material-ui/core/TextField';
import { connect } from 'react-redux';
import ConnectionNewComponent from '../../../components/ConnectionNewComponent';

const useStyles = makeStyles((theme) => ({
	form: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	textField: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
	},
	select: {
		fontSize: '14px',
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: '100%',
	  },
}));

const clusterDoesNotContainNode = (brokerConnection, cluster) => {
	const result = cluster?.nodes?.find((node) => node.id === brokerConnection.id);
	return result ? false : true;
}

const SelectNodeComponent = ({ brokerConnections, cluster, handleSelectNode, defaultNode = {} }) => {

	const classes = useStyles();

	const availableBrokerConnections = brokerConnections?.filter((brokerConnection) => clusterDoesNotContainNode(brokerConnection, cluster))
		.filter((brokerConnection) => brokerConnection.status ? brokerConnection.status.connected : false) || [];

	const handleSelectBroker = (broker) => {
		defaultNode.broker = broker;
	}

	return (
		<Grid container spacing={1} alignItems="flex-end">
			<Grid item xs={2} sm={2} align="center">
				<TextField
					type="number"
					required={true}
					id="node-id"
					label="Node ID"
					onChange={(event) => defaultNode.nodeId = event.target.value}
					defaultValue={defaultNode.nodeId}
					variant="outlined"
					fullWidth
					className={classes.textField}
				/>
			</Grid>
			<Grid item xs={10} sm={4} align="center">
				<TextField
					required={true}
					id="private-ip-address"
					label="Private IP address"
					onChange={(event) => defaultNode.address = event.target.value}
					defaultValue={defaultNode.address}
					variant="outlined"
					fullWidth
					className={classes.textField}
				/>
			</Grid>
			<Grid item xs={12} sm={6} align="center">
				<FormControl variant="outlined" className={classes.formControl}>
					<InputLabel htmlFor="broker">Broker</InputLabel>
					<Select
						autoFocus
						defaultValue=""
						placeholder='Please select an instance'
						value={defaultNode.broker}
						onChange={(event) => handleSelectBroker(event.target.value)}
						label="Instance"
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
		</Grid>
	);
};

const mapStateToProps = (state) => {
	return {
		brokerConnections: state.brokerConnections?.brokerConnections,
	};
};

export default connect(mapStateToProps)(SelectNodeComponent);