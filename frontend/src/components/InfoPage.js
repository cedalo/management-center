import moment from "moment";
import React from "react";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
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

const useStyles = makeStyles((theme) => ({
	tableContainer: {
		"& td:first-child": {
			width: "30%",
		}
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

  const {
	license,
	version,
  } = props;

  return (
    <div>
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
                    {version.buildDate}
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
};

const mapStateToProps = (state) => {
  return {
	  license: state.license?.license,
	  version: state.version?.version,
  };
};

export default connect(mapStateToProps)(InfoPage);
