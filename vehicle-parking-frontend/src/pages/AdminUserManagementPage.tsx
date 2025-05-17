import React from 'react';
import { Box, Typography } from '@mui/material';
import { People } from '@mui/icons-material';
import UserManagement from '../features/admin/users/UserManagement';

const AdminUserManagementPage: React.FC = () => {
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <People color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4" component="h1">User Management</Typography>
      </Box>
      
      <UserManagement />
    </Box>
  );
};

export default AdminUserManagementPage; 