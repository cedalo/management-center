import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { connect } from 'react-redux';
import { trimString } from '../../../utils/utils';


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

const validNodeIdRange = (nodeId) => {
	return nodeId >= 1 && nodeId <= 1023;
};

const SelectNodeComponent = ({ brokerConnections, cluster, handleSelectNode, defaultNode = {}, setNode, checkAllNodeIds }) => {

	const classes = useStyles();
	const [validNodeId, setValidNodeId] = useState(true);

	const availableBrokerConnections = brokerConnections?.filter((brokerConnection) => clusterDoesNotContainNode(brokerConnection, cluster))
		.filter((brokerConnection) => brokerConnection.status ? brokerConnection.status.connected : false) || [];

	const handleSelectBroker = (broker) => {
		setNode({...defaultNode, broker});
	}

	useEffect(() => {
		setValidNodeId(checkAllNodeIds()); // check nodeids after setting. This checks their uniqueness
	}, [defaultNode]);

	return (
		<Grid container spacing={1} alignItems="flex-end">
			<Grid item xs={2} sm={2} align="center">
				<TextField
					type="number"
					required={true}
					id="node-id"
					size="small"
					label="Node ID"
					InputProps={{ inputProps: { min: 1, max: 1023 } }}
					onChange={(event) => {
						const nodeId = parseInt(event.target.value);
						const valid = validNodeIdRange(nodeId);
						setValidNodeId(valid);
						if (valid) {
							setNode({...defaultNode, nodeId: parseInt(event.target.value)});
						}
					}}
					error={!validNodeId}
					helperText={!validNodeId && 'Node ID must be a unique number from 1 to 1023.'}
					defaultValue={defaultNode.nodeId}
					variant="outlined"
					fullWidth
					className={classes.textField}
				/>
			</Grid>
			<Grid item xs={10} sm={4} align="center">
				<TextField
					required={true}
					size="small"
					id="private-ip-address"
					label="Private IP address"
					onChange={(event) => setNode({...defaultNode, address: trimString(event.target.value)})}
					defaultValue={defaultNode.address}
					variant="outlined"
					fullWidth
					className={classes.textField}
				/>
			</Grid>
			<Grid item xs={12} sm={6} align="center">
					<TextField
						select
						label="Broker"
						size="small"
						variant="outlined"
						defaultValue=""
						fullWidth
						placeholder='Please select an instance'
						value={defaultNode.broker}
						onChange={(event) => handleSelectBroker(event.target.value)}
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
					</TextField>
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
