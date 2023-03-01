import Button from '@material-ui/core/Button';
import { indigo } from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';
import FeedbackIcon from '@material-ui/icons/Feedback';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';


const ColorButton = withStyles((theme) => ({
	root: {
		color: 'black',
		backgroundColor: 'white',
		'&:hover': {
			backgroundColor: indigo[100],
		},
	}
}))(Button);

const FeedbackButton = ({ backendParameters }) => {
    const [displayFeedback, setDisplayFeedback] = useState(backendParameters.showFeedbackForm);

    useEffect(() => {
        setDisplayFeedback(backendParameters?.showFeedbackForm);
    }, [backendParameters]);

    const formPageAddress = 'https://majy33976q6.typeform.com/to/aeRoINk0';


	return (displayFeedback) ? (
		<>
            <ColorButton
                    style={{marginTop: '15px'}}
                    variant="contained"
                    startIcon={<FeedbackIcon  />} // style={{color: 'red'}}
                    size="small"
                    target="_blank"
                    href={formPageAddress}
            >
                Feedback
            </ColorButton>
		</>)
        :
        <></>;
};

const mapStateToProps = (state) => {
    return {
      backendParameters: state.backendParameters?.backendParameters,
      version: state.version?.version
    };
  };

export default connect(mapStateToProps)(FeedbackButton);
