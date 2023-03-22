/********************************************************************************
 * Copyright (c) 2022 Cedalo GmbH
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0 which accompany this distribution.
 * and Eclipse Distribution License v1.0 which accompany this distribution.
 *
 * The Eclipse Public License is available at
 *   https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 ********************************************************************************/
import React, { useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
	Checkbox,
	InputBase,
	MenuItem,
	Select,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography
} from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import EnabledIcon from '@material-ui/icons/Check';
import DisabledIcon from '@material-ui/icons/Cancel';
import { useSnackbar } from 'notistack';
import SaveCancelButtons from '../../../components/SaveCancelButtons';
import ContainerHeader from '../../../components/ContainerHeader';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { ErrorHint } from './AlertHint';
import ContentContainer from './ContentContainer';
import { getConnectionInfo } from './certutils';

const CustomInput = withStyles((theme) => ({
	root: {
		'label + &': {
			marginTop: theme.spacing(1)
		}
	}
}))(InputBase);

const useStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: '20px',
		backgroundColor: 'rgba(255,255,255,0.2)',
		border: theme.palette.type === 'dark' ? 'thin solid rgba(255,255,255,1)' : 'thin solid rgba(0,0,0,0.5)',
		// color: 'white',
		fontSize: '14px'
	},
	select: {
		fontSize: '14px'
	}
}));

const isLast = (list) => {
	const last = list.length - 1;
	return (index) => index === last;
};

const ListenerSelect = ({ listeners, onSelect }) => {
	const isLastRow = isLast(listeners);
	const rowStyle = (index) => (isLastRow(index) ? { borderBottom: 'none' } : {});

	return (
		<Table size="small" aria-label="listeners">
			<TableHead>
				<TableRow>
					<TableCell padding="checkbox">Deploy</TableCell>
					<TableCell>Protocol</TableCell>
					<TableCell>Port</TableCell>
					<TableCell>Bind Address</TableCell>
					<TableCell>Require Certificate</TableCell>
					<TableCell>TLS</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{listeners.map((listener, index) => (
					<TableRow key={listener.id}>
						<TableCell padding="checkbox" style={rowStyle(index)}>
							<Checkbox
								disabled={!listener.tls || !listener.requireCertificate}
								checked={!!listener.isUsed}
								onChange={onSelect}
								inputProps={{
									'data-listener': `${listener.id}`
								}}
							/>
						</TableCell>
						<TableCell style={rowStyle(index)}>{listener.protocol}</TableCell>
						<TableCell style={rowStyle(index)}>{listener.port}</TableCell>
						<TableCell style={rowStyle(index)}>{listener.bindAddress || 'not configured'}</TableCell>
						<TableCell style={rowStyle(index)}>
							{listener.requireCertificate ? (
								<EnabledIcon fontSize="small" style={{ color: green[500] }} />
							) : (
								<DisabledIcon fontSize="small" style={{ color: red[500] }} />
							)}
						</TableCell>
						<TableCell style={rowStyle(index)}>
							{listener.tls ? (
								<EnabledIcon fontSize="small" style={{ color: green[500] }} />
							) : (
								<DisabledIcon fontSize="small" style={{ color: red[500] }} />
							)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
const getListenersCell = (listeners, onSelect) => {
	if (listeners == null || !listeners.length) {
		const text = listeners ? 'No listeners available for selected connection...' : 'Loading available listeners...';
		return (
			<Typography variant="h8" gutterBottom component="div">
				{text}
			</Typography>
		);
	}
	return <ListenerSelect listeners={listeners} onSelect={onSelect} />;
};

const byName = (a, b) => {
	if (a.name < b.name) return -1;
	return a.name > b.name ? 1 : 0;
};
const ConnectionSelect = ({ connections, selected = {}, onSelect }) => {
	const classes = useStyles();
	return (
		<Select
			labelId="connection-select"
			id="connection"
			value={selected.id}
			onChange={onSelect}
			label="Connection"
			classes={{
				root: classes.root,
				icon: classes.icon
			}}
			input={<CustomInput />}
		>
			{connections.sort(byName).map((conn) => (
				<MenuItem
					key={conn.name}
					value={conn.id}
					disabled={!conn.status?.connected}
					classes={{ root: classes.select }}
				>
					{conn.name}
				</MenuItem>
			))}
		</Select>
	);
};


const listenerKey = ({ bindAddress, host, port }) => `${host}:${port}:${bindAddress || ''}`;
const markUsedListeners = (certificate, connection, listeners) => {
	const {usedBy} = certificate;
	const usedListeners = usedBy[connection.id] || [];
	const usedListenerKeys = usedListeners.map(listenerKey);
	return listeners.map((listener) => {
		const isUsed = usedListenerKeys.includes(listenerKey(listener));
		return { ...listener, isUsed };
	});
};
const portMessage = (listeners) => {
	const prefix = listeners.length > 1 ? 'ports' : 'port';
	return `${prefix}: ${listeners.map((l) => l.port).join(', ')}`;
};
const successMessage = (cert, deployed, undeployed) => {
	// success means at least one of (un)deployed must be > 0
	const msgDeployed = deployed.length > 0 ? `deployed to ${portMessage(deployed)}` : '';
	const msgUndeployed = undeployed.length > 0 ? `undeployed from ${portMessage(undeployed)}` : '';
	const and = msgDeployed && msgUndeployed ? ' and ' : '';
	return `Certificate "${cert.name}" successfully ${msgDeployed}${and}${msgUndeployed}.`;
};
const deployMessage = (cert, { deployed = 0, undeployed = 0 } = {}) => ({
	error: `'Failed to deploy certificate "${cert.name}"`,
	success: successMessage(cert, deployed, undeployed),
	warning: `Problems while deploying certificate "${cert.name}"!`
});

const isConnected = (conn) => conn?.status?.connected;

const fetchListeners = async (client, connId) => {
	try {
		const { data } = await client.getListeners(connId);
		return { id: connId, listeners: data };
	} catch (error) {
		return { id: connId, listeners: [], error: error.message || error };
	}
};

const CertificateDeploy = ({ connections = [] }) => {
	const history = useHistory();
	const [certificate] = useState(history.location.state);
	const { enqueueSnackbar } = useSnackbar();
	const [canUpdate, setCanUpdate] = useState(false);
	const [connection, selectConnection] = useState(connections.find(isConnected) || connections[0]);
	const [listeners, setListeners] = useState(null);
	const { client } = useContext(WebSocketContext);
	const hasConnectedConnection = connections.some(isConnected);
	const connectionRef = useRef(connection);

	const loadListeners = async () => {
		setListeners(null);
		if (isConnected(connection)) {
			const { id, error, listeners } = await fetchListeners(client, connection.id);
			// check response against current selected connection and ignore if they do not match
			if (connectionRef.current?.id === id) {
				if (error) {
					enqueueSnackbar(`Cannot deploy because listeners could not be loaded. Reason: ${error}`, {
						variant: 'error'
					});
				}
				setListeners(markUsedListeners(certificate, getConnectionInfo(connection), listeners));
			}
		} else {
			const name = connection?.name || 'n.a.';
			if (listeners != null) enqueueSnackbar(`Connection "${name}" is not connected`, { variant: 'warning' });
			setListeners([]);
		}
	};
	useEffect(() => {
		loadListeners();
	}, [connection]);

	const onCancel = () => {
		history.goBack();
	};

	const onSelectConnection = (event) => {
		const id = event.target.value;
		const connection = connections.find((c) => c.id === id);
		connectionRef.current = connection;
		selectConnection(connection);
		setCanUpdate(false);
	};

	const showSnackAndReload = (message, variant) => {
		enqueueSnackbar(message, { variant });
		loadListeners();
		setCanUpdate(false);
	};

	const onDeploy = async () => {
		const selectedListeners = listeners.filter((listener) => listener.isUsed);
		try {
			const { status, data = {} } = await client.deployCertificate(certificate, connection, selectedListeners);
			switch (status) {
				case 200:
					enqueueSnackbar(deployMessage(certificate, data).success, { variant: 'success' });
					setCanUpdate(false);
					break;
				case 207:
					showSnackAndReload(deployMessage(certificate).warning, 'warning');
					break;
				default:
					showSnackAndReload(deployMessage(certificate).error, 'error');
			}
		} catch (error) {
			showSnackAndReload(`Error deploying certificate "${certificate.name}". Reason: ${error.message}`, 'error');
		}
	};

	const onSelectListener = (event) => {
		const id = event.target.dataset.listener;
		if (id) {
			setListeners(
				listeners.map((listener) => {
					if (listener.id == id) listener.isUsed = event.target.checked;
					return listener;
				})
			);
		}
		setCanUpdate(true);
	};

	return (
		<ContentContainer path={[{ route: '/home', name:'Home' }, { route: '/certs', name: 'Certificates' }, { name: 'Deploy' }]}>
			<ContainerHeader
				title={`Deploy client CA certificate: ${certificate.name}`}
				subTitle={
					<Typography variant="inherit" display="inline">
						Client certificate authorization is only possible, if the connected broker has set the right
						configuration. The broker configuration must define a <i>certfile</i> and set{' '}
						<i>require_certificate</i> to true.
					</Typography>
				}
			/>
			{hasConnectedConnection ? (
				<Table size="small" aria-label="listeners">
					<TableHead>
						<TableRow>
							<TableCell>Choose connection</TableCell>
							<TableCell align="left">
								<ConnectionSelect
									connections={connections}
									selected={connection}
									onSelect={onSelectConnection}
								/>
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							<TableCell style={{ verticalAlign: 'top' }}>Select target listeners</TableCell>
							<TableCell align="left">{getListenersCell(listeners, onSelectListener)}</TableCell>
						</TableRow>
						<TableRow>
							<TableCell style={{ borderBottom: 'none' }}>
								<SaveCancelButtons
									saveCaption="Apply"
									onSave={onDeploy}
									saveDisabled={!canUpdate}
									onCancel={onCancel}
								/>
							</TableCell>
							<TableCell style={{ borderBottom: 'none' }}> </TableCell>
						</TableRow>
					</TableBody>
				</Table>
			) : (
				ErrorHint({
					title: 'Deploy not possible!',
					message: 'Cannot deploy because no connected connection available.'
				})
			)}
		</ContentContainer>
	);
};

const mapStateToProps = (state) => {
	return { connections: state.brokerConnections?.brokerConnections };
};

export default connect(mapStateToProps)(CertificateDeploy);
