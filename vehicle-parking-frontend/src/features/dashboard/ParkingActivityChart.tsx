import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton,
  Paper,
  useTheme
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Mock data - would be fetched from API in real implementation
const dailyData = [
  { time: '00:00', occupied: 5, reserved: 3 },
  { time: '03:00', occupied: 3, reserved: 2 },
  { time: '06:00', occupied: 8, reserved: 4 },
  { time: '09:00', occupied: 25, reserved: 10 },
  { time: '12:00', occupied: 18, reserved: 7 },
  { time: '15:00', occupied: 22, reserved: 9 },
  { time: '18:00', occupied: 20, reserved: 8 },
  { time: '21:00', occupied: 12, reserved: 5 },
];

const weeklyData = [
  { day: 'Mon', occupied: 35, reserved: 15 },
  { day: 'Tue', occupied: 28, reserved: 12 },
  { day: 'Wed', occupied: 32, reserved: 18 },
  { day: 'Thu', occupied: 40, reserved: 20 },
  { day: 'Fri', occupied: 38, reserved: 22 },
  { day: 'Sat', occupied: 30, reserved: 15 },
  { day: 'Sun', occupied: 25, reserved: 10 },
];

const monthlyData = [
  { week: 'Week 1', occupied: 150, reserved: 80 },
  { week: 'Week 2', occupied: 180, reserved: 90 },
  { week: 'Week 3', occupied: 200, reserved: 100 },
  { week: 'Week 4', occupied: 170, reserved: 85 },
];

const ParkingActivityChart: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<string>('daily');

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: string | null,
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  const getActiveData = () => {
    switch(timeRange) {
      case 'daily':
        return {
          data: dailyData,
          xDataKey: 'time',
          xAxisLabel: 'Time of Day'
        };
      case 'weekly':
        return {
          data: weeklyData,
          xDataKey: 'day',
          xAxisLabel: 'Day of Week'
        };
      case 'monthly':
        return {
          data: monthlyData,
          xDataKey: 'week',
          xAxisLabel: 'Week of Month'
        };
      default:
        return {
          data: dailyData,
          xDataKey: 'time',
          xAxisLabel: 'Time of Day'
        };
    }
  };

  const { data, xDataKey, xAxisLabel } = getActiveData();

  return (
    <Paper sx={{ p: 2, my: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Parking Usage Statistics
        </Typography>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          size="small"
          aria-label="time range"
        >
          <ToggleButton value="daily" aria-label="daily">
            Daily
          </ToggleButton>
          <ToggleButton value="weekly" aria-label="weekly">
            Weekly
          </ToggleButton>
          <ToggleButton value="monthly" aria-label="monthly">
            Monthly
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xDataKey} 
              label={{ 
                value: xAxisLabel, 
                position: 'insideBottomRight', 
                offset: -10 
              }} 
            />
            <YAxis 
              label={{ 
                value: 'Number of Slots', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' } 
              }} 
            />
            <Tooltip />
            <Legend />
            <Bar 
              name="Occupied Slots" 
              dataKey="occupied" 
              fill={theme.palette.primary.main} 
              barSize={30}
            />
            <Bar 
              name="Reserved Slots" 
              dataKey="reserved" 
              fill={theme.palette.warning.main} 
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ParkingActivityChart; 