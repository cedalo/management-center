import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Adjust from '@material-ui/icons/Adjust';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import Star from '@material-ui/icons/Star';
import PasswordIcon from '@material-ui/icons/VpnKey';
import Alert from '@material-ui/lab/Alert';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { updateUserProfile } from '../actions/actions';
import { updateUsers } from '../admin/users/actions/actions';
import { useFormStyles } from '../styles';
import { WebSocketContext } from '../websockets/WebSocket';
import ContainerBox from './ContainerBox';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
import { useConfirmCancel } from '../helpers/useConfirmDialog';

const userShape = PropTypes.shape({
    username: PropTypes.string,
});

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    paper: {
        padding: '15px',
        marginTop: '15px',
    },
    form: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        // marginLeft: theme.spacing(1),
        // marginRight: theme.spacing(1),
        // width: 200,
    },
    buttons: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    margin: {
        margin: theme.spacing(1),
    },
}));

const UserProfile = (props) => {
    const classes = useStyles();
    const [value, setValue] = React.useState(0);
    const [editMode, setEditMode] = React.useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const { userProfile } = props;
    const { backendParameters } = props;
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [updatedUser, setUpdatedUser] = React.useState({
        ...userProfile,
    });

    const passwordsMatch = password === passwordConfirm;

    const context = useContext(WebSocketContext);
    const dispatch = useDispatch();
    const confirmCancel = useConfirmCancel();
    const formClasses = useFormStyles();
    const { client: brokerClient } = context;

    const ROOT_USERNAME = backendParameters.rootUsername;

    const validate = () => {
        if (editMode) {
            return passwordsMatch && updatedUser.username !== '';
        }
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const onUpdateUserProfile = async () => {
        try {
            updatedUser.password = password;
            if (!updatedUser.username) {
                updatedUser.username = userProfile?.username;
            }
            await brokerClient.updateUserProfile(updatedUser);
            enqueueSnackbar('User successfully updated', {
                variant: 'success',
            });
            const userProfileObject = await brokerClient.getUserProfile();
            dispatch(updateUserProfile(userProfileObject));
            // const users = await brokerClient.listUsers();
            // dispatch(updateUsers(users));
            setEditMode(false);
        } catch (error) {
            enqueueSnackbar(`Error editing user profile. Reason: ${error.message ? error.message : error}`, {
                variant: 'error',
            });
        }
    };

    const onCancelEdit = async () => {
        await confirmCancel({
            title: 'Cancel user editing',
            description: `Do you really want to cancel editing this user?`,
        });
        setUpdatedUser({
            ...userProfile,
        });
        setEditMode(false);
    };

    return userProfile ? (
        <ContentContainer
            breadCrumbs={<ContainerBreadCrumbs title="Profile" links={[{ name: 'Home', route: '/home' }]} />}
            overFlowX="hidden"
        >
            <ContainerHeader
                title="User Profle"
                subTitle="View infos about the current user."
                warnings={() => {
                    const alerts = [];
                    if (userProfile?.username === ROOT_USERNAME) {
                        alerts.push({
                            severity: 'info',
                            title: '',
                            error: 'Note that you cannot edit a root user',
                        });
                    }
                    if (backendParameters.ssoUsed) {
                        alerts.push({
                            severity: 'info',
                            title: '',
                            error: 'Note that you cannot edit password of the SSO users',
                        });
                    }
                    return alerts;
                }}
            />
            <div>
                <Grid container spacing={1} alignItems="flex-end">
                    <Grid item xs={12}>
                        <TextField
                            required={editMode}
                            disabled={true}
                            id="username"
                            label="Username"
                            value={editMode ? updatedUser?.username : userProfile.username}
                            defaultValue=""
                            variant="outlined"
                            fullWidth
                            size="small"
                            margin="dense"
                            className={formClasses.textField}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircle />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {backendParameters.ssoUsed ? null : (
                        <>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    disabled={!editMode}
                                    id="password"
                                    label="Password Change"
                                    error={!passwordsMatch}
                                    helperText={!passwordsMatch && 'Passwords must match.'}
                                    onChange={(event) => setPassword(event.target.value)}
                                    defaultValue=""
                                    variant="outlined"
                                    fullWidth
                                    type="password"
                                    size="small"
                                    margin="dense"
                                    className={formClasses.textField}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PasswordIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    disabled={!editMode}
                                    id="password-confirm"
                                    label="Password Confirm"
                                    error={!passwordsMatch}
                                    helperText={!passwordsMatch && 'Passwords must match.'}
                                    onChange={(event) => setPasswordConfirm(event.target.value)}
                                    defaultValue=""
                                    variant="outlined"
                                    fullWidth
                                    type="password"
                                    size="small"
                                    margin="dense"
                                    className={formClasses.textField}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PasswordIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </>
                    )}
                    {/* <Grid item xs={12}>
							<AutoSuggest
								disabled
								values={userProfile?.roles?.map((role) => ({
									label: role,
									value: role
								}))}
							/>
						</Grid> */}
                </Grid>

                {!editMode && userProfile?.username !== ROOT_USERNAME && !backendParameters.ssoUsed && (
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
                                onUpdateUserProfile();
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
                <Grid container style={{ marginLeft: '10px', marginTop: '6px' }}>
                    <Grid item xs={6}>
                        <div>
                            {/* <Grid container style={{border: "1px solid", borderRadius: '10px'}}> */}
                            <Grid container>
                                <Grid item xs={6}>
                                    <div style={{ marginTop: '10px' }}>
                                        <div style={{ marginTop: '10px' }}></div>
                                        <Typography sx={{ mt: 0, mb: 0 }} variant="p" component="div">
                                            <Typography variant="subtitle2" display="inline">
                                                Roles:{' '}
                                            </Typography>
                                            {!userProfile.roles || (userProfile.roles && !userProfile.roles.length) ? (
                                                <Box display="inline" sx={{ fontStyle: 'italic', m: 1 }}>
                                                    None
                                                </Box>
                                            ) : (
                                                ''
                                            )}
                                        </Typography>
                                        <Divider />
                                        {userProfile.roles && userProfile.roles.length ? (
                                            <List style={{ marginTop: '0px' }} dense>
                                                {userProfile.roles.map((role) => {
                                                    return (
                                                        <>
                                                            <ListItem align="center">
                                                                <ListItemIcon>
                                                                    <Star />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={role}
                                                                    // secondary="Secondary text"
                                                                />
                                                            </ListItem>
                                                            <Divider />
                                                        </>
                                                    );
                                                })}
                                            </List>
                                        ) : (
                                            <></>
                                        )}
                                        {/* {userProfile.roles}<br/> */}
                                        {/* {userProfile.groups.map((el) => ' ' + el)} */}
                                    </div>
                                </Grid>
                                <Grid item xs={6}>
                                    <div>
                                        <div style={{ marginTop: '10px' }}></div>
                                        <Typography sx={{ mt: 0, mb: 0 }} variant="p" component="div">
                                            <Typography variant="subtitle2" display="inline">
                                                Groups:{' '}
                                            </Typography>
                                            {!userProfile.groups ||
                                            (userProfile.groups && !userProfile.groups.length) ? (
                                                <Box display="inline" sx={{ fontStyle: 'italic', m: 1 }}>
                                                    None
                                                </Box>
                                            ) : (
                                                ''
                                            )}
                                        </Typography>
                                        <Divider />
                                        {userProfile.groups && userProfile.groups.length ? (
                                            <List style={{ marginTop: '0px' }} dense>
                                                {userProfile.groups.map((group) => {
                                                    return (
                                                        <>
                                                            <ListItem key={group.name}>
                                                                <ListItemIcon>
                                                                    <Adjust />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={group.name}
                                                                    // secondary="Secondary text"
                                                                />
                                                            </ListItem>
                                                            <Divider />
                                                        </>
                                                    );
                                                })}
                                            </List>
                                        ) : (
                                            <></>
                                        )}
                                        {/* {userProfile.roles}<br/> */}
                                        {/* {userProfile.groups.map((el) => ' ' + el)} */}
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                    </Grid>
                </Grid>
            </div>
        </ContentContainer>
    ) : null;
};

UserProfile.propTypes = {
    userProfile: userShape.isRequired,
};

const mapStateToProps = (state) => {
    return {
        userProfile: state.userProfile?.userProfile,
        backendParameters: state.backendParameters?.backendParameters,
    };
};

export default connect(mapStateToProps)(UserProfile);
