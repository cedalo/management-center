import React, { useContext } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { WebSocketContext } from '../../websockets/WebSocket';

const useStyles = makeStyles((theme) => ({}));

export default function ReplayStreamDialog({ stream, open, handleReplay, handleClose }) {
	const context = useContext(WebSocketContext);
	const classes = useStyles();
	const { client: brokerClient } = context;
	const [replayTopic, setReplayTopic] = React.useState('');
	const [gte, setGTE] = React.useState('');
	const [lte, setLTE] = React.useState('');
	const [reverse, setReverse] = React.useState(false);
	const [limit, setLimit] = React.useState(-1);
	const [speed, setSpeed] = React.useState(1);

	const validate = () => {
		const valid = replayTopic !== '';
		return valid;
	};

	return (
		<div>
			<Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
				<DialogTitle id="form-dialog-title">Replay stream "{stream.streamname}"</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Change the replay settings and press "Replay" to replay this stream.
					</DialogContentText>
					<Grid container spacing={1} alignItems="flex-end">
						<Grid item xs={12}>
							<TextField
								onChange={(event) => {
									setReplayTopic(event.target.value);
								}}
								required
								id="replaytopic"
								label="Replay topic"
								value={replayTopic}
								defaultValue=""
								variant="outlined"
								fullWidth
								className={classes.textField}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								onChange={(event) => {
									setGTE(event.target.value);
								}}
								id="gte"
								label="gte"
								value={gte}
								defaultValue=""
								variant="outlined"
								fullWidth
								className={classes.textField}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								onChange={(event) => {
									setLTE(event.target.value);
								}}
								id="lte"
								label="lte"
								value={lte}
								defaultValue=""
								variant="outlined"
								fullWidth
								className={classes.textField}
							/>
						</Grid>
						<Grid item xs={12}>
							<FormControlLabel
								control={
								<Switch
									checked={reverse}
									onChange={(event) => {
										setReverse(event.target.checked);
									}}
									name="reverse"
									color="secondary"
								/>
								}
								label="Reverse"
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								onChange={(event) => {
									setLimit(event.target.value);
								}}
								id="limit"
								label="Limit"
								value={limit}
								defaultValue=""
								variant="outlined"
								fullWidth
								className={classes.textField}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								onChange={(event) => {
									setSpeed(event.target.value);
								}}
								id="speed"
								label="Speed"
								value={speed}
								defaultValue=""
								variant="outlined"
								fullWidth
								className={classes.textField}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
					>
							Cancel
					</Button>
					<Button
						disabled={!validate()}
						onClick={() => handleReplay(stream, { replayTopic, gte, lte, reverse, limit, speed })}>
							Replay
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
