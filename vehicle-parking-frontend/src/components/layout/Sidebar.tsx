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
  Menu as MenuIcon,
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
  backgroundColor: 'var(--sidebar-bg)',
  color: 'var(--sidebar-text)',
}));

const LogoWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  display: 'flex', 
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '72px',
  borderBottom: `1px solid var(--sidebar-hover-bg)`,
}));

const UserProfileWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  display: 'flex',
  alignItems: 'center',
  borderBottom: `1px solid var(--sidebar-hover-bg)`,
  marginBottom: theme.spacing(1),
}));

const SidebarMenu = styled(List)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  '& .MuiListItem-root': {
    marginBottom: theme.spacing(0.5),
  },
}));

const MenuItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1.25, 2),
  margin: theme.spacing(0.5, 0),
  color: 'var(--sidebar-text)',
  '& .MuiListItemIcon-root': {
    color: 'var(--sidebar-text)',
    minWidth: 38,
  },
  '&:hover': {
    backgroundColor: 'var(--sidebar-hover-bg)',
    color: 'var(--sidebar-text-active)',
    '& .MuiListItemIcon-root': {
      color: 'var(--sidebar-text-active)',
    },
  },
  '&.Mui-selected': {
    backgroundColor: 'var(--primary-color)',
    color: 'var(--sidebar-text-active)',
    '&:hover': {
      backgroundColor: 'var(--primary-color)',
    },
    '& .MuiListItemIcon-root': {
      color: 'var(--sidebar-text-active)',
    },
  },
}));

const CategoryLabel = styled(Typography)(({ theme }) => ({
  color: 'var(--sidebar-text)',
  opacity: 0.7,
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  padding: theme.spacing(2, 2.5, 0.5, 2.5),
}));

const LogoutButtonWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 2, 2),
  marginTop: 'auto',
}));

const StyledLogoutButton = styled(ListItemButton)(({ theme }) => ({
  backgroundColor: 'var(--sidebar-hover-bg)',
  color: 'var(--sidebar-text)',
  borderRadius: 8,
  padding: theme.spacing(1.5, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  '&:hover': {
    backgroundColor: 'var(--accent-color-red)',
    color: 'var(--sidebar-text-active)',
    '& .MuiListItemIcon-root': {
      color: 'var(--sidebar-text-active)',
    },
  },
  '& .MuiListItemIcon-root': {
    color: 'var(--sidebar-text)',
    minWidth: 'auto',
    marginRight: theme.spacing(1),
  },
}));

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
    <SidebarRoot sx={{ width: width }}>
      {/* Logo & Brand Section */}
      <LogoWrapper>
        <Typography 
          variant="h5"
          component="div" 
          sx={{ 
            fontWeight: 700, 
            display: 'flex',
            alignItems: 'center',
            color: 'var(--sidebar-text-active)',
            '& svg': {
              mr: 1.5,
              fontSize: 28,
              color: 'var(--primary-color)',
            }
          }}
        >
          <LocalParkingIcon /> ParkShare
        </Typography>
        
        {variant !== 'permanent' && (
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: 'var(--sidebar-text)',
              '&:hover': {
                color: 'var(--sidebar-text-active)',
                backgroundColor: 'var(--sidebar-hover-bg)',
              }
            }}
            size="small"
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        )}
      </LogoWrapper>

      {/* User Profile Section */}
      <UserProfileWrapper>
        <Avatar 
          sx={{ 
            width: 40,
            height: 40,
            bgcolor: 'var(--primary-color)',
            color: 'var(--sidebar-text-active)',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
        
        <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
          <Typography 
            variant="subtitle1" 
            noWrap
            sx={{ 
              fontWeight: 600,
              color: 'var(--sidebar-text-active)',
              lineHeight: 1.3,
            }}
          >
            {getFullName(user) || 'User Name'}
          </Typography>
          <Typography 
            variant="body2" 
            noWrap
            sx={{ 
              color: 'var(--sidebar-text)',
              opacity: 0.8,
              fontSize: '0.8rem',
            }}
          >
            {isAdmin ? 'Administrator' : 'Member'}
          </Typography>
        </Box>
      </UserProfileWrapper>
      
      {/* Main Navigation */}
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        <CategoryLabel>Menu</CategoryLabel>
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
      </Box>
      
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
                primary="Logout" 
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

      {/* Logout Button Section - styled like "Add files" */}
      <LogoutButtonWrapper>
        <StyledLogoutButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500 }} />
        </StyledLogoutButton>
      </LogoutButtonWrapper>
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