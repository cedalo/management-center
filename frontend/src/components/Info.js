import {
	Avatar,
	Box,
	Card,
	Tooltip,
	IconButton,
	CardHeader,
	CardContent,
	Grid,
	Typography,
	colors,
	makeStyles
} from '@material-ui/core';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import PropTypes from 'prop-types';
import React from 'react';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	root: {
		height: '100%'
	},
	avatar: {
		backgroundColor: '#FD602E',  // theme.palette?.dashboard?.icons || , // colors.green[600],
		height: 30,
		width: 30
	},
	info: {
		marginTop: '9px'
	},
	differenceIcon: {
		color: colors.red[900]
	},
	differenceValue: {
		color: colors.red[900],
		marginRight: theme.spacing(1)
	}
}));

const Info = ({className, infos, infoIcon, label, chart, icon, alignment, ...rest}) => {
	const classes = useStyles();

	return (
		<Card className={clsx(classes.root, className)} variant="outlined" {...rest}>
			<CardHeader
				title={<Typography variant="body1">{label}</Typography>}
				avatar={<Avatar className={classes.avatar}>{icon}</Avatar>}
				action={infoIcon ?
					<Tooltip title="Click for further Infos">
						<IconButton
							className={classes.info} size="small"
							aria-label="info">
							<InfoOutlined
								onClick={(event) => {
									event.stopPropagation();
									window.open('https://docs.cedalo.com/management-center', '_blank')
								}}
								fontSize="small"
							/>
						</IconButton>
					</Tooltip> : null
				}
			/>
			<CardContent>
				<Grid container style={{height: chart ? '180px' : null}} spacing={3}>
					{chart}
					{infos.map(info => (
						info.hide !== true ?
								<Grid style={{display: 'flex', padding: '4px 12px', marginTop: info.space ? '10px' : '0px'}}
									  justifyContent={alignment=== "table" ? "flex-start" : "space-between"} xs={12} item>
									<Typography color="textPrimary" style={{width: alignment === 'table' ? '40%' : undefined}} variant="body2">
										{info.label}
									</Typography>
									<Typography color="textPrimary" variant="body2">
										{info.value}
									</Typography>
								</Grid>
						: null
					))}
				</Grid>
			</CardContent>
		</Card>
	);
};

Info.propTypes = {
	className: PropTypes.string
};

export default Info;
