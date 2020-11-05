import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Select from "react-select";
import { emphasize, makeStyles, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import MobileStepper from "@material-ui/core/MobileStepper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";

import useLocalStorage from "../helpers/useLocalStorage";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    minWidth: 290,
    width: 550,
  },
  input: {
    display: "flex",
    padding: 0,
    height: "auto",
  },
  valueContainer: {
    display: "flex",
    flexWrap: "wrap",
    flex: 1,
    alignItems: "center",
    overflow: "hidden",
    "& > *": {
      margin: theme.spacing(0.3),
    },
  },
  chip: {
    margin: theme.spacing(1, 1),
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === "light"
        ? theme.palette.grey[300]
        : theme.palette.grey[700],
      0.08
    ),
  },
  noOptionsMessage: {
    padding: theme.spacing(1, 2),
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: "absolute",
    left: 2,
    bottom: 6,
    fontSize: 16,
  },
  paper: {
    position: "absolute",
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0,
  },
  divider: {
    height: theme.spacing(2),
  },
  header: {
    display: "flex",
    alignItems: "center",
    height: 50,
    paddingLeft: theme.spacing(4),
    backgroundColor: theme.palette.background.default,
  },
  img: {
    height: 255,
    // maxWidth: 400,
    overflow: "hidden",
    // display: 'block',
    width: "100%",
  },
}));

function getSteps() {
  return [
    {
      label: "The UI for Mosquitto",
      description: "Manage everything in one central place",
      imgPath: "/onboarding001.png",
    },
    {
      label: "Role based ACL",
      description: "Manage clients, groups and roles",
      imgPath: "/onboarding002.png",
    },
    {
      label: "Mosquitto Dashboard",
      description: "Analyze your Mosquitto broker",
      imgPath: "/onboarding003.png",
    },
    {
      label: "Topic Tree",
      description: "Visualize MQTT topics",
      imgPath: "/onboarding004.png",
    },
  ];
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return `For each ad campaign that you create, you can control how much
				you're willing to spend on clicks and conversions, which networks
				and geographical locations you want your ads to show on, and more.`;
    case 1:
      return "An ad group contains one or more ads which target a shared set of keywords.";
    case 2:
      return `Try out different ad text to see what brings in the most customers,
				and learn how to enhance your ads using features like ad extensions.
				If you run into any problems with your ads, find out how to tell if
				they're running and how to resolve approval issues.`;
    default:
      return "Unknown step";
  }
}

export default function OnBoardingDialog(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();
  const [showOnBoardingDialog, setShowOnBoardingDialog] = useLocalStorage(
    "mosquitto-ui.showOnBoardingDialog"
  );

  const handleClose = () => {
    setShowOnBoardingDialog("false");
  };

  const handleNext = () => {
    if (activeStep + 1 < steps.length) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Dialog
      open={showOnBoardingDialog === "" || showOnBoardingDialog === "true"}
      // onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {/* <DialogTitle id="alert-dialog-title">{steps[activeStep].label}</DialogTitle> */}
      <DialogContent>
        {/* <Paper square elevation={0} className={classes.header}>
      </Paper> */}
        <div style={{ textAlign: "center" }}>
          <img
            style={{ width: "250px" }}
            className={classes.img}
            src={steps[activeStep].imgPath}
            alt={steps[activeStep].label}
          />
        </div>
        <br />
        <Typography variant="h6" style={{ textAlign: "center" }}>
          <strong>{steps[activeStep].label}</strong>
        </Typography>
        <Typography style={{ textAlign: "center" }}>
          {steps[activeStep].description}
        </Typography>
        <DialogContentText id="alert-dialog-description"></DialogContentText>

        <MobileStepper
          steps={4}
          activeStep={activeStep}
          variant="dots"
          position="static"
          className={classes.root}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={activeStep + 1 >= steps.length}
            >
              Next
              {theme.direction === "rtl" ? (
                <KeyboardArrowLeft />
              ) : (
                <KeyboardArrowRight />
              )}
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              {theme.direction === "rtl" ? (
                <KeyboardArrowRight />
              ) : (
                <KeyboardArrowLeft />
              )}
              Back
            </Button>
          }
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Typography>{getStepContent(index)}</Typography>
                <div className={classes.actionsContainer}>
                  <div>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      className={classes.button}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      className={classes.button}
                    >
                      {activeStep === steps.length - 1 ? "Finish" : "Next"}
                    </Button>
                  </div>
                </div>
              </StepContent>
            </Step>
          ))}
        </MobileStepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>All steps completed - you&apos;re finished</Typography>
            <Button onClick={handleReset} className={classes.button}>
              Reset
            </Button>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        {/* <Button onClick={handleClose} color="primary">
            Disagree
          </Button> */}
        <Button onClick={handleClose} color="primary" autoFocus>
          Get started!
        </Button>
      </DialogActions>
    </Dialog>
  );
}
