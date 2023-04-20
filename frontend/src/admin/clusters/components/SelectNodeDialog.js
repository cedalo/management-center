import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux';
import ConnectionNewComponent from '../../../components/ConnectionNewComponent';
import SelectNodeComponent from './SelectNodeComponent';
import {
	getNodeIdsUniqueValidator,
    getPrivateAddressesPresentValidator,
    getBrokersPresentValidator
} from '../validators';


const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
			margin: theme.spacing(1)
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
			width: '100em'
		}
	},
	form: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	textField: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
	},
	margin: {
		margin: theme.spacing(2)
	},
	formControl: {
	  margin: theme.spacing(1),
	  minWidth: 120,
	},
	select: {
		fontSize: '14px',
	}
}));

const getDialogContent = ({
	brokerConnections, 
	cluster,
	node, 
	setNode,
	handleAddNode, 
	handleClose
}) => {
	const areNodeIdsUnique = getNodeIdsUniqueValidator([...cluster.nodes, node]);
	const arePrivateAddressesPresent = getPrivateAddressesPresentValidator([...cluster.nodes, node]);
	const areBrokersPresent = getBrokersPresentValidator([...cluster.nodes, node]);

	const validate = () => {
		const valid = arePrivateAddressesPresent()
					&& areBrokersPresent()
					&& areNodeIdsUnique(); 
		return valid;
	};

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
		</>
	} else {
		return <>
			<DialogTitle align="center" id="add-node-dialog-title">
				Select the broker to add as node
			</DialogTitle>
			<DialogContent>
				<Grid container spacing={24} justifyContent="center" style={{ maxWidth: '100%' }}>
					<SelectNodeComponent
						defaultNode={node}
						cluster={cluster}
						setNode={setNode}
						checkAllNodeIds={areNodeIdsUnique}
					/>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button
					disabled={!validate()}
					onClick={() => handleAddNode(node)}>
					Add node
				</Button>
			</DialogActions>
		</>
	} 
}
const SelectNodeDialog = ({ brokerConnections, cluster, open, handleClose, handleAddNode }) => {
	const classes = useStyles();
	const [node, setNode] = React.useState({
		nodeid: (cluster && cluster.nodes && cluster.nodes[cluster.nodes.length - 1].nodeid + 1) || undefined, // last cluster nodes' id + 1
		port: 7000
	});

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
					node,
					setNode,
					handleAddNode, 
					classes, 
					handleClose,
					cluster
				})
			}
		</Dialog>
	);
};

const mapStateToProps = (state) => {
	return {
		brokerConnections: state.brokerConnections?.brokerConnections,
		cluster: state.clusters?.cluster,
	};
};

export default connect(mapStateToProps)(SelectNodeDialog);
