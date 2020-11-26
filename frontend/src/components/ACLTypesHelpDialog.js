import React, { useContext } from 'react';

import BrokerSelect from './BrokerSelect';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon	 from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	closeButton: {
		position: 'absolute',
		right: theme.spacing(1),
		top: theme.spacing(1),
		color: theme.palette.grey[500]
	},
	acltype: {
		flex: '0.35',
		minWidth: '50px',
		fontWeight: 'bold',
	},
	description: {
		flex: '0.65',
		minWidth: '100px'
	},
}));

const aclTypeHelp = [
	{
		acltype: 'publishClientSend',
		description: 'Restrict the topics this role is allowed to use when publishing to the broker.'
	},
	{
		acltype: 'publishClientReceive', 
		description: 'Restrict the topics this role is allowed to use when receiving published messages from the broker.'
	},
	{
		acltype: 'subscribeLiteral',
		description: 'Restrict the exact topic filters that this role is allowed to subscribe to.'
	},
	{
		acltype: 'subscribePattern',
		description: 'Restrict a range of topic filters that this role is allowed to subscribe to.'
	},
	{
		acltype: 'unsubcribeLiteral',
		description: 'Restrict the exact topic filters that this role is allowed to unsubscribe from.'
	}, 
	{
		acltype: 'unsubcribePattern',
		description: 'Restrict a range of topic filters that this role is allowed to unsubscribe from.'
	}
]

const ACLTypesHelpDialog = ({ open, handleClose }) => {
	const classes = useStyles();

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			aria-labelledby="acl-types-dialog-title"
			aria-describedby="acl-types-dialog-description"
		>
			<DialogTitle align="center" id="acl-types-dialog-title">
				ACL Types
				<IconButton aria-label="close" className={classes.closeButton} onClick={handleClose}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				{/* <MessagePage 
					message="We could not find any Streamsheets installation."
					buttonText="Get Streamsheets now!"
				/> */}
				<List>
					{aclTypeHelp.map((help, index) =>
					<ListItem key={index} divider alignItems="flex-start">

						<ListItemText className={classes.acltype}  >
							<Typography className={classes.acltype}> 
								{help.acltype}
							</Typography>
						</ListItemText>

						<ListItemText className={classes.description} primary={help.description}/>

					</ListItem>
					)}
				</List>
			</DialogContent>
			<DialogActions></DialogActions>
		</Dialog>
	);
};

const mapStateToProps = (state) => {
	return {
	};
};

export default connect(mapStateToProps)(ACLTypesHelpDialog);
