import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import { createTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import { components, TourProvider, useTour } from '@reactour/tour';
import clsx from 'clsx';
import { ConfirmProvider } from 'material-ui-confirm';
import { SnackbarProvider } from 'notistack';
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import apptour from './tutorial/apptour';
import BrokerSelect from './components/BrokerSelect';
import CustomDrawer from './components/CustomDrawer';
import { Loading } from './components/DisconnectedDialog';
import FeedbackButton from './components/FeedbackButton';
import FilterName from './components/FilterName';
import HelpButtons from './components/HelpButtons';
import LicenseErrorDialog from './components/LicenseErrorDialog';
import LogoutButton from './components/LogoutButton';
import NewsletterPopup from './components/NewsletterPopup';
import OnBoardingDialog from './components/OnBoardingDialog';
import ProfileButton from './components/ProfileButton';
import UpgradeButton from './components/UpgradeButton';
import useFetch from './helpers/useFetch';
import useLocalStorage from './helpers/useLocalStorage';
import store from './store';
import getTheme from './theme';
import WebSocketProvider from './websockets/WebSocket';
import SnackbarCloseButton from './components/SnackbarCloseButton';

const CONFIRM_OPTS = {
    cancellationButtonProps: {
        variant: 'contained',
    },
    confirmationButtonProps: {
        color: 'primary',
        variant: 'contained',
    },
};

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        height: '100%',
    },
    box: {
        padding: '50px 0px 0px 0px',
        // padding: '60px 20px 20px 20px',
        width: '100%',
        height: '100%',
    },
    logo: {
        width: '80px',
        verticalAlign: 'middle',
        marginRight: '9px',
        marginBottom: '5px',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        minHeight: '50px',
        height: '50px',
    },
    mainToolBar: {
        minHeight: '50px',
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: '12px',
        minHeight: '50px',
    },
    hide: {
        display: 'none',
    },
    rightToolbar: {
        display: 'flex',
        height: '50px',
        marginLeft: 'auto',
        marginRight: -12,
        alignItems: 'center',
        alignContent: 'center',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    bottom: {
        width: 500,
    },
}));

function Badge({ children }) {
    return (
        <components.Badge styles={{ badge: (base) => ({ ...base, backgroundColor: '#FD602E' }) }}>
            {children}
        </components.Badge>
    );
}

function Tour(props) {
    const [step, setStep] = useState(0);
    const history = useHistory();
    const [steps, setSteps] = useState(apptour);

    const setCurrentStep = (stp, stps) => {
        if (stps) {
            setSteps(stps);
        } else {
            stps = steps;
        }

        if (stps.length > stp && stps[stp].routing) {
            history.push(stps[stp].routing);
            setTimeout(() => {
                setStep(stp);
            }, 200);
            return;
        }
        setStep(stp);
    };

    return (
        <TourProvider
            steps={apptour}
            components={{ Badge }}
            currentStep={step}
            setCurrentStep={(stp, stps) => setCurrentStep(stp, stps)}
            styles={{
                popover: (base) => ({ ...base, color: 'black', width: '450px', maxWidth: '450px' }),
                close: (base) => ({ ...base, right: 8, top: 8 }),
                dot: (base, state) => ({
                    ...base,
                    color: state.current ? '#FD602E' : undefined,
                    background: state.current ? '#FD602E' : undefined,
                }),
            }}
            // showDots={false}
            beforeClose={() => {
                setStep(0);
            }}
        >
            {props.children}
        </TourProvider>
    );
}

export default function (props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [darkMode, setDarkMode] = useLocalStorage('cedalo.managementcenter.darkMode');
    const [filter, setFilter] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [response, loading, hasError] = useFetch(`${process.env.PUBLIC_URL || ''}/api/theme`);
    const [responseConfig, loadingConfig, hasErrorConfig] = useFetch(`${process.env.PUBLIC_URL || ''}/api/config`);
    const [title, setTitle] = useState('Mosquitto Management Center');
    const [logo, setLogo] = useState('');
    const [appliedTheme, setAppliedTheme] = useState(createTheme(getTheme(darkMode === 'true' ? 'dark' : 'light')));

    React.useEffect(() => {
        const dark = darkMode === 'true';
        const theme = getTheme(dark ? 'dark' : 'light');
        if (response) {
            if (response.title) {
                setTitle(response.title);
            }

            if (dark) {
                if (response?.dark?.logo) {
                    theme.logo = response?.dark?.logo;
                }
                if (response.dark?.palette?.primary) {
                    const color = response.dark?.palette?.primary?.main
                        ? response.dark?.palette?.primary?.main
                        : response.dark?.palette?.primary;
                    if (color) {
                        theme.palette.primary.main = color;
                    }
                }
                if (response.dark?.palette?.text) {
                    const color = response.dark?.palette?.text?.primary
                        ? response.dark?.palette?.text?.primary
                        : response.dark?.palette?.text;
                    if (color) {
                        theme.palette.text.primary = color;
                        theme.overrides.MuiTypography.root.color = color;
                    }
                }
                if (response.dark?.palette?.textSecondary) {
                    theme.palette.text.secondary = response.dark?.palette?.textSecondary;
                }
                if (response.dark?.palette?.backgroundTitleBar) {
                    theme.overrides.MuiAppBar.colorPrimary.backgroundColor = response.dark?.palette?.backgroundTitleBar;
                }
                if (response?.dark?.palette?.backgroundNavigation) {
                    theme.overrides.MuiDrawer.paper.backgroundColor = response?.dark?.palette?.backgroundNavigation;
                }
                if (response.dark?.palette?.background) {
                    theme.palette.background.default = response.dark?.palette?.background;
                }
            } else {
                if (response?.light?.logo) {
                    theme.logo = response?.light?.logo;
                }
                if (response.light?.palette?.primary) {
                    const color = response.light?.palette?.primary?.main
                        ? response.light?.palette?.primary?.main
                        : response.light?.palette?.primary;
                    if (color) {
                        theme.palette.primary.main = color;
                    }
                }
                if (response.light?.palette?.text) {
                    const color = response.light?.palette?.text?.primary
                        ? response.light?.palette?.text?.primary
                        : response.light?.palette?.text;
                    if (color) {
                        theme.palette.text.primary = color;
                        theme.overrides.MuiTypography.root.color = color;
                    }
                }
                if (response.light?.palette?.textSecondary) {
                    theme.palette.text.secondary = response.light?.palette?.textSecondary;
                }
                if (response.light?.palette?.backgroundTitleBar) {
                    theme.overrides.MuiAppBar.colorPrimary.backgroundColor =
                        response.light?.palette?.backgroundTitleBar;
                }
                if (response?.light?.palette?.backgroundNavigation) {
                    theme.overrides.MuiDrawer.paper.backgroundColor = response?.light?.palette?.backgroundNavigation;
                }
                if (response.light?.palette?.background) {
                    theme.palette.background.default = response.light?.palette?.background;
                }
            }
            if (response.titleBar === 'logo') {
                setLogo(theme.logo?.path ? theme.logo?.path : theme.logo);
            }
        }
        setAppliedTheme(createTheme(theme));
    }, [response, darkMode]);

    if (!hasErrorConfig && !responseConfig && !hasError && !response) {
        return;
    }

    const hideConnections =
        typeof responseConfig?.hideConnections === 'boolean' ? responseConfig?.hideConnections : false;
    const hideInfoPage = typeof responseConfig?.hideInfoPage === 'boolean' ? responseConfig?.hideInfoPage : false;
    const hideLogoutButton =
        typeof responseConfig?.hideLogoutButton === 'boolean' ? responseConfig?.hideLogoutButton : false;
    const hideProfileButton =
        typeof responseConfig?.hideProfileButton === 'boolean' ? responseConfig?.hideProfileButton : false;

    const handleStartTour = () => {
        setIsOpen(true);
    };

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <ThemeProvider theme={appliedTheme}>
            <SnackbarProvider action={(snackbarKey) => <SnackbarCloseButton snackbarKey={snackbarKey} />}>
                <ConfirmProvider defaultOptions={CONFIRM_OPTS}>
                    <CssBaseline />
                    <Router basename={process.env.PUBLIC_URL}>
                        <Tour>
                            <Provider store={store}>
                                <WebSocketProvider>
                                    <Box data-tour="application" className={classes.root}>
                                        <NewsletterPopup />
                                        <OnBoardingDialog />
                                        <Switch>
                                            <Route path="/login">
                                                <AppBar
                                                    elevation={0}
                                                    position="fixed"
                                                    className={clsx(classes.appBar, {
                                                        [classes.appBarShift]: open,
                                                    })}
                                                >
                                                    <Toolbar disableGutters className={classes.mainToolBar}>
                                                        <Typography variant="h6" noWrap></Typography>
                                                    </Toolbar>
                                                </AppBar>
                                            </Route>
                                            <Route path="/">
                                                <AppBar
                                                    style={{
                                                        backgroundColor:
                                                            appliedTheme.overrides.MuiAppBar.colorPrimary
                                                                .backgroundColor,
                                                    }}
                                                    elevation={0}
                                                    position="fixed"
                                                    data-tour="appbar"
                                                    className={clsx(classes.appBar, {
                                                        [classes.appBarShift]: open,
                                                    })}
                                                >
                                                    <Toolbar
                                                        className={classes.mainToolBar}
                                                        style={{
                                                            paddingLeft: '15px',
                                                        }}
                                                    >
                                                        <IconButton
                                                            aria-label="open drawer"
                                                            onClick={handleDrawerOpen}
                                                            edge="start"
                                                            className={clsx(classes.menuButton, {
                                                                [classes.hide]: open,
                                                            })}
                                                            style={{
                                                                color:
                                                                    darkMode === 'true'
                                                                        ? 'white'
                                                                        : 'rgba(117, 117, 117)',
                                                            }}
                                                        >
                                                            <MenuIcon />
                                                        </IconButton>
                                                        {logo ? (
                                                            <div style={{ height: '60%' }}>
                                                                <img style={{ height: '100%' }} src={logo} />
                                                            </div>
                                                        ) : (
                                                            <Typography noWrap>
                                                                <Typography
                                                                    variant="h5"
                                                                    style={{
                                                                        color: '#FD602E',
                                                                        fontWeight: '500',
                                                                    }}
                                                                >
                                                                    {title}
                                                                </Typography>
                                                            </Typography>
                                                        )}
                                                        {showFilter ? (
                                                            <div
                                                                style={{
                                                                    flexGrow: 1,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                <FilterName
                                                                    filter={filter}
                                                                    onUpdateFilter={setFilter}
                                                                />
                                                            </div>
                                                        ) : null}
                                                        <section className={classes.rightToolbar}>
                                                            <FeedbackButton />
                                                            <UpgradeButton />
                                                            <BrokerSelect appBar />
                                                            <HelpButtons onStartTour={handleStartTour} />
                                                            {!hideProfileButton ? <ProfileButton /> : null}
                                                            {!hideLogoutButton ? <LogoutButton /> : null}
                                                        </section>
                                                    </Toolbar>
                                                </AppBar>

                                                <CustomDrawer
                                                    hideConnections={hideConnections}
                                                    hideInfoPage={hideInfoPage}
                                                    open={open}
                                                    setShowFilter={(show) => setShowFilter(show)}
                                                    handleDrawerOpen={handleDrawerOpen}
                                                    handleDrawerClose={handleDrawerClose}
                                                />
                                                <LicenseErrorDialog />
                                                <Loading />
                                                {/*<DisconnectedRedirect/>*/}

                                                <Box className={classes.box}>
                                                    <AppRoutes
                                                        filter={filter}
                                                        onChangeTheme={(mode) => setDarkMode(mode)}
                                                    />
                                                </Box>
                                            </Route>
                                        </Switch>
                                    </Box>
                                </WebSocketProvider>
                            </Provider>
                        </Tour>
                    </Router>
                </ConfirmProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}
