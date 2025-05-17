import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  CalendarMonth,
  AccessTime,
  DirectionsCar,
  LocalParking,
  ElectricCar,
  LocationOn,
  TwoWheeler,
  AirportShuttle,
  AccessibleForward,
  Directions
} from '@mui/icons-material';
import api from '../../services/api';
import ParkingOccupancyVisual from './ParkingOccupancyVisual';

// Type definitions
interface Vehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  type: string;
}

interface ParkingSlot {
  id: string;
  slotNumber: string;
  locationDescription: string;
  type: string;
  status: string;
  isEVChargingAvailable: boolean;
}

interface BookingRequest {
  vehicleId: string;
  requestedStartTime: Date | null;
  requestedEndTime: Date | null;
  notes: string;
}

const initialBookingState: BookingRequest = {
  vehicleId: '',
  requestedStartTime: null,
  requestedEndTime: null,
  notes: ''
};

const ParkingRequestForm: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [availableSlots, setAvailableSlots] = useState<ParkingSlot[]>([]);
  const [booking, setBooking] = useState<BookingRequest>(initialBookingState);
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetchUserVehicles();
  }, []);

  // Fetch user vehicles on component mount
  const fetchUserVehicles = async () => {
    try {
      setVehiclesLoading(true);
      const response = await api.get('/vehicles');
      console.log('Vehicles API response:', response.data);
      
      // Ensure that vehicles is always an array, even if API returns unexpected format
      let vehiclesArray = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          vehiclesArray = response.data;
        } else if (response.data.vehicles && Array.isArray(response.data.vehicles)) {
          vehiclesArray = response.data.vehicles;
        } else {
          // Try to find any array property in the response
          const potentialArrayProps = Object.keys(response.data || {})
            .filter(key => Array.isArray(response.data[key]));
          
          if (potentialArrayProps.length > 0) {
            // Use the first array property found
            vehiclesArray = response.data[potentialArrayProps[0]];
            console.log(`Using ${potentialArrayProps[0]} as vehicles array`);
          } else {
            console.error('Vehicles API response is not in expected format:', response.data);
          }
        }
      }
      
      setVehicles(Array.isArray(vehiclesArray) ? vehiclesArray : []);
      
      if (vehiclesArray.length === 0) {
        setError('You need to register a vehicle before you can request parking');
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load your vehicles');
      setSnackbarOpen(true);
      setVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  };

  // Fetch available slots based on selected vehicle type and time
  const fetchAvailableSlots = async () => {
    if (!selectedVehicle || !booking.requestedStartTime || !booking.requestedEndTime) {
      return;
    }

    try {
      setSlotsLoading(true);
      
      // Format dates for API request
      const startTime = booking.requestedStartTime.toISOString();
      const endTime = booking.requestedEndTime.toISOString();
      
      // This would ideally be a dedicated API endpoint that checks slot availability for the given time period
      // For now, we're just fetching all available slots that match the vehicle type
      const response = await api.get('/slots', {
        params: {
          status: 'available',
          type: selectedVehicle.type
        }
      });
      
      // Log the response structure to debug
      console.log('Available slots API response:', response.data);
      
      // Ensure that slots is always an array, even if API returns unexpected format
      let slotsArray = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          slotsArray = response.data;
        } else if (response.data.slots && Array.isArray(response.data.slots)) {
          slotsArray = response.data.slots;
        } else {
          // Try to find any array property in the response
          const potentialArrayProps = Object.keys(response.data || {})
            .filter(key => Array.isArray(response.data[key]));
          
          if (potentialArrayProps.length > 0) {
            // Use the first array property found
            slotsArray = response.data[potentialArrayProps[0]];
            console.log(`Using ${potentialArrayProps[0]} as slots array`);
          } else {
            console.error('Slots API response is not in expected format:', response.data);
          }
        }
      }
      
      // Filter slots based on vehicle type if needed
      const filteredSlots = slotsArray.filter((slot: ParkingSlot) => 
        slot.status === 'available' && 
        (slot.type === selectedVehicle.type || 
         (selectedVehicle.type === 'electric_car' && slot.isEVChargingAvailable))
      );
      
      setAvailableSlots(filteredSlots);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      setError('Failed to load available parking slots');
      setSnackbarOpen(true);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (booking.vehicleId && booking.requestedStartTime && booking.requestedEndTime) {
      const vehicle = vehicles.find(v => v.id === booking.vehicleId) || null;
      setSelectedVehicle(vehicle);
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedVehicle(null);
    }
  }, [booking.vehicleId, booking.requestedStartTime, booking.requestedEndTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setBooking(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDateChange = (fieldName: string, date: Date | null) => {
    setBooking(prev => ({
      ...prev,
      [fieldName]: date
    }));
  };

  const validateBookingRequest = (): boolean => {
    if (!booking.vehicleId) {
      setError('Please select a vehicle');
      setSnackbarOpen(true);
      return false;
    }

    if (!booking.requestedStartTime || !booking.requestedEndTime) {
      setError('Please select both start and end times for your parking request');
      setSnackbarOpen(true);
      return false;
    }

    if (booking.requestedStartTime >= booking.requestedEndTime) {
      setError('End time must be after start time');
      setSnackbarOpen(true);
      return false;
    }

    const now = new Date();
    if (booking.requestedStartTime < now) {
      setError('Start time cannot be in the past');
      setSnackbarOpen(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateBookingRequest()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookingData = {
        vehicleId: booking.vehicleId,
        requestedStartTime: booking.requestedStartTime?.toISOString(),
        requestedEndTime: booking.requestedEndTime?.toISOString(),
        notes: booking.notes
      };

      await api.post('/bookings/request', bookingData);
      
      setSuccessMsg('Parking request submitted successfully! Waiting for admin approval.');
      setBooking(initialBookingState);
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Error submitting booking request:', err);
      setError(err.response?.data?.message || 'Failed to submit parking request');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Get icon based on vehicle type
  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'car':
        return <DirectionsCar />;
      case 'electric_car':
        return <ElectricCar />;
      case 'motorcycle':
        return <TwoWheeler />;
      case 'van':
        return <AirportShuttle />;
      case 'disabled':
        return <AccessibleForward />;
      default:
        return <DirectionsCar />;
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Parking Availability
      </Typography>
      
      {/* Parking visualization component */}
      <Box sx={{ 
        mb: 6, 
        // Add a slight gradient background to visually separate the sections
        backgroundColor: 'rgba(245, 247, 250, 0.5)',
        borderRadius: 2,
        p: 2
      }}>
        <ParkingOccupancyVisual />
      </Box>
      
      <Paper sx={{ 
        p: { xs: 2, sm: 3 }, 
        mt: 4, 
        mb: 4,
        borderRadius: 2,
        boxShadow: 2,
        borderTop: (theme) => `4px solid ${theme.palette.primary.main}`
      }}>
        <Typography variant="h6" gutterBottom>
          Request Parking
        </Typography>
        
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="vehicle-select-label">Select Vehicle</InputLabel>
                <Select
                  labelId="vehicle-select-label"
                  id="vehicle-select"
                  name="vehicleId"
                  value={booking.vehicleId}
                  onChange={handleInputChange}
                  disabled={vehiclesLoading || loading}
                  label="Select Vehicle"
                >
                  {vehicles.length === 0 ? (
                    <MenuItem disabled value="">
                      No vehicles available
                    </MenuItem>
                  ) : (
                    vehicles.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          width: '100%'
                        }}>
                          <Box sx={{ 
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText',
                            mr: 1.5
                          }}>
                            {getVehicleTypeIcon(vehicle.type)}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {vehicle.licensePlate}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {vehicle.make} {vehicle.model} ({vehicle.color})
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <DateTimePicker
                label="Start Time"
                value={booking.requestedStartTime}
                onChange={(newValue) => handleDateChange('requestedStartTime', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    InputProps: {
                      startAdornment: (
                        <CalendarMonth color="action" sx={{ mr: 1 }} />
                      ),
                    },
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <DateTimePicker
                label="End Time"
                value={booking.requestedEndTime}
                onChange={(newValue) => handleDateChange('requestedEndTime', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    InputProps: {
                      startAdornment: (
                        <AccessTime color="action" sx={{ mr: 1 }} />
                      ),
                    },
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                id="notes"
                name="notes"
                label="Notes (Optional)"
                value={booking.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
                fullWidth
                placeholder="Add any additional information or special requests here"
                InputProps={{
                  startAdornment: (
                    <Directions color="action" sx={{ mr: 1, mt: 1.5 }} />
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ textAlign: 'right', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                disabled={loading || vehiclesLoading || !booking.vehicleId || !booking.requestedStartTime || !booking.requestedEndTime}
                onClick={handleSubmit}
                sx={{ 
                  minWidth: 180,
                  height: 48,
                  borderRadius: 2
                }}
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <LocalParking />}
              >
                {loading ? 'Submitting...' : 'Submit Parking Request'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ParkingRequestForm; 