import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Avatar, Box, Card, CardContent, Grid, Typography, colors, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	root: {
		height: '100%'
	},
	avatar: {
		backgroundColor: theme.palette?.info?.icons || colors.green[600],
		height: 56,
		width: 56
	},
	differenceIcon: {
		color: colors.red[900]
	},
	differenceValue: {
		color: colors.red[900],
		marginRight: theme.spacing(1)
	}
}));

const Info = ({ className, label, value, icon, ...rest }) => {
	const classes = useStyles();

	return (
		<Card className={clsx(classes.root, className)} {...rest}>
			<CardContent>
				<Grid container justify="space-between" spacing={3}>
					<Grid item>
						<Typography color="textSecondary" gutterBottom>
							{label}
						</Typography>
						<Typography color="textPrimary" variant="h5">
							{value}
						</Typography>
					</Grid>
					<Grid item>
						<Avatar className={classes.avatar}>{icon}</Avatar>
					</Grid>
				</Grid>
				{/* <Box
          mt={2}
          display="flex"
          alignItems="center"
        >
          <ArrowDownwardIcon className={classes.differenceIcon} />
          <Typography
            className={classes.differenceValue}
            variant="body2"
          >
            12%
          </Typography>
          <Typography
            color="textSecondary"
            variant="caption"
          >
            Since last month
          </Typography>
        </Box> */}
			</CardContent>
		</Card>
	);
};

Info.propTypes = {
	className: PropTypes.string
};

export default Info;
