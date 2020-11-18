import Button from '@material-ui/core/Button';
import DownloadIcon from '@material-ui/icons/GetApp';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { amber } from '@material-ui/core/colors';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	button: {
		margin: theme.spacing(1)
	},
	updateButton: {
		marginLeft: '20px'
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const MessagePage = ({ message, buttonText, buttonIcon, callToAction, image = '/smilethink.png' }) => {
	const classes = useStyles();
	return (
		<Paper>
			<Grid container spacing={24} justify="center" style={{ minHeight: '500px', maxWidth: '100%' }}>
				<Grid item xs={12} align="center"></Grid>
				<Grid item xs={12} align="center">
					<img src={image} />
					<Typography variant="h6" gutterBottom>
						{message}
					</Typography>
				</Grid>
				<Grid item xs={12} align="center">
					{buttonText ? (
						<Button
							variant="contained"
							style={{ backgroundColor: amber[500] }}
							className={classes.button}
							startIcon={buttonIcon || <DownloadIcon />}
							onClick={(event) => {
								event.stopPropagation();
								callToAction();
							}}
							size="small"
						>
							{buttonText}
						</Button>
					) : (
						''
					)}
				</Grid>
			</Grid>
		</Paper>
	);
};

const mapStateToProps = (state) => {
	return {};
};

export default connect(mapStateToProps)(MessagePage);
