import Button from '@mui/material/Link';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import React from 'react';
import Typography from '@mui/material/Typography';
const PREFIX = 'NewsCard';

const classes = {
    root: `${PREFIX}-root`
};

const StyledCard = styled(Card)({
	[`&.${classes.root}`]: {
		maxWidth: 345
	}
});

const NewsCard = ({ title, description, image, link, ...rest }) => {


	return (
        <StyledCard className={classes.root}>
			<CardActionArea>
				<CardMedia component="img" alt={title} height="210" image={image} title={title} />
				<CardContent>
					<Typography gutterBottom variant="h5" component="h2">
						{title}
					</Typography>
					<Typography variant="body2" color="textSecondary" component="p">
						{description}
					</Typography>
				</CardContent>
			</CardActionArea>
			<CardActions>
				<Button size="small" color="primary">
					Learn More
				</Button>
			</CardActions>
		</StyledCard>
    );
};

export default NewsCard;
