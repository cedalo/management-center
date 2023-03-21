import Button from '@material-ui/core/Button';
import { indigo } from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';
import UpgradeIcon from '@material-ui/icons/NewReleases';
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

const UpgradeButton = ({ license }) => {
    const [isTrial, setIsTrial] = useState(license?.plan === 'trial');

    useEffect(() => {
      setIsTrial(license?.plan === 'trial');
    }, [license]);

    const pricingPageAddress = 'https://cedalo.com/mqtt-broker-pro-mosquitto/pricing/?product=mosquitto&premises=hosted&billing=annually&currency=eur&sHA=no_ha&mHA=no_ha&lHA=no_ha&xlHA=no_ha';

	return (isTrial) ? (
		<>
            <ColorButton
                    style={{marginLeft: '8px'}}
                    variant="contained"
                    startIcon={<UpgradeIcon style={{color: 'red'}}  />}
                    size="small"
                    target="_blank"
                    href={pricingPageAddress}
            >
                Upgrade Now!
            </ColorButton>
		</>)
        :
    <></>;
};

const mapStateToProps = (state) => {
    return {
      license: state.license?.license,
      version: state.version?.version
    };
  };

export default connect(mapStateToProps)(UpgradeButton);
