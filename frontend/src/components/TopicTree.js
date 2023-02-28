import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DeleteIcon from '@material-ui/icons/Delete';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {Alert, AlertTitle} from '@material-ui/lab';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';


const useStyles = makeStyles((theme) => ({
	root: {
		height: '100%',
		flexGrow: 1,
	},
	table: {
		'& tr:nth-child(2), & td:nth-child(2)': {
			width: '75%'
		}
	},
	payloadDetail: {
		width: '100%'
	},
	payloadHistory: {
		verticalAlign: 'top'
	},
	paper: {
		// padding: theme.spacing(2),
		height: '100%'
	},
	leftBorder: {
		borderLeft: `1px solid ${theme.palette.divider}`,
		paddingLeft: '10px'
	}
}));

const prettifyJSON = (jsonString) => {
	const json = JSON.parse(jsonString);
	const prettifiedJSON = JSON.stringify(json, null, 2);
	return prettifiedJSON;
}

const isJSON = (text) => text?.startsWith('{') || text?.startsWith('[');

const useTreeItemStyles = makeStyles((theme) => ({
	root: {
		color: theme.palette.text.primary
		//   '&:hover > $content': {
		// 	backgroundColor: theme.palette.action.hover,
		//   },
		//   '&:focus > $content, &$selected > $content': {
		// 	backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
		// 	color: 'var(--tree-view-color)',
		//   },
		//   '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
		// 	backgroundColor: 'transparent',
		//   },
	},
	expanded: {},
	selected: {},
	label: {
		fontWeight: 'inherit',
		color: 'inherit',
		marginLeft: '2px',
		marginRight: '2px'
	},
	labelRoot: {
		display: 'flex',
		alignItems: 'center',
		padding: theme.spacing(0.5, 0)
	},
	labelIcon: {
		marginRight: theme.spacing(1)
	},
	labelText: {
		fontWeight: 'inherit',
		flexGrow: 1
	}
}));

function StyledTreeItem(props) {
	const classes = useTreeItemStyles();
	const {
		onLabelClick,
		message,
		topicsCounter,
		labelText,
		labelIcon: LabelIcon,
		labelInfo,
		color,
		bgColor,
		...other
	} = props;

	return (
		<TreeItem
			onLabelClick={onLabelClick}
			label={
				<div className={classes.labelRoot}>
					{/* <LabelIcon color="inherit" className={classes.labelIcon} /> */}
					<Typography variant="body2" className={classes.labelText}>
						{labelText}
					</Typography>
					{message && (
						<Tooltip title="Message body">
							<Typography style={{minWidth: '240px'}} variant="body2" color="inherit"
										className={classes.label}>
								{message}
							</Typography>
						</Tooltip>
					)}
					{(topicsCounter || topicsCounter === 0) && (
						<Tooltip title="Number of subtopics">
							<Typography style={{minWidth: '75px'}} variant="body2" color="textPrimary"
										className={classes.label}>
								{topicsCounter}
							</Typography>
						</Tooltip>
					)}
					{labelInfo && (
						<Tooltip title="Number of messages">
							<Typography style={{minWidth: '126px'}} variant="body2" color="inherit"
										className={classes.label}>
								{labelInfo}
							</Typography>
						</Tooltip>
					)}
				</div>
			}
			style={{
				'--tree-view-color': color,
				'--tree-view-bg-color': bgColor
			}}
			classes={{
				root: classes.root,
				content: classes.content,
				expanded: classes.expanded,
				selected: classes.selected,
				group: classes.group,
				label: classes.label
			}}
			{...other}
		/>
	);
}

StyledTreeItem.propTypes = {
	bgColor: PropTypes.string,
	color: PropTypes.string,
	labelIcon: PropTypes.elementType.isRequired,
	labelInfo: PropTypes.string,
	labelText: PropTypes.string.isRequired
};

const generateTreeData = (id, name, object, index = 0) => {
	// Ignore the topicTree object on top level
	if (index === 0 && object.topicTree) {
		object = object.topicTree
	}
	const node = {
		id,
		name,
		children: [],
		...object
	};
	const properties = Object.keys(object).filter((property) => !property.startsWith('_'));
	if (properties.length > 0) {
		properties.forEach((property) => {
			node.children.push(generateTreeData(`${id}/${property}`, property, object[property], index++));
		});
	}
	//   const metaData = object._messagesCounter ? ` (${object._messagesCounter})` : '';
	//   node.name = `${node.name}${metaData}`;
	return node;
};

const TopicTree = ({topicTree, lastUpdated, currentConnectionName, settings, topicTreeRestFeature}) => {
	const classes = useStyles();
	const [error, setError] = React.useState({occured: false, message: ''})
	const [messageHistory, setMessageHistory] = React.useState([]);
	const [selectedNode, setSelectedNode] = React.useState({});
	const [selectedNodeId, setSelectedNodeId] = React.useState('');
	const [isLoading, setIsLoading] = React.useState(false);
	const context = React.useContext(WebSocketContext);
	const {client} = context;


	useEffect(() => {
		setIsLoading(false);
	}, [topicTree]);


	useEffect(() => {
		const parts = selectedNodeId.split('/');
		parts.shift();
		let current = topicTree.topicTree;
		parts.forEach((part, index) => {
			if (current[part]) {
				current = current[part];
			}
		});
		current = Object.assign({}, current);
		current._received = Date.now();
		if (current._message !== selectedNode?._message // if new message
			&& current._messagesCounter > selectedNode?._messagesCounter) // quick fix
		{
			setSelectedNode(current);
			messageHistory.unshift(current);
			setMessageHistory(messageHistory.slice(0, 51));
		}
	})

	const onLabelClick = (node) => {
		setSelectedNode(node);
		setSelectedNodeId(node.id);
		setMessageHistory([]);
	};

	const data = generateTreeData('topic-tree-root', 'Topic Tree', topicTree);

	useEffect(() => {
		setSelectedNode(null);
		setSelectedNodeId('');
		setMessageHistory([]);
	}, [currentConnectionName]);

	const renderTree = (node) => (
		<StyledTreeItem
			nodeId={node.id}
			labelText={node.name}
			onLabelClick={() => {
				onLabelClick(node);
			}}
			//   labelIcon={InfoIcon}
			message={isJSON(node._message) ? null : node._message}
			topicsCounter={node._topicsCounter}
			labelInfo={node._messagesCounter}
			//   color="#e3742f"
			//   bgColor="#fcefe3"
		>
			{/* <TreeItem key={node.id} nodeId={node.id} label={node.name}> */}
			{Array.isArray(node.children) ? node.children.map((childNode) => renderTree(childNode)) : null}
			{/* </TreeItem> */}
		</StyledTreeItem>
	);


	const clearTopicTreeCache = async () => {
		try {
			setIsLoading(true);
			await client.clearTopicTreeCache();
		} catch (error) {
			setError({occured: true, message: 'Something went wrong when clearing cache'})
		}
	};


	return (
		<div>
			<ContainerBreadCrumbs title="Topic Tree"
								  links={[{name: 'Home', route: '/home'}, {name: 'Inspect', route: '/Inspect'}]}/>
			<div style={{height: 'calc(100% - 26px)'}}>
				<div style={{display: 'grid', gridTemplateRows: 'max-content auto', height: '100%'}}>
					<ContainerHeader
						title="Inspect Topic Tree"
						subTitle="Topic tree show an overview of all topics that have been adressed by a client. If you
						click on a topic additional information for the topic will be displayed right to the tree."
					>
						{(topicTreeRestFeature?.supported) ?
							<Button
								variant="outlined"
								color="primary"
								onClick={clearTopicTreeCache}
								startIcon={isLoading ?
									<CircularProgress color="white" style={{width: "20px", height: "auto"}}/> :
									<DeleteIcon/>}
							>
								Clear Cache
							</Button> : null}
					</ContainerHeader>

					{(settings?.topicTreeEnabled === false) ? <><br/><Alert severity="warning">
						<AlertTitle>Topic tree not enabled</AlertTitle>
						The MMC is currently not collecting topic tree data. If you want to collect data, please enable
						the topic tree feature in the settings page.
						Note that if you enable this setting and the MMC is collecting topic tree data, the performance
						of the MMC backend might decrease.
					</Alert></> : null}
					{(error.occured) ? <><br/><Alert severity="error">
						<AlertTitle>An error has occured</AlertTitle>
						{error.message}
					</Alert></> : null}

					<Grid container spacing={3}>
						<Grid item xs={8}>
							<div className={classes.paper}>
								<div style={{display: 'grid',  gridTemplateColumns: 'auto 241px 80px 130px', marginBottom: '8px'}}>
									<Typography style={{fontWeight: '500', fontSize: '0.875rem'}}>
										Name
									</Typography>
									<Typography style={{fontWeight: '500', fontSize: '0.875rem'}}>
										Payload
									</Typography>
									<Typography style={{fontWeight: '500', fontSize: '0.875rem'}}>
										Subtopics
									</Typography>
									<Typography style={{fontWeight: '500', fontSize: '0.875rem'}}>
										Messages
									</Typography>
								</div>
								<TreeView
									className={classes.root}
									defaultCollapseIcon={<ExpandMoreIcon/>}
									defaultExpandIcon={<ChevronRightIcon/>}
									// defaultExpanded={["topic-tree-root"]}
								>
									{renderTree(data)}
								</TreeView>
							</div>
						</Grid>
						<Grid item xs={4}>
							<Box className={classes.leftBorder}>
								{selectedNode?._topic && (
									<TextField
										id="topicpath"
										label="Topic Path"
										value={selectedNode?._topic}
										variant="outlined"
										fullWidth
										size="small"
										margin="dense"
										InputProps={{
											readOnly: true,
										}}
									/>
								)}
								<TableContainer className={classes.table}>
									<Table size="medium">
										<TableBody>
											{selectedNode?._created && (
												<TableRow>
													<TableCell>
														<strong>Created</strong>
													</TableCell>
													<TableCell>{moment(selectedNode?._created).format(
														'LLLL')}</TableCell>
												</TableRow>
											)}
											{selectedNode?._lastModified && (
												<TableRow>
													<TableCell>
														<strong>Last modified</strong>
													</TableCell>
													<TableCell>{moment(selectedNode?._lastModified).format(
														'LLLL')}</TableCell>
												</TableRow>
											)}
											{typeof selectedNode?._qos === 'number' && (
												<TableRow>
													<TableCell>
														<strong>QoS</strong>
													</TableCell>
													<TableCell>{selectedNode?._qos}</TableCell>
												</TableRow>
											)}
											{(selectedNode?._retain === false || selectedNode?._retain === true) && (
												<TableRow>
													<TableCell>
														<strong>Retain</strong>
													</TableCell>
													<TableCell>{selectedNode?._retain ? 'yes' : 'no'}</TableCell>
												</TableRow>
											)}
											{selectedNode?._topicsCounter >= 0 && (
												<TableRow>
													<TableCell>
														<strong>Sub topics</strong>
													</TableCell>
													<TableCell>{selectedNode?._topicsCounter}</TableCell>
												</TableRow>
											)}
											{selectedNode?._messagesCounter && (
												<TableRow>
													<TableCell>
														<strong>Total messages</strong>
													</TableCell>
													<TableCell>{selectedNode?._messagesCounter}</TableCell>
												</TableRow>
											)}
											{/* {selectedNode?._message && selectedNode?._message.startsWith('{') && ( */}
											{selectedNode?._message && (
												<TableRow>
													<TableCell
														className={classes.payloadHistory}
													>
														<strong>Payload</strong>
													</TableCell>
													<TableCell>
														<TextareaAutosize
															className={classes.payloadDetail}
															rows={5}
															value={
																isJSON(selectedNode?._message)
																	? prettifyJSON(selectedNode?._message)
																	: selectedNode?._message
															}
														/>
													</TableCell>
												</TableRow>
											)}
											{/* {selectedNode?._message && !selectedNode?._message.startsWith('{') && (
										<TableRow>
											<TableCell>
												<strong>Payload</strong>
											</TableCell>
											<TableCell>{selectedNode?._message}</TableCell>
										</TableRow>
									)} */}
										</TableBody>
									</Table>
								</TableContainer>
								<TableContainer component={Paper} className={classes.table}>
									<Table size="medium">
										<TableBody>
											{/* TODO: extract as component */}
											{messageHistory ? messageHistory.map((entry, index) => {
												if (index > 0) {
													// if (entry?._message && entry?._message.startsWith('{')) {
													if (entry?._message) {
														return <TableRow>
															<TableCell
																className={classes.payloadHistory}
															>
																<strong>{moment(entry._received).format(
																	'HH:mm:ss:SSS')}</strong>
															</TableCell>
															<TableCell>
																<TextareaAutosize
																	className={classes.payloadDetail}
																	rows={5}
																	value={
																		isJSON(entry?._message)
																			? prettifyJSON(entry?._message)
																			: entry?._message
																	}
																/>
															</TableCell>
														</TableRow>
														// } else if(entry?._message &&
														// !entry?._message.startsWith('{')) { return <TableRow>
														// <TableCell>
														// <strong>{moment(entry._received).format('HH:mm:ss:SSS')}</strong>
														// </TableCell> <TableCell>{entry?._message}</TableCell>
														// </TableRow>
													}
												}
											}) : null}
										</TableBody>
									</Table>
								</TableContainer>
							</Box>
						</Grid>
					</Grid>
				</div>
			</div>
			{topicTree && <div style={{
				fontSize: '0.9em',
				position: 'absolute',
				right: '15px',
				top: '70px'
			}}>
				Topic tree last updated at: {moment(lastUpdated).format('hh:mm:ss a')}
			</div>}
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		settings: state.settings?.settings,
		lastUpdated: state.topicTree.lastUpdated,
		topicTree: state.topicTree,
		currentConnectionName: state.brokerConnections.currentConnectionName,
		topicTreeRestFeature: state.systemStatus?.features?.topictreerest,
	};
};

export default connect(mapStateToProps)(TopicTree);
