import React, { useContext } from "react";
import { connect } from "react-redux";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Icon from '@material-ui/core/Icon';
import Chip from "@material-ui/core/Chip";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ConfigurationIcon from '@material-ui/icons/Tune';
import { Link as RouterLink } from "react-router-dom";
// import {
// 	colors,
//   } from '@material-ui/core';

import { WebSocketContext } from '../websockets/WebSocket';

const useStyles = makeStyles((theme) => ({
	avatar: {
		backgroundColor: 'white'
	},
	imageIcon: {
		height: '100%',
		width: '20px'
	  },
	  iconRoot: {
		textAlign: 'center'
	  },
	  breadcrumbItem: theme.palette.breadcrumbItem,
	  breadcrumbLink: theme.palette.breadcrumbLink,
}));

const Configurations = ({ brokerConfigurations, sendMessage }) => {
  const classes = useStyles();
  const theme = useTheme();
  const context = useContext(WebSocketContext);
  const [connection, setConnection] = React.useState("");

  return (
	  <div>
		<Breadcrumbs aria-label="breadcrumb">
			<RouterLink className={classes.breadcrumbLink} to="/">Home</RouterLink>
			<RouterLink className={classes.breadcrumbLink} to="/system">System</RouterLink>
			<Typography className={classes.breadcrumbItem} color="textPrimary">Configurations</Typography>
		</Breadcrumbs>
		<br />
		<List className={classes.root}>
		{brokerConfigurations && Array.isArray(brokerConfigurations.connections)
          ? brokerConfigurations.connections.map((brokerConfiguration) => (
				<React.Fragment>
				  <ListItem alignItems="flex-start">
					<ListItemAvatar>
					  <Avatar>
						  <ConfigurationIcon />
						{/* <Icon classes={{root: classes.iconRoot}}>
							<img className={classes.imageIcon} src="https://projects.eclipse.org/sites/default/files/mosquitto-200px.png"/>
						</Icon> */}
					  </Avatar>
					</ListItemAvatar>
					<ListItemText
					  primary={
						<span>
						  <b>{brokerConfiguration.name}</b>
						</span>
					  }
					    secondary={
					      <React.Fragment>
					        <Typography
					          component="span"
					          variant="body2"
					          className={classes.inline}
					          color="textPrimary"
					        >
					          {brokerConfiguration.url}
					        </Typography>
					      </React.Fragment>
					    }
					/>
					<ListItemSecondaryAction>
					  <IconButton edge="end" aria-label="edit">
						<EditIcon />
					  </IconButton>
					  <IconButton edge="end" aria-label="delete">
						<DeleteIcon />
					  </IconButton>
					</ListItemSecondaryAction>
				  </ListItem>
				  <Divider variant="inset" component="li" />
				</React.Fragment>
            ))
          : null}
		</List>
	  </div>
  );
};

const mapStateToProps = (state) => {
  return {
    // TODO: check object hierarchy
    brokerConfigurations: state.brokerConfigurations.brokerConfigurations,
  };
};

export default connect(mapStateToProps)(Configurations);
