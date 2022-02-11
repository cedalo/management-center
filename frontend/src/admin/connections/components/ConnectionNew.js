import React, { useContext, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import ConnectionNewComponent from '../../../components/ConnectionNewComponent';

const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
			margin: theme.spacing(1)
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
			width: '75ch'
		}
	},
	margin: {
		margin: theme.spacing(2)
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const ConnectionNew = (props) => {
	const { connections } = props;
	const classes = useStyles();

	const [id, setId] = useState('');

	const connectionExists = connections?.find((searchConnection) => {
		return searchConnection.id === id;
	});

	const validate = () => {
		const valid = !connectionExists && id !== '';
		return valid;
	};

	const { enqueueSnackbar } = useSnackbar();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { client } = context;

	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/config">
					Config
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Connections
				</Typography>
			</Breadcrumbs>
			<br />
			<ConnectionNewComponent />
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		connections: state.brokerConnections?.brokerConnections
	};
};

export default connect(mapStateToProps)(ConnectionNew);
