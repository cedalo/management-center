import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import { useSnackbar } from 'notistack';
import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { updateDefaultACLAccess } from '../actions/actions';
import { WebSocketContext } from '../websockets/WebSocket';
import ContainerBox from './ContainerBox';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';

const ACL_TABLE_COLUMNS = [
    { id: 'type', key: 'Type' },
    { id: 'allow', key: 'Allow / Deny' },
];

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
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

const DefaultACLAccess = ({ defaultACLAccess }) => {
    const classes = useStyles();
    const context = useContext(WebSocketContext);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const { client } = context;

    const handleChangeDefaultACLAccess = async (acl, allow) => {
        await client.setDefaultACLAccess([
            {
                acltype: acl.acltype,
                allow,
            },
        ]);
        const defaultACLAccess = await client.getDefaultACLAccess();
        dispatch(updateDefaultACLAccess(defaultACLAccess));
        enqueueSnackbar('Default ACL access successfully set', {
            variant: 'success',
        });
    };

    return (
        <ContainerBox>
            <ContainerBreadCrumbs
                title="Default ACL Access"
                links={[
                    { name: 'Home', route: '/home' },
                    { name: 'Roles', route: '/roles' },
                ]}
            />
            <div style={{ height: 'calc(100% - 26px)' }}>
                <div style={{ display: 'grid', gridTemplateRows: 'max-content auto', height: '100%' }}>
                    <ContainerHeader
                        title="Default ACL Access"
                        buttonsWidth="350px"
                        subTitle="Define the default Access Control List"
                    />
                    <div style={{ height: '100%', overflowY: 'auto' }}>
                        <Hidden xsDown implementation="css">
                            <TableContainer>
                                <Table stickyHeader size="small" aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            {ACL_TABLE_COLUMNS.map((column) => (
                                                <TableCell key={column.id}>{column.key}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {defaultACLAccess &&
                                            defaultACLAccess?.acls.map((acl) => (
                                                <TableRow
                                                    hover
                                                    // TODO: add key
                                                    // key={role.rolename}
                                                >
                                                    <TableCell>{acl.acltype}</TableCell>

                                                    <TableCell>
                                                        <Select
                                                            value={acl.allow ? 'allow' : 'deny'}
                                                            onChange={(event) => {
                                                                handleChangeDefaultACLAccess(
                                                                    acl,
                                                                    event.target.value === 'allow'
                                                                );
                                                            }}
                                                        >
                                                            <MenuItem value="allow">allow</MenuItem>
                                                            <MenuItem value="deny">deny</MenuItem>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Hidden>
                        <Hidden smUp implementation="css">
                            <Paper>
                                <List className={classes.root}>
                                    {defaultACLAccess &&
                                        defaultACLAccess?.acls?.map((acl) => (
                                            <React.Fragment>
                                                <ListItem button>
                                                    <ListItemText
                                                        primary={acl.acltype}
                                                        secondary={
                                                            <React.Fragment>
                                                                <Typography
                                                                    component="span"
                                                                    variant="body2"
                                                                    className={classes.inline}
                                                                    color="textPrimary"
                                                                >
                                                                    Allow: <Checkbox checked={acl.allow} disabled />
                                                                </Typography>
                                                            </React.Fragment>
                                                        }
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
                            </Paper>
                        </Hidden>
                    </div>
                </div>
            </div>
        </ContainerBox>
    );
};

const mapStateToProps = (state) => {
    return {
        defaultACLAccess: state.roles?.defaultACLAccess,
    };
};

export default connect(mapStateToProps)(DefaultACLAccess);
