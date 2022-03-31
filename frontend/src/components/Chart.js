import { Box, Card, CardContent, CardHeader, Divider, Typography, colors, useTheme } from '@mui/material';

import { styled } from '@mui/material/styles';

import { Doughnut } from 'react-chartjs-2';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import PhoneIcon from '@mui/icons-material/Phone';
import PropTypes from 'prop-types';
import React from 'react';
import TabletIcon from '@mui/icons-material/Tablet';
import clsx from 'clsx';

const PREFIX = 'Chart';

const classes = {
    root: `${PREFIX}-root`
};

const StyledCard = styled(Card)(() => ({
    [`&.${classes.root}`]: {
		height: '100%'
	}
}));

const Chart = ({ className, title, data, labels, dataDescriptions, ...rest }) => {

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
        <StyledCard className={clsx(classes.root, className)} {...rest}>
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
		</StyledCard>
    );
};

Chart.propTypes = {
	className: PropTypes.string
};

export default Chart;
