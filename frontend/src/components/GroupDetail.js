import React, { useContext, useState } from 'react';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateGroup, updateGroups } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AccountCircle from '@material-ui/icons/AccountCircle';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import ClientIDIcon from '@material-ui/icons/Fingerprint';
import CredentialsIcon from '@material-ui/icons/Lock';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import GroupIcon from '@material-ui/icons/Group';
import GroupsIcon from '@material-ui/icons/Group';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PasswordIcon from '@material-ui/icons/VpnKey';
import PropTypes from 'prop-types';
import SaveIcon from '@material-ui/icons/Save';
import Switch from '@material-ui/core/Switch';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import UserIcon from '@material-ui/icons/Person';
import { WebSocketContext } from '../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`scrollable-prevent-tabpanel-${index}`}
			aria-labelledby={`scrollable-prevent-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box pt={3}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired
};

function a11yProps(index) {
	return {
		id: `scrollable-prevent-tab-${index}`,
		'aria-controls': `scrollable-prevent-tabpanel-${index}`
	};
}

const clientShape = PropTypes.shape({
	username: PropTypes.string,
	groups: PropTypes.array
});

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%'
	},
	paper: {
		padding: '15px'
	},
	form: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	textField: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
	},
	buttons: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},
	margin: {
		margin: theme.spacing(1)
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const GroupDetail = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;

	const [value, setValue] = React.useState(0);
	const [state, setState] = React.useState({
		checkedA: true,
		checkedB: true
	});
	const { group = {} } = props;
	const [editMode, setEditMode] = React.useState(false);
	const [updatedGroup, setUpdatedGroup] = React.useState({
		...group
	});

	const validate = () => {
		const valid = updatedGroup.groupname !== '';
		return valid;
	};

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const onUpdateGroup = async () => {
		await brokerClient.modifyGroup(updatedGroup);
		enqueueSnackbar('Group successfully updated', {
			variant: 'success'
		});
		const groupObject = await brokerClient.getGroup(group.groupname);
		dispatch(updateGroup(groupObject));
		const groups = await brokerClient.listGroups();
		dispatch(updateGroups(groups));
		setEditMode(false);
	};

	const onCancelEdit = async () => {
		await confirm({
			title: 'Cancel group editing',
			description: `Do you really want to cancel editing this group?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		setUpdatedGroup({
			...group
		});
		setEditMode(false);
	};

	return group.groupname ? (
		<div className={classes.root}>
			<Breadcrumbs maxItems={2} aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security">
					Security
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security/groups">
					Groups
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					{group.groupname}
				</Typography>
			</Breadcrumbs>
			<br />
			<Paper className={classes.paper}>
				{/* <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="off"
        aria-label="Clients"
      >
        <Tab
          label="Details"
          icon={<GroupsIcon />}
          aria-label="details"
          {...a11yProps(0)}
        />
        <Tab
          label="Clients"
          icon={<UserIcon />}
          aria-label="clients"
          {...a11yProps(1)}
        />
      </Tabs> */}
				{/* <TabPanel value={value} index={0}> */}
				<form className={classes.form} noValidate autoComplete="off">
					<div className={classes.margin}>
						<Grid container spacing={1} alignItems="flex-end">
							<Grid item xs={12}>
								<TextField
									required
									disabled
									onChange={(event) => {
										if (editMode) {
											setUpdatedGroup({
												...updatedGroup,
												groupname: event.target.value
											});
										}
									}}
									id="groupname"
									value={updatedGroup.groupname}
									label="Groupname"
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<AccountCircle />
											</InputAdornment>
										)
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									disabled={!editMode}
									onChange={(event) => {
										if (editMode) {
											setUpdatedGroup({
												...updatedGroup,
												textname: event.target.value
											});
										}
									}}
									id="textname"
									label="Text name"
									value={updatedGroup.textname}
									//   onChange={(event) => setTextName(event.target.value)}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									disabled={!editMode}
									onChange={(event) => {
										if (editMode) {
											setUpdatedGroup({
												...updatedGroup,
												textdescription: event.target.value
											});
										}
									}}
									id="textdescription"
									label="Text description"
									value={updatedGroup.textdescription}
									//   onChange={(event) => setTextDescription(event.target.value)}
									defaultValue=""
									variant="outlined"
									fullWidth
									className={classes.textField}
								/>
							</Grid>
						</Grid>
					</div>
				</form>
				{/* </TabPanel> */}
				{/* <TabPanel value={value} index={1}>
	  <List className={classes.root}>
          {group.clients?.map((client) => (
            <React.Fragment>
              <ListItem button>
                <ListItemText
                  primary={client.username}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </TabPanel> */}
				{!editMode && (
					<Grid item xs={12} className={classes.buttons}>
						<Button
							variant="contained"
							color="primary"
							className={classes.button}
							startIcon={<EditIcon />}
							onClick={() => setEditMode(true)}
						>
							Edit
						</Button>
					</Grid>
				)}
				{editMode && (
					<Grid item xs={12} className={classes.buttons}>
						<Button
							variant="contained"
							disabled={!validate()}
							color="primary"
							className={classes.button}
							startIcon={<SaveIcon />}
							onClick={(event) => {
								event.stopPropagation();
								onUpdateGroup();
							}}
						>
							Save
						</Button>
						<Button
							variant="contained"
							onClick={(event) => {
								event.stopPropagation();
								onCancelEdit();
							}}
						>
							Cancel
						</Button>
					</Grid>
				)}
			</Paper>
		</div>
	) : (
		<Redirect to="/security/groups" push />
	);
};

GroupDetail.propTypes = {
	user: clientShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		// TODO: check object hierarchy
		group: state.groups?.group
	};
};

export default connect(mapStateToProps)(GroupDetail);
