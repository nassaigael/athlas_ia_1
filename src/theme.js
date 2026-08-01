import {defaultDarkTheme} from 'react-admin';
import {deepmerge} from '@mui/utils';

export const tokens = {
    ink: '#0D1512',
    surface: '#131F1A',
    surfaceHi: '#1B2A24',
    line: '#28372F',
    textHi: '#EDF2EE',
    textLo: '#8FA398',
};

export const aqiTheme = deepmerge(defaultDarkTheme, {
    palette: {
        mode: 'dark',
        primary: {main: '#4CC38A'},
        secondary: {main: '#E3A83B'},
        background: {default: tokens.ink, paper: tokens.surface},
        text: {primary: tokens.textHi, secondary: tokens.textLo},
        divider: tokens.line,
    },
    typography: {
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        h1: {fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600},
        h2: {fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600},
        h3: {fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600},
        h4: {fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600},
        h5: {fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600},
        h6: {fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600},
    },
    shape: {borderRadius: 10},
    components: {
        RaLayout: {
            styleOverrides: {
                root: {backgroundColor: tokens.ink},
            },
        },
        RaAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: tokens.surface,
                    borderBottom: `1px solid ${tokens.line}`,
                    boxShadow: 'none',
                    color: tokens.textHi,
                },
            },
        },
        RaMenuItemLink: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '2px 8px',
                    fontFamily: '"Space Grotesk", sans-serif',
                    letterSpacing: '0.02em',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: `1px solid ${tokens.line}`,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {borderColor: tokens.line},
                head: {
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: '0.7rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: tokens.textLo,
                },
            },
        },
        MuiChip: {
            styleOverrides: {root: {fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600}},
        },
    },
});
