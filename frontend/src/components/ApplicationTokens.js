import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import {green, red} from '@material-ui/core/colors';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputBase from '@material-ui/core/InputBase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AddIcon from '@material-ui/icons/Add';
import DisabledIcon from '@material-ui/icons/Cancel';
import EnabledIcon from '@material-ui/icons/CheckCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopy from '@material-ui/icons/FileCopy';
import {useConfirm} from 'material-ui-confirm';
import {useSnackbar} from 'notistack';
import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import {connect, useDispatch} from 'react-redux';
import {updateApplicationTokens} from '../actions/actions';
import {WebSocketContext} from '../websockets/WebSocket';
import ContainerBox from './ContainerBox';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';


const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.tables?.odd
		}
	}
}))(TableRow);

const useStyles = makeStyles((theme) => ({
	tableContainer: {
		minHeight: '500px',
		'& td:nth-child(2)': {
			minWidth: '100px'
		}
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
	// fab: {
	// 	position: 'absolute',
	// 	bottom: theme.spacing(2),
	// 	right: theme.spacing(2)
	// },
	copyField: {
		maxWidth: '150px'
	},
	iconButton: {
		backgroundColor: 'transparent',
	},
	textField: {
		margin: theme.spacing(1),
		paddingRight: 0
	},
	margin: {
		margin: theme.spacing(2),
	},
	paddingRight: {
		paddingRight: theme.spacing(3),
	},
	textfieldDisabled: {
		"& input.Mui-disabled": {
			color: theme.palette.text.primary
		}
	}
}));

const USER_TABLE_COLUMNS = [
	{id: 'name', key: 'Name', width: '10%', align: 'left'},
	{id: 'role', key: 'Role', width: '10%', align: 'left'},
	{id: 'requestedBy', key: 'Requested By', width: '7%', align: 'left'},
	{id: 'issueDate', key: 'Issue Date', width: '8%', align: 'left'},
	{id: 'validUntil', key: 'Valid Until', width: '8%', align: 'left'},
	{id: 'lastUsed', key: 'Last Used', width: '8%', align: 'left'},
	{id: 'hash', key: 'Hash', width: '10%', align: 'left'},
	{id: 'status', key: 'Valid', width: '5%', align: 'center'},
	{id: 'delete', key: 'Delete', width: '5%', align: 'center'},
];


const stringToDate = (dateString) => { // ISO 8601 format date string
	return new Date(new Date(dateString).getTime());// + (new Date().getTimezoneOffset() * 60 * 1000));
};


const formatDateToISO8601String = (date) => {
	return getUTCDateString(date,
		' ') + ':' + (date.getUTCSeconds() < 10 ? '0' + date.getUTCSeconds() : date.getUTCSeconds()) + '000Z';
};


const getDateString = (date, separator = ' ') => { // convert to ISO 8601 format date string without seconds portion
	return date.getFullYear() + '-'
		+ ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + '-'
		+ (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + separator
		+ (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
		+ (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
};


const getUTCDateString = (date, separator = 'T') => { // convert to ISO 8601 format date string without seconds portion
	return date.getUTCFullYear() + '-'
		+ ((date.getUTCMonth() + 1) < 10 ? '0' + (date.getUTCMonth() + 1) : (date.getUTCMonth() + 1)) + '-'
		+ (date.getUTCDate() < 10 ? '0' + date.getUTCDate() : date.getUTCDate()) + separator
		+ (date.getUTCHours() < 10 ? '0' + date.getUTCHours() : date.getUTCHours()) + ':'
		+ (date.getUTCMinutes() < 10 ? '0' + date.getUTCMinutes() : date.getUTCMinutes());
};

const shortenTokenName = (tokenName) => {
	return tokenName && ((tokenName.length > 30) ? tokenName.substring(0, 30) + '...' : tokenName);
};


const isEmptyObject = (object) => {
	return Object.keys(object).length === 0;
};


const copyText = (text, enqueueSnackbar, successCallback = (() => {
}), errorCallback = (() => {
})) => {
	try {
		navigator.clipboard.writeText(text);
		successCallback();
		enqueueSnackbar(`Text copied successfully`, {
			variant: 'success'
		});
	} catch (error) {
		errorCallback();
		enqueueSnackbar(`Couldn't copy text: ${error.message ? error.message : error}`, {
			variant: 'error'
		});
	}
};


const createNewTokenDialog = (dialogOpen, handleDialogClose, client, userRoles, tokens) => {
	const ONE_DAY = 1 * 24 * 60 * 60 * 1000;
	const initialExpiryDateString = getDateString(new Date(Date.now() + ONE_DAY));
	const classes = useStyles();
	const confirm = useConfirm();
	const dispatch = useDispatch();
	const [role, setRole] = React.useState('');
	const [tokenName, setTokenName] = React.useState('');
	const [validUntil, setValidUntil] = React.useState(initialExpiryDateString);
	const [loading, setLoading] = React.useState(false);
	const [createdToken, setCreatedToken] = React.useState({});
	const [tokenCopied, setTokenCopied] = React.useState(false);
	const [copyFieldBackgroundColor, setCopyFieldBackgroundColor] = React.useState('#ababab');
	const [copyFieldFontColor, setCopyFieldFontColor] = React.useState(null);
	const [validUntilError, setValidUntilError] = React.useState(null);
	const [tokenNameError, setTokenNameError] = React.useState(null);
	const userInformationMessage = 'Note that the token will not be saved in the system after generation. Please save it and keep it in a safe place';

	const {enqueueSnackbar} = useSnackbar();

	const requiredFieldsNotFilled = !tokenName || !role || !validUntil;
	const requiredFieldsChanged = tokenName || role || validUntil !== initialExpiryDateString;
	const validationErrorOccured = validUntilError || tokenNameError;


	const maxLengthOfTokenName = 30;

	const fallBackToInitialState = () => {
		setRole('');
		setTokenName('');
		setValidUntil(null);
		setLoading(false);
		setCreatedToken({});
		setTokenCopied(false);
		setCopyFieldBackgroundColor('grey');
		setCopyFieldFontColor(null);
		setValidUntilError(null);
	};

	const createToken = async () => {
		setLoading(true);
		let createdToken;
		try {
			createdToken = await client.createApplicationToken(tokenName, role,
				formatDateToISO8601String(stringToDate(validUntil)));
		} catch (error) {
			enqueueSnackbar(`Couldn't create a token`, {
				variant: 'error'
			});
			console.log('Issue while creating a token');
			console.error(error);
			setLoading(false);
			return;
		}
		dispatch(updateApplicationTokens([...tokens, createdToken]));
		setCreatedToken(createdToken);
		enqueueSnackbar(`Token created successfully`, {
			variant: 'success'
		});
		setLoading(false);
	};


	if (dialogOpen && validUntil === null) {
		setValidUntil(getDateString(new Date(Date.now() + ONE_DAY)));
	}


	const closeDialog = async () => {
		if (!tokenCopied && !isEmptyObject(createdToken)) {
			try {
				await confirm({
					title: 'Don\'t forget to copy the token!',
					description: `Do you want to close this dialog without copying the token? It will never be shown again`
				});
			} catch (error) {
				return;
			}
		}
		if (isEmptyObject(createdToken) && requiredFieldsChanged) { // if one of the requrired fields was changed and we haven't yet generatd token, then we want to preserve state when
			// user closes dialog, so that they can start again
			// where they left when the dialog is reopened
		} else {
			fallBackToInitialState();
		}
		handleDialogClose();
	};


	const checkThatNameUniqueness = (tokenName) => {
		for (const token of tokens) {
			if (token.name === tokenName) {
				setTokenNameError('Token with this name already exists');
				return;
			}
		}
		setTokenNameError(null);
	};

	return <>
		<Dialog fullWidth maxWidth="md" onClose={closeDialog} aria-labelledby="customized-dialog-title"
				open={dialogOpen}>
			<DialogTitle id="customized-dialog-title" onClose={closeDialog}>
				Create a Token
			</DialogTitle>
			<DialogContent dividers>
				<Box style={{minHeight: '300px'}}>
					{!loading ? isEmptyObject(createdToken) ? <>
								<Typography gutterBottom style={{paddingBottom: '10px'}}>
									Please enter the following information:
								</Typography>
								<Grid container>
									<Grid item xs={12}>
										<TextField
											error={!!tokenNameError}
											helperText={tokenNameError}
											fullWidth
											defaultValue={tokenName}
											id="token-name"
											label="Token Name"
											size="small"
											margin="dense"
											onChange={(event) => {
												checkThatNameUniqueness(event.target.value);
												setTokenName(event.target.value);
											}}
											variant="outlined"
											inputProps={{maxLength: maxLengthOfTokenName}}
										/>
									</Grid>
									<Grid item xs={12}>
										<TextField
											fullWidth
											select
											name="role-select"
											id="role-select"
											value={role}
											variant="outlined"
											label="Role"
											onChange={(event) => setRole(event.target.value)}
											size="small"
											margin="dense"
										>
											{userRoles.map((role) => (
												<MenuItem
													key={role}
													value={role}
												>
													{role}
												</MenuItem>
											))}
										</TextField>
									</Grid>
									<Grid item xs={12}>
										<TextField
											fullWidth
											id="validuntil-datetime"
											label="Valid Until"
											type="datetime-local"
											error={validUntilError}
											helperText={validUntilError}
											defaultValue={validUntil}
											size="small"
											margin="dense"
											variant="outlined"
											onChange={(event) => {
												setValidUntil(event.target.value)
												if ((new Date()) > (new Date(event.target.value))) {
													setValidUntilError('This date cannot be in the past');
												} else {
													setValidUntilError(null);
												}
											}}
											InputLabelProps={{
												shrink: true,
											}}
										/>
									</Grid>
								</Grid>
								<Typography gutterBottom style={{paddingTop: '10px'}}>
									{userInformationMessage}
								</Typography>

							</> :
							<>
								<Grid container>
									<Grid item xs={6}>
										<TextField
											disabled
											fullWidth
											defaultValue={createdToken.name}
											id="token-name-readonly"
											label="Token Name"
											variant="outlined"
											size="small"
											margin="dense"
											className={`${classes.paddingRight} ${classes.textfieldDisabled}`}
											inputProps={
												{
													readOnly: true,
													// style: {opacity: 1}
												}
											}
										/>
									</Grid>
									<Grid item xs={6}>
										<TextField
											disabled
											fullWidth
											defaultValue={createdToken.role}
											id="token-role-readonly"
											label="Role"
											variant="outlined"
											size="small"
											margin="dense"
											className={`${classes.paddingRight} ${classes.textfieldDisabled}`}
											inputProps={
												{readOnly: true,}
											}
										/>
									</Grid>
									<Grid item xs={6}>
										<TextField
											disabled
											fullWidth
											defaultValue={getDateString(new Date(createdToken.validUntil))}
											id="token-validuntil-readonly"
											label="Valid Until"
											variant="outlined"
											size="small"
											margin="dense"
											className={`${classes.paddingRight} ${classes.textfieldDisabled}`}
											inputProps={
												{readOnly: true,}
											}
										/>
									</Grid>
									<Grid item xs={6}>
										<TextField
											disabled
											fullWidth
											defaultValue={getDateString(new Date(createdToken.issueDate))}
											id="token-issuedate-readonly"
											label="Issue Date"
											variant="outlined"
											size="small"
											margin="dense"
											className={`${classes.paddingRight} ${classes.textfieldDisabled}`}
											inputProps={
												{readOnly: true,}
											}
										/>
									</Grid>
									<Grid item xs={12} style={{paddingTop: '20px'}}>
										<Typography>Token:</Typography>
										<TextField
											autoFocus
											fullWidth
											defaultValue={createdToken.token}
											id="token-token-readonly"
											label=""
											variant="outlined"
											size="small"
											margin="dense"
											style={{backgroundColor: copyFieldBackgroundColor}}
											sx={{input: {color: 'red'}}}
											InputProps={{
												endAdornment: <IconButton
													size="small"
													className={classes.iconButton}
													aria-label="copy token"
													id="token-value-field"
													onClick={() => copyText(createdToken.token,
														enqueueSnackbar,
														() => {
															setCopyFieldBackgroundColor('#83f28f');
															setCopyFieldFontColor('black');
															setTokenCopied(true);
														},
														() => {
															setCopyFieldBackgroundColor('#ffcccb');
															setCopyFieldFontColor('black');
														})
													}
												>
													<FileCopy fontSize="small" style={{color: copyFieldFontColor}}/>
												</IconButton>,
												readOnly: true,
												style: {color: copyFieldFontColor}
											}
											}
										/>
									</Grid>
								</Grid>
								<Typography gutterBottom style={{paddingTop: '10px'}}>
									{userInformationMessage}
								</Typography>
							</>
						:
						<>
							{/* <Paper container style={{minWidth: '42vw'}}> */}
							<Grid
								container
								spacing={0}
								direction="column"
								alignItems="center"
								justifyContent="center"
								style={{minHeight: '300px'}}
							>
								<Grid item xs={3}>
									<CircularProgress color="secondary"/>
								</Grid>
							</Grid>

						</>
					}
				</Box>
			</DialogContent>
			<DialogActions>
				<Button
					autoFocus
					onClick={isEmptyObject(createdToken) ? createToken : closeDialog}
					color="primary"
					disabled={requiredFieldsNotFilled || loading || validationErrorOccured}
				>
					{isEmptyObject(createdToken) ? "Create" : "Done"}
				</Button>
			</DialogActions>
		</Dialog>
	</>
}


const createTokenTable = (tokens, classes, props, onDeleteToken) => {
	let {applicationTokensFeature, userRoles = [], onSort, sortBy, sortDirection} = props;
	const {enqueueSnackbar} = useSnackbar();
	const small = useMediaQuery(theme => theme.breakpoints.down('xs'));
	const medium = useMediaQuery(theme => theme.breakpoints.between('sm', 'sm'));

	if (!applicationTokensFeature?.error && applicationTokensFeature?.supported !== false && tokens && tokens.length > 0) {
		return <div style={{height: '100%', overflowY: 'auto'}}>
			<TableContainer>
				<Table size="small">
					<TableHead>
						<TableRow>
							{USER_TABLE_COLUMNS.map((column) => (
								<TableCell
									key={column.id}
									sortDirection={sortBy === column.id ? sortDirection : false}
									align={column.align}
									style={{
										width: column.width,
										display: (!small && !medium) ||
										(column.id === 'name' && (small || medium)) ||
										(column.id === 'hash' && medium) ||
										(column.id === 'delete' && (small || medium)) ? undefined : 'none'
									}}
								>
									{column.key}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{tokens &&
							tokens.map((token) => (
								<StyledTableRow
									// hover
									key={token.hash}
									// onClick={(event) => {
									// 	onSelectUser(token.hash;
									// }}
									// style={{ cursor: 'pointer' }}
								>
									<TableCell>
										<Tooltip title={token.name}>
											<InputBase
												className={classes.copyField}
												id="token-name"
												value={token.name}
												endAdornment={<InputAdornment position="end">
													<IconButton
														size="small"
														className={classes.iconButton}
														aria-label="copy token name"
														onClick={() => copyText(token.name, enqueueSnackbar)}
													>
														<FileCopy fontSize="small"/>
													</IconButton></InputAdornment>}
											/>
										</Tooltip>
									</TableCell>
									{small || medium ? null : [
										<TableCell>{token.role}</TableCell>,
										<TableCell>
											{(token.requestedBy?.length > 18) ?
												<Tooltip title={token.requestedBy}>
													<div>
														{token.requestedBy.substring(0, 18) + '...'}
													</div>
												</Tooltip> :
												<>
													{token.requestedBy}
												</>
											}
										</TableCell>,
										<TableCell>{token.issueDate ? getDateString(
											new Date(token.issueDate)) : ''}
										</TableCell>,
										<TableCell>{token.validUntil ? getDateString(
											new Date(token.validUntil)) : ''}
										</TableCell>,
										<TableCell>{token.lastUsed ? getDateString(
											new Date(token.lastUsed)) : ''}
										</TableCell>,
									]}
									{small ? null :
										<TableCell className={classes.badges}>
											<Tooltip title={token.hash}>
												<InputBase
													id="token-hash"
													className={classes.copyField}
													value={token.hash}
													endAdornment={<InputAdornment position="end">
														<IconButton
															size="small"
															className={classes.iconButton}
															aria-label="copy token hash"
															onClick={() => copyText(token.hash, enqueueSnackbar)}
														>
															<FileCopy fontSize="small"/>
														</IconButton>
													</InputAdornment>
													}
												/>
												{/* <AutoSuggest
														disabled={user.editable === false}
														suggestions={roleSuggestions}
														values={user.roles?.map((role) => ({
															label: role,
															value: role
														}))}
														handleChange={(value) => {
															onUpdateUserRoles(user, value);
														}}
													/> */}
											</Tooltip>
										</TableCell>
									}
									{small || medium ? null :
										<TableCell align="center">
											{token.validUntil && (new Date(token.validUntil)) > (new Date()) ?
												<Tooltip title={"Token is valid"}>
													<EnabledIcon fontSize="small" style={{color: green[500]}}/>
												</Tooltip>
												:
												<Tooltip title={"Token has expired"}>
													<DisabledIcon fontSize="small" style={{color: red[500]}}/>
												</Tooltip>
											}
										</TableCell>
									}
									<TableCell align="center">
										<Tooltip title="Revoke token">
											<IconButton
												size="small"
												onClick={(event) => {
													event.stopPropagation();
													onDeleteToken(token.hash, token.name);
												}}
											>
												<DeleteIcon fontSize="small"/>
											</IconButton>
										</Tooltip>
									</TableCell>
								</StyledTableRow>
							))}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	} else if (applicationTokensFeature?.error) {
		return null;
	} else {
		return <div>No tokens found</div>
	}
}

const ApplicationTokens = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const {client} = context;
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const {enqueueSnackbar} = useSnackbar();

	const [dialogOpen, setDialogOpen] = React.useState(false);

	const handleDialogOpen = () => {
		setDialogOpen(true);
	};
	const handleDialogClose = () => {
		setDialogOpen(false);
	};

	let {applicationTokensFeature, tokens = [], userRoles = [], onSort, sortBy, sortDirection} = props;


	const onNewToken = () => {
		handleDialogOpen();
	};

	const onDeleteToken = async (tokenHash, tokenName) => {
		try {
			await confirm({
				title: 'Revoking the token',
				description: `The token will be revoked and deleted`
			});
		} catch (error) {
			return;
		}
		let remainingApplicationTokens;
		try {
			remainingApplicationTokens = await client.deleteApplicationToken(tokenHash);
		} catch (error) {
			console.log('Issue while revoking the token');
			console.error(error);
			enqueueSnackbar(`Couldn't revoke the token ${shortenTokenName(tokenName)}`, {
				variant: 'error'
			});
			return;
		}
		enqueueSnackbar(`Successfully revoked the token: ${shortenTokenName(tokenName)}`, {
			variant: 'success'
		});
		dispatch(updateApplicationTokens(remainingApplicationTokens));
	};

	return [
		<ContentContainer
			breadCrumbs={<ContainerBreadCrumbs title="Tokens" links={[{name: 'Home', route: '/home'}]}/>}
			dataTour="page-tokens"
		>
			<ContainerHeader
				title="Tokens"
				subTitle="Application tokens are mainly used in order to give other applications or scripts access to the MMC's functionality and REST APIs. After creating an application token put it inside the 'Authorization' header as 'Bearer *token*' or use it as a url query parameter (https://url.com?token=*token*) when making a request to the MMC"
				featureWarning={applicationTokensFeature?.supported === false ? "Tokens" : undefined}
				warnings={() => {
					const alerts = [];
					if (applicationTokensFeature?.error /*&& applicationTokensFeature?.supported === true*/) {
						alerts.push({
							severity: 'error',
							title: applicationTokensFeature.error.title || 'An error has occured',
							error: applicationTokensFeature.error.message || applicationTokensFeature.error
						});
					}
					return alerts;
				}}
			>
				<Button
					variant="outlined"
					color="primary"
					size="small"
					id="new-token-button"
					startIcon={<AddIcon/>}
					onClick={(event) => {
						event.stopPropagation();
						onNewToken();
					}}
				>
					New Token
				</Button>
			</ContainerHeader>
			{createTokenTable(tokens, classes, props, onDeleteToken)}
		</ContentContainer>,
		<>
		{createNewTokenDialog(dialogOpen, handleDialogClose, client, userRoles, tokens)}
		</>
	];
};

ApplicationTokens.propTypes = {
	sortBy: PropTypes.string,
	sortDirection: PropTypes.string,
	onSort: PropTypes.func
};

ApplicationTokens.defaultProps = {
	sortBy: undefined,
	sortDirection: undefined
};

const mapStateToProps = (state) => {
	return {
		userProfile: state.userProfile?.userProfile,
		userRoles: state.userRoles?.userRoles,
        tokens: state.tokens?.tokens,
        applicationTokensFeature: state.systemStatus?.features?.applicationtokens,
	};
};

export default connect(mapStateToProps)(ApplicationTokens);
