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
  Button,
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
  ArrowDropDown as ArrowDropDownIcon,
  DirectionsCar as DirectionsCarIcon,
} from '@mui/icons-material';
import { getStoredUser, getFullName, logoutUser } from '../../utils/authWrapper';
import { hasRole } from '../../utils/auth';
import { alpha } from '@mui/material/styles';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  borderBottom: `1px solid var(--border-color)`,
  backgroundColor: 'transparent',
  height: '72px',
  boxShadow: 'none',
  color: 'var(--text-primary)',
  borderTopLeftRadius: '16px',
  borderTopRightRadius: '16px',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: '72px',
  padding: theme.spacing(0, 3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 2),
  },
}));

const SearchBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: '10px',
  backgroundColor: 'var(--content-bg)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[400], 0.30),
  },
  width: '100%',
  maxWidth: '400px',
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(1),
  [theme.breakpoints.down('md')]: {
    maxWidth: '280px',
  },
  [theme.breakpoints.down('sm')]: {
    flexGrow: 1,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
}));

const SearchIconWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 1.5),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-secondary)',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'var(--text-primary)',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(3.5)})`,
    width: '100%',
    fontSize: '0.9rem',
    '&::placeholder': {
      color: 'var(--text-secondary)',
      opacity: 1,
    }
  },
}));

const ProfileButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius * 5,
  transition: 'background-color 0.2s',
  padding: theme.spacing(0.5, 0.5, 0.5, 1),
  marginLeft: theme.spacing(1),
  '&:hover': {
    backgroundColor: 'var(--content-bg)',
  },
}));

const IconButtonStyled = styled(IconButton)(({ theme }) => ({
  color: 'var(--text-secondary)',
  marginLeft: theme.spacing(0.5),
  marginRight: theme.spacing(0.5),
  padding: theme.spacing(1),
  '&:hover': {
    backgroundColor: 'var(--content-bg)',
    color: 'var(--text-primary)',
  },
}));

const PrimaryActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'var(--primary-color)',
  color: 'var(--sidebar-text-active)',
  padding: theme.spacing(0.75, 2.5),
  marginLeft: theme.spacing(1.5),
  borderRadius: '10px',
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.dark, 0.8),
    boxShadow: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none',
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
        <IconButton
          aria-label="open drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{
            mr: 1,
            color: 'var(--text-secondary)',
            display: { xs: 'flex', md: 'none' }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <SearchBox>
          <SearchIconWrapper>
            <SearchIcon sx={{ fontSize: 22 }} />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search something..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </SearchBox>

        <Box sx={{ flexGrow: 1 }} />

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PrimaryActionButton 
              variant="contained" 
              startIcon={<DirectionsCarIcon sx={{ fontSize: 18 }} />}
            >
              New Booking
            </PrimaryActionButton>

            <Tooltip title="Notifications">
              <IconButtonStyled size="medium">
                <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 15, minWidth: 15, p: '0 4px' } }}>
                  <NotificationsIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButtonStyled>
            </Tooltip>
            
            <Tooltip title="Account settings">
              <ProfileButton onClick={handleMenu}>
                <Avatar 
                  sx={{ 
                    width: 32,
                    height: 32,
                    bgcolor: 'var(--secondary-color)',
                    fontSize: '0.875rem',
                    color: 'var(--sidebar-text-active)',
                  }}
                >
                  {user?.firstName?.charAt(0)?.toUpperCase() || <AccountCircle />}
                </Avatar>
                {!isMobile && (
                  <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2"
                      sx={{ fontWeight: 600, color: 'var(--text-primary)' }}
                    >
                      {getFullName(user)?.split(' ')[0]}
                    </Typography>
                    <ArrowDropDownIcon sx={{ color: 'var(--text-secondary)', fontSize: 20, ml: 0.5 }}/>
                  </Box>
                )}
                {isMobile && (
                     <ArrowDropDownIcon sx={{ color: 'var(--text-secondary)', fontSize: 20, ml: 0.5 }}/>
                )}
              </ProfileButton>
            </Tooltip>
            
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
                elevation: 0,
                sx: {
                  mt: 1.5,
                  minWidth: 220,
                  borderRadius: 2,
                  overflow: 'visible',
                  border: `1px solid var(--border-color)`,
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'var(--card-bg)',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                    borderTop: `1px solid var(--border-color)`,
                    borderLeft: `1px solid var(--border-color)`,
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
                <PersonIcon fontSize="small" sx={{ mr: 1.5, color: 'var(--text-secondary)' }} />
                <Typography variant="body2">My Profile</Typography>
              </MenuItem>
              
              <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
                <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: 'var(--text-secondary)' }} />
                <Typography variant="body2">Settings</Typography>
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: 'var(--accent-color-red)', fontSize: 20 }} />
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