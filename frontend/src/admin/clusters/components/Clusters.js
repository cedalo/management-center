import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import { updateCluster, updateClusters } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@mui/icons-material/Add';
import { Alert, AlertTitle } from '@mui/material';
import AutoSuggest from '../../../components/AutoSuggest';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ClientIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
// import Fab from '@mui/material/Fab';
import GroupIcon from '@mui/icons-material/Group';
import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';

const PREFIX = 'Clusters';

const classes = {
    root: `${PREFIX}-root`,
    tableContainer: `${PREFIX}-tableContainer`,
    badges: `${PREFIX}-badges`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.tableContainer}`]: {
		minHeight: '500px',
		'& td:nth-child(2)': {
			minWidth: '100px'
		}
	},

    [`& .${classes.badges}`]: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},

    // fab: {
    // 	position: 'absolute',
    // 	bottom: theme.spacing(2),
    // 	right: theme.spacing(2)
    // },
    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,

    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

const StyledTableRow = TableRow;

const CLUSTER_TABLE_COLUMNS = [
	{ id: 'clustername', key: 'Clustername' },
	{ id: 'description', key: 'Description' },
	{ id: 'numberOfNodes', key: 'Nodes' },
];

const createClusterTable = (clusters, classes, props, onDeleteCluster, onSelectCluster) => {
	const { clusterManagementFeature, userRoles = [], roles = [], onSort, sortBy, sortDirection } = props;

	if (!clusterManagementFeature?.error && clusterManagementFeature?.supported !== false && clusters && clusters.length > 0) {
		return (
            <Root>
                <Hidden smDown implementation="css">
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table size="medium">
                            <TableHead>
                                <TableRow>
                                    {CLUSTER_TABLE_COLUMNS.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            sortDirection={sortBy === column.id ? sortDirection : false}
                                        >
                                            {column.key}
                                        </TableCell>
                                    ))}
                                    <TableCell />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {clusters &&
                                    clusters.map((cluster) => (
                                        <StyledTableRow
                                            hover
                                            key={cluster.clustername}
                                            onClick={(event) => {
                                                onSelectCluster(cluster.clustername);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                            classes={{
                                                root: classes.root
                                            }}>
                                            <TableCell>{cluster.clustername}</TableCell>
                                            <TableCell>{cluster.description}</TableCell>
                                            <TableCell>{cluster.nodes?.length || 0}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Delete cluster">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            onDeleteCluster(cluster.clustername);
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </StyledTableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Hidden>
                <Hidden smUp implementation="css">
                    <Paper>
                        <List className={classes.root}>
                            {clusters.map((cluster) => (
                                <React.Fragment>
                                    <ListItem
                                        alignItems="flex-start"
                                        onClick={(event) => onSelectCluster(cluster.clustername)}
                                    >
                                        <ListItemText
                                            primary={<span>{cluster.clustername}</span>}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        className={classes.inline}
                                                        color="textPrimary"
                                                    >
                                                        {cluster.clustername}
                                                    </Typography>
                                                </React.Fragment>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                size="small"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onSelectCluster(cluster.clustername);
                                                }}
                                                aria-label="edit"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>

                                            <IconButton
                                                edge="end"
                                                size="small"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onDeleteCluster(cluster.clustername);
                                                }}
                                                aria-label="delete"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Hidden>
            </Root>
        );
	} else if (clusterManagementFeature?.error) {
		return null;
	} else {
		return <div>No clusters found</div>
	}
}

const Clusters = (props) => {

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;

	const { clusterManagementFeature, clusters = [], onSort, sortBy, sortDirection } = props;

	const onSelectCluster = async (clustername) => {
		const cluster = await brokerClient.getCluster(clustername);
		dispatch(updateCluster(cluster));
		history.push(`/admin/clusters/detail/${clustername}`);
	};

	const onNewCluster = () => {
		history.push('/admin/clusters/new');
	};

	const onDeleteCluster = async (clustername) => {
		await confirm({
			title: 'Confirm cluster deletion',
			description: `Do you really want to delete cluster "${clustername}"?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		await brokerClient.deleteCluster(clustername);
		enqueueSnackbar(`Cluster "${clustername}" successfully deleted`, {
			variant: 'success'
		});
		const clusters = await brokerClient.listClusters();
		dispatch(updateClusters(clusters));
	};

	return (
        <div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} color="inherit" to="/admin">
					Admin
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Clusters
				</Typography>
			</Breadcrumbs>
			{/* TODO: Quick hack to detect whether feature is supported */}
			{clusterManagementFeature?.error ? <><br/><Alert severity="warning">
				<AlertTitle>{clusterManagementFeature.error.title}</AlertTitle>
				{clusterManagementFeature.error.message}
			</Alert></> : null}
			{!clusterManagementFeature?.error && clusterManagementFeature?.supported === false ? <><br/><Alert severity="warning">
				<AlertTitle>Feature not available</AlertTitle>
				Make sure that this feature is included in your MMC license.
			</Alert></> : null}
			<br />
			{!clusterManagementFeature?.error && clusterManagementFeature?.supported !== false && <><Button
                variant="outlined"
                size="small"
                className={classes.button}
                startIcon={<AddIcon />}
                onClick={(event) => {
					event.stopPropagation();
					onNewCluster();
				}}>
				New Cluster
			</Button>
			<br />
			<br />
			</>}
			
			{ createClusterTable(clusters,  props, onDeleteCluster, onSelectCluster) }
		</div>
    );
};

Clusters.propTypes = {
	sortBy: PropTypes.string,
	sortDirection: PropTypes.string,
	onSelectCluster: PropTypes.func.isRequired,
	onSort: PropTypes.func.isRequired
};

Clusters.defaultProps = {
	sortBy: undefined,
	sortDirection: undefined
};

const mapStateToProps = (state) => {
	return {
		clusters: state.clusters?.clusters,
		clusterManagementFeature: state.systemStatus?.features?.clustermanagement
	};
};

export default connect(mapStateToProps)(Clusters);
