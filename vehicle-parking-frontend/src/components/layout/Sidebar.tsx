import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DirectionsCar as DirectionsCarIcon,
  LocalParking as LocalParkingIcon,
  BookOnline as BookOnlineIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { getStoredUser, getFullName, logoutUser } from '../../utils/authWrapper';
import { hasRole } from '../../utils/auth';
import { alpha } from '@mui/material/styles';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: "permanent" | "persistent" | "temporary";
  width?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant, width = 260 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const isAdmin = hasRole('admin');

  const userNavItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      text: 'My Vehicles',
      icon: <DirectionsCarIcon />,
      path: '/my-vehicles',
    },
    {
      text: 'Request Parking',
      icon: <LocalParkingIcon />,
      path: '/request-parking',
    },
    {
      text: 'My Bookings',
      icon: <BookOnlineIcon />,
      path: '/my-bookings',
    },
  ];

  const adminNavItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
    },
    {
      text: 'Parking Bookings',
      icon: <BookOnlineIcon />,
      path: '/admin/bookings',
    },
    {
      text: 'User Management',
      icon: <PeopleIcon />,
      path: '/admin/users',
    },
    {
      text: 'Parking Slots',
      icon: <LocalParkingIcon />,
      path: '/admin/slots',
    },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const drawerContent = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
    }}>
      {/* Logo & Brand Section */}
      <Box 
        sx={{ 
          p: 3,
          display: 'flex', 
          alignItems: 'center',
          height: '64px',
        }}
      >
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 700, 
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            '& svg': {
              mr: 1,
              fontSize: 24,
            }
          }}
        >
          <LocalParkingIcon /> Park Easy
        </Typography>
        
        {variant === 'temporary' && (
          <IconButton 
            onClick={onClose}
            sx={{ 
              ml: 'auto',
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#fff',
              }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* User Profile Section - Simplified */}
      <Box 
        sx={{ 
          px: 3, 
          py: 2,
          display: 'flex', 
          alignItems: 'center',
        }}
      >
        <Avatar 
          sx={{ 
            width: 40, 
            height: 40,
            bgcolor: alpha('#fff', 0.2),
            color: '#fff',
          }}
        >
          {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
        
        <Box sx={{ ml: 2, overflow: 'hidden' }}>
          <Typography 
            variant="subtitle1" 
            noWrap
            sx={{ 
              color: '#fff',
              fontWeight: 600,
            }}
          >
            {getFullName(user) || 'User'}
          </Typography>
          <Typography 
            variant="body2" 
            noWrap
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
            }}
          >
            {isAdmin ? 'Administrator' : 'User'}
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', my: 1 }} />
      
      {/* Navigation Links */}
      <List component="nav" sx={{ px: 2, flex: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: alpha('#fff', 0.15),
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.25),
                  }
                },
                '&:hover': {
                  bgcolor: alpha('#fff', 0.1),
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive(item.path) ? '#fff' : 'rgba(255, 255, 255, 0.7)', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: 14,
                  fontWeight: isActive(item.path) ? 600 : 400,
                  color: isActive(item.path) ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', my: 1 }} />
      
      {/* Account Section */}
      <List sx={{ px: 2 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => handleNavigate(isAdmin ? '/admin/profile' : '/profile')}
            sx={{
              borderRadius: 1,
              '&:hover': {
                bgcolor: alpha('#fff', 0.1),
              }
            }}
          >
            <ListItemIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', minWidth: 40 }}>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Profile" 
              primaryTypographyProps={{ 
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              '&:hover': {
                bgcolor: alpha('#fff', 0.1),
              }
            }}
          >
            <ListItemIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ 
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: width, 
          boxSizing: 'border-box',
          bgcolor: '#1a237e', // Deep blue background
          backgroundImage: 'linear-gradient(rgba(26, 35, 126, 0.8), rgba(26, 35, 126, 0.95))',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar; 