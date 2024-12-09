import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Switch from '@material-ui/core/Switch';
import { useSnackbar } from 'notistack';
import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { updateSettings } from '../actions/actions';
import useLocalStorage from '../helpers/useLocalStorage';
import { WebSocketContext } from '../websockets/WebSocket';
import ContainerBox from './ContainerBox';
import ContainerBreadCrumbs from './ContainerBreadCrumbs';
import ContainerHeader from './ContainerHeader';
import ContentContainer from './ContentContainer';

const Settings = ({ settings, onChangeTheme, sendMessage }) => {
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const context = useContext(WebSocketContext);
    const { client: brokerClient } = context;
    const [darkMode] = useLocalStorage('cedalo.managementcenter.darkMode');

    const onChangeAllowTrackingUsageData = async (allowTrackingUsageData) => {
        try {
            const updatedSettings = await brokerClient.updateSettings({
                allowTrackingUsageData,
            });
            dispatch(updateSettings(updatedSettings));
        } catch (error) {
            enqueueSnackbar(`Error upating settings. Reason: ${error.message ? error.message : error}`, {
                variant: 'error',
            });
        }
    };

    const onChangeEnableTopicTree = async (topicTreeEnabled) => {
        try {
            const updatedSettings = await brokerClient.updateSettings({
                topicTreeEnabled,
            });
            dispatch(updateSettings(updatedSettings));
        } catch (error) {
            enqueueSnackbar(`Error enableTopicTree. Reason: ${error.message ? error.message : error}`, {
                variant: 'error',
            });
        }
    };

    return (
        <ContentContainer
            breadCrumbs={<ContainerBreadCrumbs title="Settings" links={[{ name: 'Home', route: '/home' }]} />}
            dataTour="page-settings"
        >
            <ContainerHeader
                title="Settings"
                subTitle="Choose your favorite theme and allow or prohibit tracking user data. Also enable the topic tree. Once enabled the app collects all topics, that have been adressed within a broker. This information can then be used in the topic tree."
            />
            <FormGroup>
                <FormControlLabel
                    control={
                        <Switch
                            checked={darkMode === 'true'}
                            onChange={(event) => onChangeTheme(event.target.checked)}
                            id="dark-mode-switch"
                            name="darkMode"
                            color="primary"
                        />
                    }
                    label="Dark Mode"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={settings?.allowTrackingUsageData === true}
                            onClick={(event) => {
                                event.stopPropagation();
                                if (event.target.checked) {
                                    onChangeAllowTrackingUsageData(true);
                                } else {
                                    onChangeAllowTrackingUsageData(false);
                                }
                            }}
                            id="allow-tracking-usage-data-switch"
                            name="allowTrackingUsageData"
                            color="primary"
                        />
                    }
                    label="Allow tracking of usage data"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={settings?.topicTreeEnabled === true}
                            onClick={(event) => {
                                event.stopPropagation();
                                if (event.target.checked) {
                                    onChangeEnableTopicTree(true);
                                } else {
                                    onChangeEnableTopicTree(false);
                                }
                            }}
                            id="topic-tree-enabled-switch"
                            name="topicTreeEnabled"
                            color="primary"
                        />
                    }
                    label="Topic Tree"
                />
            </FormGroup>
        </ContentContainer>
    );
};

const mapStateToProps = (state) => {
    return {
        settings: state.settings?.settings,
    };
};

export default connect(mapStateToProps)(Settings);
