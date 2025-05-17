import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getStoredUser } from '../utils/authWrapper';

const NotFoundPage: React.FC = () => {
  const user = getStoredUser();
  const homePath = user ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login';
  
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', width: '100%' }}>
          <Typography variant="h1" color="primary" sx={{ fontSize: '6rem', fontWeight: 'bold' }}>
            404
          </Typography>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The page you are looking for might have been removed, had its name changed, or is
            temporarily unavailable.
          </Typography>
          <Button
            component={RouterLink}
            to={homePath}
            variant="contained"
            color="primary"
            size="large"
          >
            Go to Homepage
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage; 