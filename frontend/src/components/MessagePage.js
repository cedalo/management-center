import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/GetApp';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import React from 'react';
import Typography from '@mui/material/Typography';
import { amber } from '@mui/material/colors';
import { connect } from 'react-redux';
const PREFIX = 'MessagePage';

const classes = {
    button: `${PREFIX}-button`,
    updateButton: `${PREFIX}-updateButton`,
    badges: `${PREFIX}-badges`,
    breadcrumbItem: `${PREFIX}-breadcrumbItem`,
    breadcrumbLink: `${PREFIX}-breadcrumbLink`
};

const StyledPaper = styled(Paper)((
    {
        theme
    }
) => ({
    [`& .${classes.button}`]: {
		margin: theme.spacing(1)
	},

    [`& .${classes.updateButton}`]: {
		marginLeft: '20px'
	},

    [`& .${classes.badges}`]: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},

    [`& .${classes.breadcrumbItem}`]: theme.palette.breadcrumbItem,
    [`& .${classes.breadcrumbLink}`]: theme.palette.breadcrumbLink
}));

const MessagePage = ({ message, buttonText, buttonIcon, callToAction, image = '/smilethink.png' }) => {

	return (
        <StyledPaper>
			<Grid container spacing={24} justifyContent="center" style={{ minHeight: '500px', maxWidth: '100%' }}>
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
		</StyledPaper>
    );
};

const mapStateToProps = (state) => {
	return {};
};

export default connect(mapStateToProps)(MessagePage);
