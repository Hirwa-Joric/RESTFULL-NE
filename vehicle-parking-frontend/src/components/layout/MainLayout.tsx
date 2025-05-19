import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, useMediaQuery, styled } from '@mui/material';
import type { Theme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { getStoredUser } from '../../utils/authWrapper';
import { useTheme } from '@mui/material/styles';

const StyledMainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: 'var(--page-bg)',
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

// Define interface for custom props so we can filter them properly
interface ContentSheetProps {
  sidebarVisible?: boolean;
  sidebarWidth?: number;
}

// Use shouldForwardProp to filter out our custom props
const ContentSheet = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'sidebarVisible' && prop !== 'sidebarWidth'
})<ContentSheetProps>(({ theme, sidebarVisible, sidebarWidth }) => ({
  flexGrow: 1,
  backgroundColor: 'var(--content-sheet-bg)', // Use new light gray background
  borderRadius: '16px',
  boxShadow: '0px 0px 25px rgba(255, 255, 255, 0.07)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  transition: theme.transitions.create(['margin-left', 'width'], {
    easing: sidebarVisible ? theme.transitions.easing.easeOut : theme.transitions.easing.sharp,
    duration: sidebarVisible ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
  }),
}));

const PageContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflowY: 'auto',
  backgroundColor: 'transparent', // Inherits from parent ContentSheet
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isPermanentSidebar = useMediaQuery(theme.breakpoints.up('md'));
  const [sidebarOpen, setSidebarOpen] = useState(isPermanentSidebar);
  const user = getStoredUser();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const effectiveSidebarWidth = 260;

  useEffect(() => {
    if (isPermanentSidebar) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isPermanentSidebar]);

  const sidebarActuallyVisible = user && (isPermanentSidebar || sidebarOpen);

  return (
    <StyledMainContainer>
      {user && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          variant={isPermanentSidebar ? "permanent" : "temporary"}
          width={effectiveSidebarWidth}
        />
      )}
      
      <ContentSheet sidebarVisible={sidebarActuallyVisible} sidebarWidth={effectiveSidebarWidth}>
        {user && <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />}
        
        <PageContent>
          <Outlet />
        </PageContent>
      </ContentSheet>
    </StyledMainContainer>
  );
};

export default MainLayout; 