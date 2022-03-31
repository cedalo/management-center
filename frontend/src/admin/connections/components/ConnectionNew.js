import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import ConnectionNewComponent from '../../../components/ConnectionNewComponent';

const PREFIX = 'ConnectionNew';

const classes = {
    root: `${PREFIX}-root`,
    margin: `${PREFIX}-margin`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
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

    [`& .${classes.margin}`]: {
		margin: theme.spacing(2)
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

const ConnectionNew = (props) => {
	const { connections } = props;


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
        <Root>
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
		</Root>
    );
};

const mapStateToProps = (state) => {
	return {
		connections: state.brokerConnections?.brokerConnections
	};
};

export default connect(mapStateToProps)(ConnectionNew);
