import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const PreviousAnalysis: React.FC = () => {
  return (
    <Box sx={{ mb: 3 }}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Previous Parking Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          In a simplified version of this system, previous parking records would be 
          displayed here. This could include historical booking data and trends.
        </Typography>
      </Paper>
    </Box>
  );
};

export default PreviousAnalysis; 