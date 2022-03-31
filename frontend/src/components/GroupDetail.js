import React, { useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateGroup, updateGroups } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AccountCircle from '@mui/icons-material/AccountCircle';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import ClientIDIcon from '@mui/icons-material/Fingerprint';
import CredentialsIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import GroupIcon from '@mui/icons-material/Group';
import GroupsIcon from '@mui/icons-material/Group';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import PasswordIcon from '@mui/icons-material/VpnKey';
import PropTypes from 'prop-types';
import SaveIcon from '@mui/icons-material/Save';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import UserIcon from '@mui/icons-material/Person';
import { WebSocketContext } from '../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';

const PREFIX = 'GroupDetail';

const classes = {
    root: `${PREFIX}-root`,
    paper: `${PREFIX}-paper`,
    form: `${PREFIX}-form`,
    textField: `${PREFIX}-textField`,
    buttons: `${PREFIX}-buttons`,
    margin: `${PREFIX}-margin`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const StyledRedirect = styled(Redirect)((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
		width: '100%'
	},

    [`& .${classes.paper}`]: {
		padding: '15px'
	},

    [`& .${classes.form}`]: {
		display: 'flex',
		flexWrap: 'wrap'
	},

    [`& .${classes.textField}`]: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
	},

    [`& .${classes.buttons}`]: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},

    [`& .${classes.margin}`]: {
		margin: theme.spacing(1)
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

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

const GroupDetail = (props) => {

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
		<StyledRedirect to="/security/groups" push />
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
