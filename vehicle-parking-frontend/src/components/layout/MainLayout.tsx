import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, useMediaQuery, styled } from '@mui/material';
import type { Theme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { getStoredUser } from '../../utils/authWrapper';
import { useTheme } from '@mui/material/styles';

const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const ContentContainer = styled(Box)<{ sidebarWidth: number }>(({ theme, sidebarWidth }) => ({
  flexGrow: 1,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  width: { md: `calc(100% - ${sidebarWidth}px)` },
  marginLeft: { md: `${sidebarWidth}px` },
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const PageContent = styled(Container)(({ theme }) => ({
  flexGrow: 1,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const user = getStoredUser();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Calculate sidebar width
  const sidebarWidth = 280;

  return (
    <MainContainer>
      {user && (
        <Sidebar
          open={isMobile ? sidebarOpen : true}
          onClose={() => setSidebarOpen(false)}
          variant={isMobile ? "temporary" : "permanent"}
          width={sidebarWidth}
        />
      )}
      
      <ContentContainer sidebarWidth={sidebarWidth}>
        <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        <PageContent maxWidth="xl">
          <Outlet />
        </PageContent>
      </ContentContainer>
    </MainContainer>
  );
};

export default MainLayout; 