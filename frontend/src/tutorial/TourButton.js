import React, { Component, useContext } from 'react'
import IconButton from "@material-ui/core/IconButton";
import TourIcon from '@material-ui/icons/Brightness4';
import { ShepherdTour, ShepherdTourContext } from 'react-shepherd'
import newSteps from './steps'

export default function Button() {
  const tour = useContext(ShepherdTourContext);

  return (
	<IconButton
		edge="end"
		aria-label="Tour"
		aria-controls="tour"
		aria-haspopup="true"
		onClick={() => tour.start()}
		color="inherit"
		// className={classes.toolbarButton}
	>
		<TourIcon />
	</IconButton>
  );
}