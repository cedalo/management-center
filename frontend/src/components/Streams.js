import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Typography from '@material-ui/core/Typography';

import { Link as RouterLink } from 'react-router-dom';

import MessagePage from './MessagePage';

const useStyles = makeStyles((theme) => ({
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const Streams = (props) => {
	const classes = useStyles();
	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Streams
				</Typography>
			</Breadcrumbs>
			<br />
			<MessagePage 
				message="Pssst!!! We are working on a secret feature. Coming soon."
				image="/inprogress.png"
			/>
		</div>
	)
};

const mapStateToProps = (state) => {
	return {
	};
};

export default connect(mapStateToProps)(Streams);
