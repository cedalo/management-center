import { lightGreen, purple } from '@material-ui/core/colors';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Chip from '@material-ui/core/Chip';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Tooltip from '@material-ui/core/Tooltip';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
	root: {
		height: '100%',
		minHeight: '500px',
		flexGrow: 1,
		maxWidth: 400
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
		padding: theme.spacing(2),
		height: '100%'
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const prettifyJSON = (jsonString) => {
	const json = JSON.parse(jsonString);
	const prettifiedJSON = JSON.stringify(json, null, 2);
	return prettifiedJSON;
}

const isJSON = (text) => text?.startsWith('{') || text?.startsWith('[');

const useTreeItemStyles = makeStyles((theme) => ({
	root: {
		color: theme.palette.text.secondary
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
	content: {
		//   color: theme.palette.text.secondary,
		//   borderTopRightRadius: theme.spacing(2),
		//   borderBottomRightRadius: theme.spacing(2),
		//   paddingRight: theme.spacing(1),
		//   fontWeight: theme.typography.fontWeightMedium,
		//   '$expanded > &': {
		// 	fontWeight: theme.typography.fontWeightRegular,
		//   },
	},
	group: {
		//   marginLeft: 0,
		//   '& $content': {
		// 	paddingLeft: theme.spacing(2),
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
							<Typography variant="caption" color="inherit" className={classes.label}>
								<Chip size="small" label={message} color="primary" />
							</Typography>
						</Tooltip>
					)}
					{(topicsCounter || topicsCounter === 0) && (
						<Tooltip title="Number of subtopics">
							<Typography variant="caption" color="inherit" className={classes.label}>
								{/* <strong>Topics:</strong><span>{topicsCounter} </span> */}
								<Chip size="small" label={topicsCounter} style={{ backgroundColor: '#ff9800' }} />
							</Typography>
						</Tooltip>
					)}
					{labelInfo && (
						<Tooltip title="Number of messages">
							<Typography variant="caption" color="inherit" className={classes.label}>
								<Chip size="small" label={labelInfo} style={{ backgroundColor: '#f50057' }} />
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

const TopicTree = ({ topicTree, currentConnectionName }) => {
	const classes = useStyles();
	const [messageHistory, setMessageHistory] = React.useState([]);
	const [selectedNode, setSelectedNode] = React.useState({});
	const [selectedNodeId, setSelectedNodeId] = React.useState('');

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

	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/system">
					System
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Topic Tree
				</Typography>
			</Breadcrumbs>
			<br />

			<Grid container spacing={3}>
				<Grid item xs={6}>
					<Paper className={classes.paper}>
						<TreeView
							className={classes.root}
							defaultCollapseIcon={<ExpandMoreIcon />}
							defaultExpandIcon={<ChevronRightIcon />}
							// defaultExpanded={["topic-tree-root"]}
						>
							{renderTree(data)}
						</TreeView>
					</Paper>
				</Grid>
				<Grid item xs={6}>
					<Paper className={classes.paper}>
						<TableContainer component={Paper} className={classes.table}>
							<Table size="medium">
								<TableBody>
									{selectedNode?._name && (
										<TableRow>
											<TableCell>
												<strong>Name</strong>
											</TableCell>
											<TableCell>{selectedNode?._name}</TableCell>
										</TableRow>
									)}
									{selectedNode?._topic && (
										<TableRow>
											<TableCell>
												<strong>Topic</strong>
											</TableCell>
											<TableCell>{selectedNode?._topic}</TableCell>
										</TableRow>
									)}
									{selectedNode?._created && (
										<TableRow>
											<TableCell>
												<strong>Created</strong>
											</TableCell>
											<TableCell>{moment(selectedNode?._created).format('LLLL')}</TableCell>
										</TableRow>
									)}
									{selectedNode?._lastModified && (
										<TableRow>
											<TableCell>
												<strong>Last modified</strong>
											</TableCell>
											<TableCell>{moment(selectedNode?._lastModified).format('LLLL')}</TableCell>
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
														<strong>{moment(entry._received).format('HH:mm:ss:SSS')}</strong>
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
											// } else if(entry?._message && !entry?._message.startsWith('{')) {
											// 	return <TableRow>
											// 		<TableCell>
											// 			<strong>{moment(entry._received).format('HH:mm:ss:SSS')}</strong>
											// 		</TableCell>
											// 		<TableCell>{entry?._message}</TableCell>
											// 	</TableRow>
											}
										}
									}) : null }
								</TableBody>
							</Table>
						</TableContainer>
					</Paper>
				</Grid>
			</Grid>
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		topicTree: state.topicTree,
		currentConnectionName: state.brokerConnections.currentConnectionName
	};
};

export default connect(mapStateToProps)(TopicTree);
