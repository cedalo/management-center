import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import InfoIcon from "@material-ui/icons/Info";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((theme) => ({
  toolbarButton: {
    marginTop: theme.spacing(0.8),
    marginBottom: theme.spacing(0.2),
  },
}));

const InfoButton = () => {
  const classes = useStyles();
  const history = useHistory();

  const onClickInfo = () => {
    history.push("/info");
  };

  return (
    <Tooltip title="Show info">
      <IconButton
        edge="end"
        aria-label="Theme Mode"
        aria-controls="theme-mode"
        aria-haspopup="true"
        onClick={onClickInfo}
        color="inherit"
        className={classes.toolbarButton}
      >
        <InfoIcon />
      </IconButton>
    </Tooltip>
  );
};

InfoButton.propTypes = {
  className: PropTypes.string,
};

export default InfoButton;
