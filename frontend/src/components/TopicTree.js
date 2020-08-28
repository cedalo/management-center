import React from "react";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import Typography from "@material-ui/core/Typography";
import { Link as RouterLink } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    height: 216,
    flexGrow: 1,
    maxWidth: 400,
  },
});

const generateTreeData = (id, name, obj) => {
  const node = {
    id,
    name,
    children: [],
  };
  const properties = Object.keys(obj);
  if (properties.length > 0) {
    properties.forEach((property) => {
      node.children.push(generateTreeData(property, property, obj[property]));
    });
  }
  return node;
};

const TopicTree = ({ topicTree }) => {
  const classes = useStyles();

  console.log("topicTree");
  console.log(topicTree);

  const data = generateTreeData("Topic Tree", "Topic Tree", topicTree);
  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/system">System</RouterLink>
        <Typography color="textPrimary">Topic Tree</Typography>
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
  console.log("state");
  console.log(state.topicTree);
  return {
    // TODO: check object hierarchy
    topicTree: state.topicTree,
  };
};

export default connect(mapStateToProps)(TopicTree);
