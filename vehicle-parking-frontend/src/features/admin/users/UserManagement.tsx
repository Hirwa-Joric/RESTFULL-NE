import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Check, Close, HowToReg, PersonOff } from '@mui/icons-material';
import api from '../../../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  status: 'pending_approval' | 'active' | 'suspended';
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchPendingUsers();
    fetchAllUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/pending-approvals');
      
      // Extract users from the response - users are in response.data.users
      const users = response.data.users || [];
      setPendingUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError('Failed to load pending user approvals');
      setPendingUsers([]); // Initialize as empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      
      // Extract users from the response - users are in response.data.users
      const users = response.data.users || [];
      setAllUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error('Error fetching all users:', err);
      setError('Failed to load users');
      setAllUsers([]); // Initialize as empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setActionInProgress(userId);
    try {
      await api.put(`/users/${userId}/approve`);
      // Update both lists
      setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      fetchAllUsers(); // Refresh all users list
    } catch (err) {
      console.error('Error approving user:', err);
      setError('Failed to approve user');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setActionInProgress(userId);
    try {
      await api.put(`/users/${userId}/reject`);
      // Update both lists
      setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      fetchAllUsers(); // Refresh all users list
    } catch (err) {
      console.error('Error rejecting user:', err);
      setError('Failed to reject user');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusChip = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    let icon = null;

    switch (status) {
      case 'active':
        color = 'success';
        icon = <HowToReg fontSize="small" />;
        break;
      case 'pending_approval':
        color = 'warning';
        break;
      case 'suspended':
        color = 'error';
        icon = <PersonOff fontSize="small" />;
        break;
    }

    return (
      <Chip 
        color={color} 
        label={status.replace('_', ' ')} 
        size="small"
        icon={icon}
      />
    );
  };

  // Pending Users Table
  const renderPendingUsersTable = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (pendingUsers.length === 0) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <Typography variant="subtitle1">No pending approval requests</Typography>
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<Check />}
                      onClick={() => handleApproveUser(user.id)}
                      disabled={actionInProgress === user.id}
                    >
                      {actionInProgress === user.id ? <CircularProgress size={24} /> : 'Approve'}
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<Close />}
                      onClick={() => handleRejectUser(user.id)}
                      disabled={actionInProgress === user.id}
                    >
                      {actionInProgress === user.id ? <CircularProgress size={24} /> : 'Reject'}
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // All Users Table
  const renderAllUsersTable = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (allUsers.length === 0) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <Typography variant="subtitle1">No users found</Typography>
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    color={user.role === 'admin' ? 'primary' : 'default'} 
                    label={user.role} 
                    size="small"
                  />
                </TableCell>
                <TableCell>{getStatusChip(user.status)}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={user.status === 'active'}
                    onClick={() => handleApproveUser(user.id)}
                  >
                    Activate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <Paper sx={{ p: 1, mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label="Pending Approvals" />
          <Tab label="All Users" />
        </Tabs>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        {tabValue === 0 ? renderPendingUsersTable() : renderAllUsersTable()}
      </Paper>
    </Box>
  );
};

export default UserManagement; 