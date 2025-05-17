import { createTheme } from '@mui/material/styles';

// Define custom color palette based on the dashboard design
const colors = {
  primary: {
    main: '#3366FF',
    light: '#6690FF',
    dark: '#1939B7',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#38CB89',
    light: '#70E1B3',
    dark: '#25965E',
    contrastText: '#ffffff',
  },
  error: {
    main: '#FF5630',
    light: '#FF8F73',
    dark: '#DE350B',
    contrastText: '#fff',
  },
  warning: {
    main: '#FFAB00',
    light: '#FFD666',
    dark: '#B76E00',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  info: {
    main: '#2684FF',
    light: '#69A9FF',
    dark: '#0055CC',
    contrastText: '#fff',
  },
  success: {
    main: '#36B37E',
    light: '#79F2C0',
    dark: '#006644',
    contrastText: '#fff',
  },
  background: {
    default: '#F7F9FC',
    paper: '#ffffff',
  },
  text: {
    primary: '#172B4D',
    secondary: '#6B778C',
    disabled: '#97A0AF',
  },
  grey: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
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
      fontSize: '1.1rem',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.9rem',
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
    borderRadius: 8,
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
          borderRadius: 6,
          padding: '8px 16px',
          boxShadow: 'none',
          fontWeight: 500,
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(51, 102, 255, 0.15)',
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
          borderRadius: 8,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          overflow: 'visible',
          '&:hover': {
            boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          background: '#FFFFFF',
          color: colors.text.primary,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #2B3674 0%, #2536A7 100%)',
          color: '#FFFFFF',
          borderRight: 'none',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '2px 8px',
          padding: '8px 16px',
          '&:hover': {
            backgroundColor: 'rgba(51, 102, 255, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E5E7EB',
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
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme; 