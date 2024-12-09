import { red } from '@material-ui/core/colors';

// A custom theme for this app

export default function getTheme(style) {
    switch (style) {
        case 'light':
            return {
                palette: {
                    primary: {
                        main: '#FD602E',
                    },
                    text: {
                        primary: 'rgb(0, 0, 0)',
                    },
                    error: {
                        main: red.A400,
                    },
                    background: {
                        default: '#FFFFFF',
                    },
                    breadcrumbItem: {
                        fontSize: '0.7rem',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                    },
                    breadcrumbLink: {
                        color: 'inherit',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        '&:hover': {
                            textDecoration: 'underline',
                        },
                    },
                },
                overrides: {
                    MuiCard: {
                        root: {
                            background: 'none',
                        },
                    },
                    MuiTypography: {
                        root: {
                            color: 'rgb(0, 0, 0)',
                        },
                    },
                    MuiDrawer: {
                        paper: {
                            backgroundColor: 'rgb(255, 255, 255)',
                        },
                    },
                    MuiAppBar: {
                        colorPrimary: {
                            backgroundColor: '#F7F9FC',
                        },
                    },
                    MuiAutocomplete: {
                        tagSizeSmall: {
                            color: '#FFFFFF',
                        },
                        hasClearIcon: {
                            color: 'rgba(255, 255, 255, 0.7)',
                        },
                        inputRoot: {
                            '& .MuiAutocomplete-input': {
                                minWidth: '5px',
                            },
                            minWidth: '5px',
                        },
                        option: {
                            paddingTop: '0px',
                            paddingLeft: '0px',
                            paddingBottom: '0px',
                            paddingRight: '0px',
                        },
                    },
                },
            };
        case 'dark':
            return {
                palette: {
                    type: 'dark',
                    primary: {
                        main: '#FD602E',
                    },
                    text: {
                        primary: 'rgb(255, 255, 255)',
                    },
                    error: {
                        main: red.A400,
                    },
                    background: {
                        default: '#303030',
                    },
                    breadcrumbItem: {
                        fontSize: '0.7rem',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                    },
                    breadcrumbLink: {
                        color: 'inherit',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        '&:hover': {
                            textDecoration: 'underline',
                        },
                    },
                },
                overrides: {
                    MuiCard: {
                        root: {
                            background: 'none',
                        },
                    },
                    MuiTypography: {
                        root: {
                            color: 'rgb(255, 255, 255)',
                        },
                    },
                    MuiDrawer: {
                        paper: {
                            backgroundColor: '#424242',
                        },
                    },
                    MuiAppBar: {
                        colorPrimary: {
                            backgroundColor: '#212121',
                        },
                    },
                    MuiAutocomplete: {
                        tagSizeSmall: {
                            color: '#FFFFFF',
                        },
                        hasClearIcon: {
                            color: 'rgba(255, 255, 255, 0.7)',
                        },
                        inputRoot: {
                            '& .MuiAutocomplete-input': {
                                minWidth: '5px',
                            },
                            minWidth: '5px',
                        },
                        option: {
                            paddingTop: '0px',
                            paddingLeft: '0px',
                            paddingBottom: '0px',
                            paddingRight: '0px',
                        },
                    },
                },
            };
    }
}

// export default theme;
