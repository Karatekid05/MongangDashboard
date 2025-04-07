import { createTheme } from '@mui/material/styles';

// Create theme color options
const themeColors = {
    primary: {
        main: '#3f51b5',
        light: '#757de8',
        dark: '#002984',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#f50057',
        light: '#ff4081',
        dark: '#c51162',
        contrastText: '#ffffff',
    },
    success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
    },
    info: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
    },
    warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
    },
    error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
    },
};

// Common theme settings
const commonSettings = {
    typography: {
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 500,
        },
        h6: {
            fontWeight: 500,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiAppBar: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.07)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                },
                containedPrimary: {
                    boxShadow: '0 4px 10px 0 rgba(63, 81, 181, 0.15)',
                    '&:hover': {
                        boxShadow: '0 6px 15px 0 rgba(63, 81, 181, 0.25)',
                    },
                },
                containedSecondary: {
                    boxShadow: '0 4px 10px 0 rgba(245, 0, 87, 0.15)',
                    '&:hover': {
                        boxShadow: '0 6px 15px 0 rgba(245, 0, 87, 0.25)',
                    },
                },
            },
        },
        MuiCard: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.04), 0px 1px 3px rgba(0, 0, 0, 0.08)',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    padding: '8px 16px',
                },
            },
        },
    },
};

// Light theme settings
const lightTheme = createTheme({
    ...commonSettings,
    palette: {
        mode: 'light',
        primary: {
            main: '#4f46e5',
            light: '#828df8',
            dark: '#3730a3',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f43f5e',
            light: '#fb7185',
            dark: '#be123c',
            contrastText: '#ffffff',
        },
        success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        info: {
            main: '#0ea5e9',
            light: '#38bdf8',
            dark: '#0284c7',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
        text: {
            primary: '#111827',
            secondary: '#4b5563',
            disabled: 'rgba(0, 0, 0, 0.38)',
        },
        divider: 'rgba(0, 0, 0, 0.06)',
    },
    components: {
        ...commonSettings.components,
        MuiAppBar: {
            ...commonSettings.components.MuiAppBar,
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#f8fafc',
                    borderRight: '1px solid rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.02), 0px 1px 2px rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none'
                }
            }
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    padding: '8px 16px',
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(79, 70, 229, 0.08)',
                        color: '#4f46e5',
                        '&:hover': {
                            backgroundColor: 'rgba(79, 70, 229, 0.12)',
                        },
                        '& .MuiListItemIcon-root': {
                            color: '#4f46e5',
                        },
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    },
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#ffffff',
                    color: '#111827'
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    boxShadow: 'none',
                },
                contained: {
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                    },
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(79, 70, 229, 0.04)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    color: '#4b5563',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                },
                root: {
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                },
            },
        },
    },
});

// Dark theme settings
const darkTheme = createTheme({
    ...commonSettings,
    palette: {
        mode: 'dark',
        primary: {
            main: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f43f5e',
            light: '#fb7185',
            dark: '#be123c',
            contrastText: '#ffffff',
        },
        success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        info: {
            main: '#0ea5e9',
            light: '#38bdf8',
            dark: '#0284c7',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.5)',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
    },
    components: {
        ...commonSettings.components,
        MuiAppBar: {
            ...commonSettings.components.MuiAppBar,
            styleOverrides: {
                root: {
                    backgroundColor: '#1e1e1e',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#1e1e1e',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                },
            },
        },
        MuiCard: {
            ...commonSettings.components.MuiCard,
            styleOverrides: {
                root: {
                    backgroundColor: '#1e1e1e',
                    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.2), 0px 1px 3px rgba(0, 0, 0, 0.3)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none'
                }
            }
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    padding: '8px 16px',
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(99, 102, 241, 0.16)',
                        color: '#6366f1',
                        '&:hover': {
                            backgroundColor: 'rgba(99, 102, 241, 0.24)',
                        },
                        '& .MuiListItemIcon-root': {
                            color: '#6366f1',
                        },
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#121212',
                    color: '#ffffff'
                }
            }
        },
    },
});

export { lightTheme, darkTheme }; 