import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Tooltip,
  useMediaQuery,
  useTheme,
  InputBase,
  Badge,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
  Person,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { getStoredUser, getFullName, logoutUser } from '../../utils/authWrapper';
import { hasRole } from '../../utils/auth';
import NotificationsMenu from '../common/NotificationsMenu';
import { alpha } from '@mui/material/styles';

interface NavbarProps {
  toggleSidebar: () => void;
  sidebarOpen?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, sidebarOpen }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const user = getStoredUser();
  const isAdmin = hasRole('admin');

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutUser();
    handleClose();
    setTimeout(() => {
      navigate('/login');
    }, 50);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleClose();
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        borderBottom: `1px solid ${theme.palette.grey[200]}`,
        height: '64px',
      }}
    >
      <Toolbar sx={{ minHeight: '64px' }}>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        {/* Search bar */}
        <Box 
          sx={{ 
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: alpha(theme.palette.grey[100], 0.85),
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[100], 1),
            },
            width: '100%',
            maxWidth: '320px',
            marginRight: 2,
            [theme.breakpoints.down('sm')]: {
              display: { xs: 'none', sm: 'flex' }
            }
          }}
        >
          <Box sx={{ padding: theme.spacing(0, 2), height: '100%', position: 'absolute', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SearchIcon sx={{ color: theme.palette.grey[500] }} />
          </Box>
          <InputBase
            placeholder="Search…"
            sx={{
              color: 'inherit',
              '& .MuiInputBase-input': {
                padding: theme.spacing(1, 1, 1, 0),
                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                width: '100%',
              },
              width: '100%'
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Notifications */}
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={1} color="error">
                <NotificationsIcon sx={{ color: theme.palette.grey[600] }} />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                borderRadius: 1,
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.grey[200], 0.8),
                },
                ml: 1,
                py: 0.5,
                px: 1
              }} 
              onClick={handleMenu}
            >
              <Avatar 
                sx={{ 
                  width: 35,
                  height: 35,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {user?.firstName?.charAt(0) || <AccountCircle />}
              </Avatar>
              {!isMobile && (
                <Box sx={{ ml: 1 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ fontWeight: 500, lineHeight: 1.2, color: theme.palette.text.primary }}
                  >
                    {user ? getFullName(user) : 'User'}
                  </Typography>
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center', 
                      fontSize: '0.7rem',
                      color: theme.palette.text.secondary 
                    }}
                  >
                    <Box 
                      component="span" 
                      sx={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.success.main,
                        mr: 0.5 
                      }} 
                    />
                    Online
                  </Box>
                </Box>
              )}
            </Box>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                elevation: 1,
                sx: {
                  mt: 1,
                  minWidth: 180,
                  borderRadius: 1,
                  overflow: 'visible',
                  boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user ? getFullName(user) : 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
                <Chip 
                  size="small" 
                  label={isAdmin ? 'Admin' : 'User'}
                  color={isAdmin ? 'primary' : 'default'}
                  sx={{ mt: 1, height: 20, fontSize: '0.7rem' }}
                />
              </Box>
              <Divider />
              <MenuItem onClick={handleProfile} sx={{ py: 1 }}>
                <Person fontSize="small" sx={{ mr: 1.5, fontSize: '1.2rem', color: theme.palette.text.secondary }} />
                <Typography variant="body2">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleSettings} sx={{ py: 1 }}>
                <Settings fontSize="small" sx={{ mr: 1.5, fontSize: '1.2rem', color: theme.palette.text.secondary }} />
                <Typography variant="body2">Settings</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
                <Logout fontSize="small" sx={{ mr: 1.5, fontSize: '1.2rem', color: theme.palette.error.main }} />
                <Typography variant="body2" color="error">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;