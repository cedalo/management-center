import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import InfoIcon from '@material-ui/icons/Info';
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles((theme) => ({

}));

const InfoButton = () => {
//   const classes = useStyles();
  const history = useHistory();
  
  const onClickInfo = () => {
	history.push('/info');
  }

  return (
    <IconButton
		edge="end"
		aria-label="Theme Mode"
		aria-controls="theme-mode"
		aria-haspopup="true"
		onClick={onClickInfo}
		color="inherit"
		// className={classes.toolbarButton}
		>
		<InfoIcon />
	</IconButton>
  );
};

InfoButton.propTypes = {
  className: PropTypes.string
};

export default InfoButton;