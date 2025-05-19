import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tab,
  Tabs,
  useTheme,
  styled
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { alpha } from '@mui/material/styles';

// Mock data for the charts
const dailyData = [
  { time: '00:00', occupied: 5, available: 25 },
  { time: '03:00', occupied: 3, available: 27 },
  { time: '06:00', occupied: 8, available: 22 },
  { time: '09:00', occupied: 25, available: 5 },
  { time: '12:00', occupied: 18, available: 12 },
  { time: '15:00', occupied: 22, available: 8 },
  { time: '18:00', occupied: 20, available: 10 },
  { time: '21:00', occupied: 12, available: 18 },
];

const weeklyData = [
  { day: 'Mon', occupied: 35, available: 15 },
  { day: 'Tue', occupied: 28, available: 22 },
  { day: 'Wed', occupied: 32, available: 18 },
  { day: 'Thu', occupied: 40, available: 10 },
  { day: 'Fri', occupied: 38, available: 12 },
  { day: 'Sat', occupied: 30, available: 20 },
  { day: 'Sun', occupied: 25, available: 25 },
];

const monthlyData = [
  { week: 'Week 1', occupied: 150, available: 100 },
  { week: 'Week 2', occupied: 180, available: 70 },
  { week: 'Week 3', occupied: 200, available: 50 },
  { week: 'Week 4', occupied: 170, available: 80 },
];

const StyledTooltipContent = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: 8,
  padding: theme.spacing(1.5),
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <StyledTooltipContent>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography 
            key={`item-${index}`} 
            variant="body2" 
            sx={{ 
              color: entry.color,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                display: 'inline-block', 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                backgroundColor: entry.color,
                mr: 1
              }} 
            />
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </StyledTooltipContent>
    );
  }

  return null;
};

interface DashboardChartProps {
  chartType?: 'bar' | 'line' | 'area';
}

const DashboardChartComponent: React.FC<DashboardChartProps> = ({ chartType = 'bar' }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getActiveData = () => {
    switch(tabValue) {
      case 0:
        return {
          data: dailyData,
          xDataKey: 'time',
        };
      case 1:
        return {
          data: weeklyData,
          xDataKey: 'day',
        };
      case 2:
        return {
          data: monthlyData,
          xDataKey: 'week',
        };
      default:
        return {
          data: dailyData,
          xDataKey: 'time',
        };
    }
  };

  const { data, xDataKey } = getActiveData();

  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.success.main;
  
  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.09)} />
          <XAxis 
            dataKey={xDataKey} 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: alpha('#000', 0.09) }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: alpha('#000', 0.09) }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Line 
            type="monotone" 
            dataKey="occupied" 
            name="Occupied Slots"
            stroke={primaryColor} 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 1 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="available"
            name="Available Slots" 
            stroke={secondaryColor} 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 1 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      );
    } else if (chartType === 'area') {
      return (
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.09)} />
          <XAxis 
            dataKey={xDataKey} 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: alpha('#000', 0.09) }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: alpha('#000', 0.09) }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Area 
            type="monotone" 
            dataKey="occupied" 
            name="Occupied Slots"
            fill={alpha(primaryColor, 0.2)}
            stroke={primaryColor} 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="available" 
            name="Available Slots"
            fill={alpha(secondaryColor, 0.2)}
            stroke={secondaryColor} 
            strokeWidth={2}
          />
        </AreaChart>
      );
    } else {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.09)} />
          <XAxis 
            dataKey={xDataKey} 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: alpha('#000', 0.09) }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: alpha('#000', 0.09) }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Bar 
            dataKey="occupied" 
            name="Occupied Slots"
            fill={primaryColor} 
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
          <Bar 
            dataKey="available" 
            name="Available Slots"
            fill={secondaryColor}
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
        </BarChart>
      );
    }
  };

  return (
    <Box>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ mb: 2 }}
      >
        <Tab label="Daily" />
        <Tab label="Weekly" />
        <Tab label="Monthly" />
      </Tabs>

      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default DashboardChartComponent; 