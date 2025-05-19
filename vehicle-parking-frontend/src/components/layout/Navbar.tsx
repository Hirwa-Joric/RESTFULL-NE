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
  styled,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { getStoredUser, getFullName, logoutUser } from '../../utils/authWrapper';
import { hasRole } from '../../utils/auth';
import { alpha } from '@mui/material/styles';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: '#fff',
  height: '72px',
  boxShadow: 'none',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: '72px',
  padding: theme.spacing(0, 3),
}));

const SearchBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.grey[100], 0.9),
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[100], 1),
  },
  width: '100%',
  maxWidth: '320px',
  marginRight: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const SearchIconWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
    fontSize: '0.9rem',
  },
}));

const ProfileButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[200], 0.8),
  },
  marginLeft: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
}));

const IconButtonStyled = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginLeft: theme.spacing(1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[200], 0.8),
  },
}));

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
    <StyledAppBar position="sticky">
      <StyledToolbar>
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
        <SearchBox>
          <SearchIconWrapper>
            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search..."
          />
        </SearchBox>

        <Box sx={{ flexGrow: 1 }} />

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Help */}
            <Tooltip title="Help">
              <IconButtonStyled size="medium">
                <HelpIcon fontSize="small" />
              </IconButtonStyled>
            </Tooltip>
            
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButtonStyled size="medium">
                <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 16, minWidth: 16 } }}>
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButtonStyled>
            </Tooltip>

            {/* User Menu */}
            <ProfileButton onClick={handleMenu}>
              <Avatar 
                sx={{ 
                  width: 36,
                  height: 36,
                  backgroundColor: theme.palette.primary.light,
                }}
              >
                {user?.firstName?.charAt(0) || <AccountCircle />}
              </Avatar>
              {!isMobile && (
                <Box sx={{ ml: 1 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {user ? getFullName(user) : 'User'}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ display: 'block', lineHeight: 1.2 }}
                  >
                    {isAdmin ? 'Administrator' : 'User'}
                  </Typography>
                </Box>
              )}
            </ProfileButton>
            
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
                  mt: 1.5,
                  minWidth: 180,
                  borderRadius: 2,
                  overflow: 'visible',
                  boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.08)',
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
              
              <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                <PersonIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                <Typography variant="body2">My Profile</Typography>
              </MenuItem>
              
              <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
                <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                <Typography variant="body2">Settings</Typography>
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                <Typography variant="body2">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        )}
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Navbar;