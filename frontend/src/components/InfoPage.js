import moment from "moment";
import React from "react";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { red, green } from '@material-ui/core/colors';
import PremiumVersionIcon from '@material-ui/icons/VerifiedUser';
import FeatureDisabledIcon from '@material-ui/icons/Cancel';
import FeatureEnabledIcon from '@material-ui/icons/CheckCircle';

import { Link as RouterLink } from "react-router-dom";

import useFetch from "../helpers/useFetch";

const useStyles = makeStyles((theme) => ({
	tableContainer: {
		"& td:first-child": {
			width: "30%",
		}
	},
	updateButton: {
		marginLeft: "20px",
	},
  badges: {
    "& > *": {
      margin: theme.spacing(0.3),
    },
  },
  breadcrumbItem: theme.palette.breadcrumbItem,
  breadcrumbLink: theme.palette.breadcrumbLink,
}));

const createFeatureIcon = (feature, license) => 
	license.features && license.features.includes(feature)
		? <FeatureEnabledIcon fontSize="small" style={{ color: green[500] }} />
		: <FeatureDisabledIcon fontSize="small" style={{ color: red[500] }} />

const isPremiumLicense = license => license && license.edition === 'pro';

const getPremium = () => {
	return <span><PremiumVersionIcon fontSize="small" style={{ color: "#ffc107", verticalAlign: "middle" }} /> Premium</span>
}

const InfoPage = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [response, loading, hasError] = useFetch("http://localhost:8088/api/update");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (response) {

  const {
	license,
	version,
  } = props;

  return (
    <div>
		<Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"An update is available!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
			<ul>
			{
				response.features.map((feature) => {
					return <li>{feature.title}</li>
				})
			}
			</ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
		<Button onClick={handleClose} color="secondary" autoFocus>
            Cancel
          </Button>
		<Button
			target="_href"
			size="small"
			variant="contained"
			color="secondary" 
			href={response.updateURL}
		>
			Download now
		</Button>
        </DialogActions>
      </Dialog>
	<Breadcrumbs aria-label="breadcrumb">
	  <RouterLink className={classes.breadcrumbLink} to="/home">Home</RouterLink>
	  <Typography className={classes.breadcrumbItem} color="textPrimary">Info</Typography>
	</Breadcrumbs>
	<br />
	{
		version && 
        <TableContainer component={Paper} className={classes.tableContainer} >
          <Table size="medium">
            <TableBody>
                <TableRow>
                  <TableCell>
                    <b>Version</b>
                  </TableCell>
                  <TableCell>
                    {version.version}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
				  	<b>Build number</b>
                  </TableCell>
                  <TableCell>
                    {version.buildNumber}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
				  	<b>Build date</b>
                  </TableCell>
                  <TableCell>
                    {moment(version.buildDate).format('LLLL')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
				  	<b>Latest version</b>
                  </TableCell>
                  <TableCell>
                    {moment.unix(response.lastUpdated).format('LLLL')}
					{moment.unix(response.lastUpdated).isAfter(moment(version.buildDate))
					? <Button className={classes.updateButton} size="small" variant="contained" color="secondary" 
						// href="https://hub.docker.com/repository/docker/cedalo/mosquitto-ui"
						onClick={handleClickOpen}
					>
					  Update available
					</Button>
					: <span className={classes.updateButton}>You are up to date!</span>
				  }
                  </TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
		}
		<br />
	  {
		license && 
        <TableContainer component={Paper} className={classes.tableContainer} >
          <Table size="medium">
            <TableBody>
                <TableRow>
                  <TableCell>
                    <b>Edition</b>
                  </TableCell>
                  <TableCell>
                    {license.edition === 'pro' ? getPremium() : license.edition}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
				  	<b>Issued by</b>
                  </TableCell>
                  <TableCell>
                    {license.issuedBy}
                  </TableCell>
                </TableRow>
				{
					isPremiumLicense(license) && 
					<TableRow>
						<TableCell>
							<b>Issued to</b>
						</TableCell>
						<TableCell>
							{license.issuedTo}
						</TableCell>
					</TableRow>
				}
				{
					isPremiumLicense(license) && 
					<TableRow>
					  <TableCell>
						  <b>Valid since</b>
					  </TableCell>
					  <TableCell>
						{moment(license.validSince).format('LLLL')}
					  </TableCell>
					</TableRow>
				}
				{
					isPremiumLicense(license) && 
					<TableRow>
						<TableCell>
							<b>Valid until</b>
						</TableCell>
						<TableCell>
							{moment(license.validUntil).format('LLLL')}
						</TableCell>
				 	</TableRow>
				}
                <TableRow>
                  <TableCell>
				  	<b>Max. broker connections</b>
                  </TableCell>
                  <TableCell>
                    {license.maxBrokerConnenctions}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
				  	<b>REST API</b>
                  </TableCell>
                  <TableCell>
					{
						createFeatureIcon('rest-api', license)
					}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
				  	<b>Custom Theme</b>
                  </TableCell>
                  <TableCell>
					{
						createFeatureIcon('white-labeling', license)
					}
                  </TableCell>
                </TableRow>
                {/* <TableRow>
                  <TableCell>
				  	<b>🚧 Import / Export</b>
                  </TableCell>
                  <TableCell>
					{
						createFeatureIcon('import-export', license)
					}
                  </TableCell>
                </TableRow> */}
                <TableRow>
                  <TableCell>
				  	<b>Topic Tree</b>
                  </TableCell>
                  <TableCell>
					{
						createFeatureIcon('topic-tree', license)
					}
                  </TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
		}
    </div>
  );
  } else {
	  return null;
  }
};

const mapStateToProps = (state) => {
  return {
	  license: state.license?.license,
	  version: state.version?.version,
  };
};

export default connect(mapStateToProps)(InfoPage);
