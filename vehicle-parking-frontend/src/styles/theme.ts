import { createTheme } from '@mui/material/styles';

// Define custom color palette based on the clean, modern dashboard design
const colors = {
  primary: {
    main: '#2E7D32', // Green shade for primary
    light: '#4CAF50',
    dark: '#1B5E20',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#5C6BC0', // Indigo shade for secondary
    light: '#7986CB',
    dark: '#3F51B5',
    contrastText: '#ffffff',
  },
  error: {
    main: '#F44336',
    light: '#EF5350',
    dark: '#D32F2F',
    contrastText: '#fff',
  },
  warning: {
    main: '#FFA726',
    light: '#FFB74D',
    dark: '#F57C00',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  info: {
    main: '#29B6F6',
    light: '#4FC3F7',
    dark: '#0288D1',
    contrastText: '#fff',
  },
  success: {
    main: '#66BB6A',
    light: '#81C784',
    dark: '#388E3C',
    contrastText: '#fff',
  },
  background: {
    default: '#F5F7FA',
    paper: '#ffffff',
  },
  text: {
    primary: '#2D3748',
    secondary: '#718096',
    disabled: '#A0AEC0',
  },
  grey: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  },
};

// Create theme
const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    success: colors.success,
    background: colors.background,
    text: colors.text,
    grey: colors.grey,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // Increased border radius for modern look
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ...Array(14).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 16px',
          boxShadow: 'none',
          fontWeight: 500,
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          background: colors.primary.main,
          '&:hover': {
            background: colors.primary.dark,
          },
        },
        containedSecondary: {
          background: colors.secondary.main,
          '&:hover': {
            background: colors.secondary.dark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          background: '#FFFFFF',
          color: colors.text.primary,
          borderBottom: `1px solid ${colors.grey[200]}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: colors.grey[900],
          color: '#FFFFFF',
          borderRight: 'none',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          padding: '8px 16px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.grey[200]}`,
          padding: '16px',
        },
        head: {
          fontWeight: 600,
          color: colors.text.secondary,
          backgroundColor: colors.grey[50],
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: colors.grey[50],
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minWidth: 100,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
        },
      },
    },
  },
});

export default theme; 