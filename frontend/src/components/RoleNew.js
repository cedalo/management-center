import FormGroup from '@material-ui/core/FormGroup';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { useSnackbar } from 'notistack';
import React, { useContext, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { updateRoles, updateRolesAll } from '../actions/actions';
import { useFormStyles } from '../styles';
import { WebSocketContext } from '../websockets/WebSocket';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';
import SaveCancelButtons from './SaveCancelButtons';
import { useConfirmCancel } from '../helpers/useConfirmDialog';

const RoleNew = (props) => {
    const [rolename, setRolename] = useState('');
    const [textname, setTextname] = useState('');
    const [textdescription, setTextdescription] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const context = useContext(WebSocketContext);
    const dispatch = useDispatch();
    const history = useHistory();
    const confirmCancel = useConfirmCancel();
    const { client } = context;
    const formClasses = useFormStyles();

    const rolenameExists = props?.rolesAll?.find((role) => {
        return role.rolename === rolename;
    });

    const validate = () => {
        return rolename !== '';
    };

    const onSaveRole = async () => {
        try {
            await client.createRole(rolename, textname, textdescription);
            const count = props.rowsPerPage;
            const offset = props.page * props.rowsPerPage;

            client
                .listRoles(true, count, offset)
                .then((roles) => {
                    dispatch(updateRoles(roles));
                })
                .catch((error) => console.error(error));
            client
                .listRoles(false)
                .then((rolesAll) => {
                    dispatch(updateRolesAll(rolesAll));
                })
                .catch((error) => console.error(error));

            history.push(`/roles`);
            enqueueSnackbar(`Role "${rolename}" successfully created.`, {
                variant: 'success',
            });
        } catch (error) {
            enqueueSnackbar(`Error creating role "${rolename}". Reason: ${error.message || error}`, {
                variant: 'error',
            });
            throw error;
        }
    };

    const onCancel = async () => {
        await confirmCancel({
            title: 'Cancel role creation',
            description: `Do you really want to cancel creating this role?`,
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
                        {
                            name: 'Roles',
                            route: '/roles',
                        },
                    ]}
                />
            }
            dataTour="page-roles"
        >
            <ContainerHeader title={`New Role`} subTitle="Create a new role by assigning a unique name." />
            <FormGroup>
                <TextField
                    required
                    id="rolename"
                    label="Name"
                    error={rolenameExists}
                    helperText={rolenameExists && 'A role with this name already exists.'}
                    onChange={(event) => setRolename(event.target.value)}
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
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="normal"
                    className={formClasses.textField}
                />
                <TextField
                    id="textdescription"
                    label="Description"
                    onChange={(event) => setTextdescription(event.target.value)}
                    defaultValue=""
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="normal"
                    className={formClasses.textField}
                />
                <SaveCancelButtons onSave={onSaveRole} saveDisabled={!validate()} onCancel={onCancel} />
            </FormGroup>
        </ContentContainer>
    );
};

const mapStateToProps = (state) => {
    return {
        rolesAll: state.roles?.rolesAll?.roles,
        rowsPerPage: state.roles?.rowsPerPage,
        page: state.roles?.page,
    };
};

export default connect(mapStateToProps)(RoleNew);
