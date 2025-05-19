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
  Avatar,
  Typography,
  IconButton,
  styled,
  Badge,
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
  Notifications as NotificationsIcon,
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

// Styled components for the sidebar
const SidebarRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#fff',
  color: theme.palette.text.primary,
  borderRight: `1px solid ${theme.palette.grey[200]}`,
}));

const LogoWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex', 
  alignItems: 'center',
  height: '72px',
  borderBottom: `1px solid ${theme.palette.grey[100]}`,
}));

const SidebarMenu = styled(List)(({ theme }) => ({
  padding: theme.spacing(2),
  '& .MuiListItem-root': {
    marginBottom: theme.spacing(0.5),
  },
}));

const MenuItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 2),
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[500], 0.08),
  },
}));

const CategoryLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  padding: theme.spacing(0, 2, 1, 2),
  marginTop: theme.spacing(2),
}));

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant, width = 280 }) => {
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
    <SidebarRoot>
      {/* Logo & Brand Section */}
      <LogoWrapper>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 700, 
            display: 'flex',
            alignItems: 'center',
            '& svg': {
              mr: 1,
              fontSize: 24,
              color: 'primary.main',
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
              color: 'text.secondary',
            }}
            size="small"
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </LogoWrapper>

      {/* User Profile Section */}
      <Box 
        sx={{ 
          px: 3, 
          py: 2,
          display: 'flex', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'grey.100',
        }}
      >
        <Avatar 
          sx={{ 
            width: 42, 
            height: 42,
            bgcolor: 'primary.light',
          }}
        >
          {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
        
        <Box sx={{ ml: 2, overflow: 'hidden' }}>
          <Typography 
            variant="subtitle1" 
            noWrap
            sx={{ 
              fontWeight: 600,
            }}
          >
            {getFullName(user) || 'User'}
          </Typography>
          <Typography 
            variant="body2" 
            noWrap
            sx={{ 
              color: 'text.secondary', 
            }}
          >
            {isAdmin ? 'Administrator' : 'User'}
          </Typography>
        </Box>
      </Box>
      
      {/* Main Navigation */}
      <CategoryLabel>Main</CategoryLabel>
      <SidebarMenu component="nav">
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <MenuItemButton
              onClick={() => handleNavigate(item.path)}
              selected={isActive(item.path)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: 14,
                  fontWeight: isActive(item.path) ? 600 : 500,
                }}
              />
            </MenuItemButton>
          </ListItem>
        ))}
      </SidebarMenu>
      
      {/* Notifications Section */}
      <CategoryLabel>Notifications</CategoryLabel>
      <SidebarMenu>
        <ListItem disablePadding>
          <MenuItemButton
            onClick={() => handleNavigate('/notifications')}
            selected={isActive('/notifications')}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText 
              primary="Parking Alerts" 
              primaryTypographyProps={{ 
                fontSize: 14,
                fontWeight: 500,
              }}
            />
          </MenuItemButton>
        </ListItem>
      </SidebarMenu>
      
      {/* Account Section */}
      <Box sx={{ mt: 'auto' }}>
        <CategoryLabel>Account</CategoryLabel>
        <SidebarMenu>
          <ListItem disablePadding>
            <MenuItemButton
              onClick={() => handleNavigate(isAdmin ? '/admin/profile' : '/profile')}
              selected={isActive(isAdmin ? '/admin/profile' : '/profile')}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText 
                primary="My Profile" 
                primaryTypographyProps={{ 
                  fontSize: 14,
                  fontWeight: 500,
                }}
              />
            </MenuItemButton>
          </ListItem>
          <ListItem disablePadding>
            <MenuItemButton onClick={handleLogout}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Log Out" 
                primaryTypographyProps={{ 
                  fontSize: 14,
                  fontWeight: 500,
                }}
              />
            </MenuItemButton>
          </ListItem>
        </SidebarMenu>
      </Box>
      
      {/* Version Info */}
      <Box sx={{ p: 3, mt: 2, borderTop: 1, borderColor: 'grey.100' }}>
        <Typography variant="caption" color="text.secondary">
          Park Easy v1.0.5
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
          © 2023 Parking Management System
        </Typography>
      </Box>
    </SidebarRoot>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          border: 'none',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar; 