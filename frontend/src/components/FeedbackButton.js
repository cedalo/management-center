import { Tooltip } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { indigo } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import FeedbackIcon from '@material-ui/icons/Feedback';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

const ColorButton = withStyles((theme) => ({
    root: {
        marginTop: '2px',
        // color: 'black',
        // backgroundColor: 'white',
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
    },
}))(IconButton);

const FeedbackButton = ({ backendParameters }) => {
    const [displayFeedback, setDisplayFeedback] = useState(backendParameters.showFeedbackForm);
    const small = useMediaQuery((theme) => theme.breakpoints.down('xs'));

    useEffect(() => {
        setDisplayFeedback(backendParameters?.showFeedbackForm);
    }, [backendParameters]);

    const formPageAddress = 'https://majy33976q6.typeform.com/to/aeRoINk0';

    return !small && displayFeedback ? (
        <Tooltip title="Feedback Questionnaire">
            <ColorButton variant="contained" color="primary" target="_blank" href={formPageAddress}>
                <FeedbackIcon />
            </ColorButton>
        </Tooltip>
    ) : null;
};

const mapStateToProps = (state) => {
    return {
        backendParameters: state.backendParameters?.backendParameters,
        version: state.version?.version,
    };
};

export default connect(mapStateToProps)(FeedbackButton);
