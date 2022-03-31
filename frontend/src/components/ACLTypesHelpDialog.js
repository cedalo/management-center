import React, { useContext } from 'react';

import { styled } from '@mui/material/styles';

import BrokerSelect from './BrokerSelect';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon	 from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { connect } from 'react-redux';
const PREFIX = 'ACLTypesHelpDialog';

const classes = {
    closeButton: `${PREFIX}-closeButton`,
    acltype: `${PREFIX}-acltype`,
    description: `${PREFIX}-description`
};

const StyledDialog = styled(Dialog)((
    {
        theme
    }
) => ({
    [`& .${classes.closeButton}`]: {
		position: 'absolute',
		right: theme.spacing(1),
		top: theme.spacing(1),
		color: theme.palette.grey[500]
	},

    [`& .${classes.acltype}`]: {
		flex: '0.35',
		minWidth: '50px',
		fontWeight: 'bold',
	},

    [`& .${classes.description}`]: {
		flex: '0.65',
		minWidth: '100px'
	}
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


	return (
        <StyledDialog
			open={open}
			onClose={handleClose}
			aria-labelledby="acl-types-dialog-title"
			aria-describedby="acl-types-dialog-description"
		>
			<DialogTitle align="center" id="acl-types-dialog-title">
				ACL Types
				<IconButton
                    aria-label="close"
                    className={classes.closeButton}
                    onClick={handleClose}
                    size="large">
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
		</StyledDialog>
    );
};

const mapStateToProps = (state) => {
	return {
	};
};

export default connect(mapStateToProps)(ACLTypesHelpDialog);
