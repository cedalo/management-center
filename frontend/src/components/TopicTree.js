import moment from "moment";
import React from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import Chip from '@material-ui/core/Chip';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Grid from '@material-ui/core/Grid';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import { lightGreen, purple } from '@material-ui/core/colors';
import { Link as RouterLink } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    minHeight: "500px",
    flexGrow: 1,
    maxWidth: 400,
  },
  table: {
    "& tr:nth-child(2), & td:nth-child(2)": {
      width: '75%',
    }
  },
  payloadDetail: {
	  width: '100%',
  },
  paper: {
	padding: theme.spacing(2),
	height: '100%',
  },
  breadcrumbItem: theme.palette.breadcrumbItem,
  breadcrumbLink: theme.palette.breadcrumbLink,
}));

const useTreeItemStyles = makeStyles((theme) => ({
	root: {
	  color: theme.palette.text.secondary,
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
	  marginRight: '2px',
	},
	labelRoot: {
	  display: 'flex',
	  alignItems: 'center',
	  padding: theme.spacing(0.5, 0),
	},
	labelIcon: {
	  marginRight: theme.spacing(1),
	},
	labelText: {
	  fontWeight: 'inherit',
	  flexGrow: 1,
	},
  }));
function StyledTreeItem(props) {
	const classes = useTreeItemStyles();
	const { onLabelClick, message, topicsCounter, labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, ...other } = props;
  
	return (
	  <TreeItem
	    onLabelClick={onLabelClick}
		label={
		  <div className={classes.labelRoot}>
			{/* <LabelIcon color="inherit" className={classes.labelIcon} /> */}
			<Typography variant="body2" className={classes.labelText}>
			  {labelText}
			</Typography>
			{message && <Typography variant="caption" color="inherit" className={classes.label}>
			  <Chip
					size="small"
					label={message}
					color="primary"
				/>
			</Typography>}
			{topicsCounter && <Typography variant="caption" color="inherit" className={classes.label}>
			  {/* <strong>Topics:</strong><span>{topicsCounter} </span> */}
			  <Chip
					size="small"
					label={topicsCounter}
					style={{backgroundColor:'#ff9800'}}
				/>
			</Typography>}
			{labelInfo && <Typography variant="caption" color="inherit" className={classes.label}>
				<Chip
					size="small"
					label={labelInfo}
					style={{backgroundColor:'#f50057'}}
				/>
			</Typography>}
		  </div>
		}
		style={{
		  '--tree-view-color': color,
		  '--tree-view-bg-color': bgColor,
		}}
		classes={{
		  root: classes.root,
		  content: classes.content,
		  expanded: classes.expanded,
		  selected: classes.selected,
		  group: classes.group,
		  label: classes.label,
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
	labelText: PropTypes.string.isRequired,
  };

const generateTreeData = (id, name, object) => {
  const node = {
    id,
    name,
	children: [],
	...object,
  };
  const properties = Object.keys(object).filter(property => !property.startsWith('_'));
  if (properties.length > 0) {
    properties.forEach((property) => {
      node.children.push(generateTreeData(`${id}/${property}`, property, object[property]));
    });
  }
//   const metaData = object._messagesCounter ? ` (${object._messagesCounter})` : '';
//   node.name = `${node.name}${metaData}`;
  return node;
};

const TopicTree = ({ topicTree }) => {
  const classes = useStyles();
  const [selectedNode, setSelectedNode] = React.useState({});

  const onLabelClick = (node) => {
	  setSelectedNode(node);
  }

  const data = generateTreeData("topic-tree-root", "Topic Tree", topicTree);
  const renderTree = (node) => (
	<StyledTreeItem
          nodeId={node.id}
		  labelText={node.name}
		  onLabelClick={() => {
			onLabelClick(node);
		  }}
		//   labelIcon={InfoIcon}
		message={node._message?.startsWith('{') ? null : node._message}
		topicsCounter={node._topicsCounter}
          labelInfo={node._messagesCounter}
        //   color="#e3742f"
        //   bgColor="#fcefe3"
	>
		{/* <TreeItem key={node.id} nodeId={node.id} label={node.name}> */}
      {Array.isArray(node.children)
        ? node.children.map((childNode) => renderTree(childNode))
        : null}
		{/* </TreeItem> */}
    </StyledTreeItem>
  );

  return (
    <div>
	<Breadcrumbs aria-label="breadcrumb">
	  <RouterLink className={classes.breadcrumbLink} to="/home">Home</RouterLink>
	  <RouterLink className={classes.breadcrumbLink} to="/system">System</RouterLink>
	  <Typography className={classes.breadcrumbItem} color="textPrimary">Topic Tree</Typography>
	</Breadcrumbs>
	<br />
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {renderTree(data)}
      </TreeView>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    topicTree: state.topicTree,
  };
};

export default connect(mapStateToProps)(TopicTree);
