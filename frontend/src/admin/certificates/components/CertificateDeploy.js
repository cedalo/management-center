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
import React, { useContext, useEffect, useState } from 'react';
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
import TlsEnabledIcon from '@material-ui/icons/Check';
import TlsDisabledIcon from '@material-ui/icons/Cancel';
import { useSnackbar } from 'notistack';
import SaveCancelButtons from '../../../components/SaveCancelButtons';
import ContainerHeader from '../../../components/ContainerHeader';
import { WebSocketContext } from '../../../websockets/WebSocket';
import ContentContainer from './ContentContainer';

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
					<TableCell padding="checkbox" />
					<TableCell>Protocol</TableCell>
					<TableCell>Port</TableCell>
					<TableCell>Address</TableCell>
					<TableCell>TLS</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{listeners.map((listener, index) => (
					<TableRow key={listener.id}>
						<TableCell padding="checkbox" style={rowStyle(index)}>
							<Checkbox
								disabled={!listener.tls}
								checked={!!listener.isUsed}
								onChange={onSelect}
								inputProps={{
									'data-listener': `${listener.id}`
								}}
							/>
						</TableCell>
						<TableCell style={rowStyle(index)}>{listener.protocol}</TableCell>
						<TableCell style={rowStyle(index)}>{listener.port}</TableCell>
						<TableCell style={rowStyle(index)}>{listener['bind-address'] || ''}</TableCell>
						<TableCell style={rowStyle(index)}>
							{listener.tls ? (
								<TlsEnabledIcon fontSize="small" style={{ color: green[500] }} />
							) : (
								<TlsDisabledIcon fontSize="small" style={{ color: red[500] }} />
							)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
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
			{connections.map((conn) => (
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

const normalize = (host = '') => {
	if (host.startsWith('//')) return host.substring(2);
	if (host.startsWith('/')) return host.substring(1);
	return host;
};
const getConnectionInfo = (connection) => {
	const { id, name, url = '' } = connection;
	const parts = url.split(':');
	return { id, name, protocol: parts[0], host: normalize(parts[1]), port: parts[2] };
};
const listenerKey = (listener, host) => `${listener.host || host}:${listener.port}:${listener.tls}`;
const markUsedListeners = (certificate, connection, listeners) => {
	const { host } = connection;
	const usedListenerKeys = certificate.listeners?.map(listenerKey) || [];
	return listeners.map((listener) => {
		listener.isUsed = usedListenerKeys.includes(listenerKey(listener, host));
		return listener;
	});
};

const CertificateDeploy = ({ connections = [] }) => {
	const history = useHistory();
	const [certificate] = useState(history.location.state);
	const { enqueueSnackbar } = useSnackbar();
	const [canUpdate, setCanUpdate] = useState(false);
	const [connection, selectConnection] = useState(connections.find((c) => c.status?.connected) || connections[0]);
	const [listeners, setListeners] = useState(null);
	const { client } = useContext(WebSocketContext);

	const loadListeners = async () => {
		try {
			if (connection?.status?.connected) {
				const { data } = await client.getListeners(connection.id);
				setListeners(markUsedListeners(certificate, getConnectionInfo(connection), data));
			} else {
				setListeners(null);
				if (!connection?.status?.connected) {
					const name = connection?.name || 'n.a.';
					enqueueSnackbar(`Connection "${name}" is not connected`, { variant: 'warning' });
				}
			}
		} catch (error) {
			enqueueSnackbar(`Error loading certificate from server. Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
	};
	useEffect(() => {
		loadListeners();
	}, [connection]);

	onCancel = () => {
		history.goBack();
	};

	const onSelectConnection = (event) => {
		const id = event.target.value;
		selectConnection(connections.find((c) => c.id === id));
		setCanUpdate(false);
	};

	const onDeploy = async () => {
		const selectedListeners = listeners.filter((listener) => listener.isUsed);
		try {
			const { status } = await client.deployCertificate(certificate, connection, selectedListeners);
			switch (status) {
				case 200:
					enqueueSnackbar(deployMessage(certificate).success[action], { variant: 'success' });
					break;
				case 207:
					enqueueSnackbar(deployMessage(certificate).warning[action], { variant: 'warning' });
					break;
				default:
					enqueueSnackbar(deployMessage(certificate).error[action], { variant: 'error' });
			}
		} catch (error) {
			enqueueSnackbar(`Error ${action} certificate "${certificate.name}".`, { variant: 'error' });
		}
		// history.goBack();
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
		<ContentContainer
			path={[
				{ link: 'home' },
				{ link: 'admin' },
				{ link: 'admin/certs', title: 'Certificates' },
				{ title: 'Deploy' }
			]}
		>
			<ContainerHeader title={`Deploy Certificate ${certificate.name}`}></ContainerHeader>
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
						<TableCell style={{ verticalAlign: 'top' }}>Select listeners to deploy to</TableCell>
						<TableCell align="left">
							{listeners == null ? (
								<Typography variant="h8" gutterBottom component="div">
									Loading available listeners...
								</Typography>
							) : (
								<ListenerSelect listeners={listeners} onSelect={onSelectListener} />
							)}
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell style={{ borderBottom: 'none' }}>
							<SaveCancelButtons
								saveCaption="Deploy"
								onSave={onDeploy}
								saveDisabled={!canUpdate}
								onCancel={onCancel}
							/>{' '}
						</TableCell>
						<TableCell style={{ borderBottom: 'none' }}> </TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</ContentContainer>
	);
};

const mapStateToProps = (state) => {
	return { connections: state.brokerConnections?.brokerConnections };
};

export default connect(mapStateToProps)(CertificateDeploy);
