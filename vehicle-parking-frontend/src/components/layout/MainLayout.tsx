import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, useMediaQuery } from '@mui/material';
import type { Theme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { getStoredUser } from '../../utils/authWrapper';
import { useTheme } from '@mui/material/styles';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const user = getStoredUser();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Calculate sidebar width
  const sidebarWidth = 260;

  return (
    <Box 
      sx={{ 
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {user && (
        <Sidebar
          open={isMobile ? sidebarOpen : true}
          onClose={() => setSidebarOpen(false)}
          variant={isMobile ? "temporary" : "permanent"}
          width={sidebarWidth}
        />
      )}
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${sidebarWidth}px)` },
          ml: { md: `${sidebarWidth}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        <Container 
          maxWidth="xl" 
          sx={{ 
            flexGrow: 1, 
            py: 3,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout; 