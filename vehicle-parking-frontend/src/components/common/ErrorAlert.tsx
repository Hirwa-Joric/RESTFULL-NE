import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';

interface ErrorAlertProps {
  error: string | null;
  onRetry?: () => void;
  severity?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onRetry,
  severity = 'error',
  title = 'Error',
}) => {
  if (!error) return null;

  return (
    <Box sx={{ my: 2 }}>
      <Alert
        severity={severity}
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {error}
      </Alert>
    </Box>
  );
};

export default ErrorAlert; 