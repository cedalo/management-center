import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Divider,
	Typography,
	colors,
	makeStyles,
	useTheme
} from '@material-ui/core';

import { Doughnut } from 'react-chartjs-2';
import LaptopMacIcon from '@material-ui/icons/LaptopMac';
import PhoneIcon from '@material-ui/icons/Phone';
import PropTypes from 'prop-types';
import React from 'react';
import TabletIcon from '@material-ui/icons/Tablet';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
	root: {
		height: '100%'
	}
}));

const Chart = ({ className, title, data, labels, dataDescriptions, ...rest }) => {
	const classes = useStyles();
	const theme = useTheme();

	const options = {
		animation: false,
		cutoutPercentage: 80,
		layout: { padding: 0 },
		legend: {
			display: false
		},
		maintainAspectRatio: false,
		responsive: true,
		tooltips: {
			backgroundColor: theme.palette.background.default,
			bodyFontColor: theme.palette.text.secondary,
			borderColor: theme.palette.divider,
			borderWidth: 1,
			enabled: true,
			footerFontColor: theme.palette.text.secondary,
			intersect: false,
			mode: 'index',
			titleFontColor: theme.palette.text.primary
		}
	};

	return (
		<Card className={clsx(classes.root, className)} {...rest}>
			<CardHeader title={title} />
			<Divider />
			<CardContent>
				<Box height={300} position="relative">
					<Doughnut data={data} options={options} />
				</Box>
				<Box display="flex" justifyContent="center" mt={2}>
					{dataDescriptions.map(({ color, icon: Icon, title, value }) => (
						<Box key={title} p={1} textAlign="center">
							<Icon color="action" />
							<Typography color="textPrimary" variant="body1">
								{title}
							</Typography>
							<Typography style={{ color }} variant="h3">
								{value}%
							</Typography>
						</Box>
					))}
				</Box>
			</CardContent>
		</Card>
	);
};

Chart.propTypes = {
	className: PropTypes.string
};

export default Chart;
