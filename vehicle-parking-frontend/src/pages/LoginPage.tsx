import React, { useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Grid,
  Avatar,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../app/store';
import { loginUser, reset } from '../features/auth/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user, isLoading, isError, isSuccess, message } = useAppSelector(
    (state) => state.auth
  );
  
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: (values) => {
      dispatch(loginUser(values));
    },
  });
  
  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (user) {
      // Prevent navigation loop by checking URL first
      const currentPath = window.location.pathname;
      const targetPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      
      // Only navigate if we're not already on the target path
      if (currentPath !== targetPath) {
        navigate(targetPath);
      }
    }
    
    // Reset the auth state on component unmount
    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch]);
  
  useEffect(() => {
    // If login is successful, redirect to appropriate dashboard
    if (isSuccess && user) {
      // Prevent rapid navigation by waiting a short delay
      const redirectTimeout = setTimeout(() => {
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      }, 100);
      
      // Clean up timeout if component unmounts
      return () => clearTimeout(redirectTimeout);
    }
  }, [isSuccess, user, navigate]);
  
  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign In
            </Typography>
          </Box>
          
          {isError && <ErrorAlert error={message} />}
          
          <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            {isLoading && <LoadingSpinner size={30} center={false} />}
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 