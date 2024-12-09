import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { useSnackbar } from 'notistack';
import React, { useContext, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { updateGroups, updateGroupsAll } from '../actions/actions';
import { WebSocketContext } from '../websockets/WebSocket';
import ContainerBox from './ContainerBox';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
import SaveCancelButtons from './SaveCancelButtons';
import { useFormStyles } from '../styles';
import { useConfirmCancel } from '../helpers/useConfirmDialog';

const GroupNew = (props) => {
    const [groupname, setGroupname] = useState('');
    const [textname, setTextname] = useState('');
    const [textdescription, setTextdescription] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const context = useContext(WebSocketContext);
    const dispatch = useDispatch();
    const history = useHistory();
    const confirmCancel = useConfirmCancel();
    const { client } = context;
    const formClasses = useFormStyles();

    const groupnameExists = props?.groupsAll?.find((searchGroup) => {
        return searchGroup.groupname === groupname;
    });

    const validate = () => {
        return groupname !== '';
    };

    const onSaveGroup = async () => {
        try {
            await client.createGroup(groupname, '', textname, textdescription);
            const count = props.rowsPerPage;
            const offset = props.page * props.rowsPerPage;

            client
                .listGroups(true, count, offset)
                .then((groups) => {
                    dispatch(updateGroups(groups));
                })
                .catch((error) => console.error(error));
            client
                .listGroups(false)
                .then((groupsAll) => {
                    dispatch(updateGroupsAll(groupsAll));
                })
                .catch((error) => console.error(error));

            history.push(`/groups`);
            enqueueSnackbar(`Group "${groupname}" successfully created.`, {
                variant: 'success',
            });
        } catch (error) {
            enqueueSnackbar(`Error creating group "${groupname}". Reason: ${error.message || error}`, {
                variant: 'error',
            });
            throw error;
        }
    };

    const onCancel = async () => {
        await confirmCancel({
            title: 'Cancel group creation',
            description: `Do you really want to cancel creating this group?`,
        });
        history.goBack();
    };

    return (
        <ContentContainer
            breadCrumbs={
                <ContainerBreadCrumbs
                    title="New"
                    links={[
                        { name: 'Home', route: '/home' },
                        { name: 'Groups', route: '/groups' },
                    ]}
                />
            }
        >
            <ContainerHeader title="New Group" subTitle="Create a new group by entering a unique group name." />
            <FormGroup>
                <TextField
                    error={groupnameExists}
                    helperText={groupnameExists && 'A group with this name already exists.'}
                    required
                    id="groupname"
                    label="Name"
                    onChange={(event) => setGroupname(event.target.value)}
                    defaultValue=""
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="normal"
                    className={formClasses.textField}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <AccountCircle />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    id="textname"
                    label="Text Name"
                    onChange={(event) => setTextname(event.target.value)}
                    defaultValue=""
                    size="small"
                    margin="normal"
                    className={formClasses.textField}
                    variant="outlined"
                    fullWidth
                />
                <TextField
                    id="textdescription"
                    label="Description"
                    onChange={(event) => setTextdescription(event.target.value)}
                    defaultValue=""
                    size="small"
                    margin="normal"
                    variant="outlined"
                    className={formClasses.textField}
                    fullWidth
                />
                <SaveCancelButtons onSave={onSaveGroup} saveDisabled={!validate()} onCancel={onCancel} />
            </FormGroup>
        </ContentContainer>
    );
};

const mapStateToProps = (state) => {
    return {
        groupsAll: state.groups?.groupsAll?.groups,
        rowsPerPage: state.groups?.rowsPerPage,
        page: state.groups?.page,
    };
};

export default connect(mapStateToProps)(GroupNew);
