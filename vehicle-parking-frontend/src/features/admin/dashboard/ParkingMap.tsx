import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  useTheme, 
  Tooltip, 
  CircularProgress,
  Alert,
  ButtonGroup,
  Button 
} from '@mui/material';
import { 
  DirectionsCar, 
  TwoWheeler, 
  ElectricCar,
  AirportShuttle,
  AccessibleForward
} from '@mui/icons-material';
import api from '../../../services/api';

// Slot type icons
const slotTypeIcons = {
  car: <DirectionsCar />,
  motorcycle: <TwoWheeler />,
  van: <AirportShuttle />,
  electric_car: <ElectricCar />,
  disabled: <AccessibleForward />
};

interface ParkingSlot {
  id: string;
  slotNumber: string;
  row: string;
  position: number;
  type: 'car' | 'motorcycle' | 'van' | 'electric_car' | 'disabled';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  isEVChargingAvailable: boolean;
  locationDescription?: string;
}

const ParkingMap: React.FC = () => {
  const theme = useTheme();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [rows, setRows] = useState<string[]>([]);

  // Background colors for different slot statuses
  const statusColors = {
    available: theme.palette.success.light,
    occupied: theme.palette.error.light,
    reserved: theme.palette.warning.light,
    maintenance: theme.palette.grey[400]
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get('/slots');
      
      if (response.data && response.data.slots) {
        setSlots(response.data.slots);
        
        // Extract unique rows
        const uniqueRows = [...new Set(response.data.slots.map((slot: ParkingSlot) => slot.row))].sort();
        setRows(uniqueRows);
        
        // Default select first row
        if (uniqueRows.length > 0 && !selectedRow) {
          setSelectedRow(uniqueRows[0]);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching parking slots:', err);
      setError('Failed to load parking slots. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSlots = () => {
    if (!selectedRow) return [];
    return slots.filter(slot => slot.row === selectedRow);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Parking Map
      </Typography>
      
      {/* Row Selector */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Select Row:
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          {rows.map(row => (
            <Button 
              key={row}
              onClick={() => setSelectedRow(row)}
              variant={selectedRow === row ? 'contained' : 'outlined'}
            >
              {row}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Parking Grid */}
      <Box sx={{ overflowX: 'auto' }}>
        <Grid container spacing={1}>
          {getFilteredSlots().map((slot) => (
            <Grid item key={slot.id}>
              <Tooltip 
                title={
                  <>
                    <Typography variant="body2">Slot: {slot.slotNumber}</Typography>
                    <Typography variant="body2">Type: {slot.type}</Typography>
                    <Typography variant="body2">Status: {slot.status}</Typography>
                    {slot.locationDescription && (
                      <Typography variant="body2">Location: {slot.locationDescription}</Typography>
                    )}
                  </>
                }
                arrow
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: statusColors[slot.status],
                    borderRadius: '4px',
                    p: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 2
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      color: theme.palette.getContrastText(statusColors[slot.status])
                    }}
                  >
                    {slotTypeIcons[slot.type]}
                  </Box>
                  <Typography 
                    variant="caption"
                    sx={{ 
                      fontSize: '0.6rem', 
                      color: theme.palette.getContrastText(statusColors[slot.status])
                    }}
                  >
                    {slot.slotNumber}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: statusColors.available, borderRadius: '2px' }} />
          <Typography variant="caption">Available</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: statusColors.occupied, borderRadius: '2px' }} />
          <Typography variant="caption">Occupied</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: statusColors.reserved, borderRadius: '2px' }} />
          <Typography variant="caption">Reserved</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: statusColors.maintenance, borderRadius: '2px' }} />
          <Typography variant="caption">Maintenance</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ParkingMap; 