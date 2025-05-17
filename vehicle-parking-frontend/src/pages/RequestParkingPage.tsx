import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Alert, 
  Snackbar, 
  CircularProgress,
  FormHelperText
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { LocalParking } from '@mui/icons-material';
import api from '../services/api';

interface Vehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  type: string;
}

const RequestParkingPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  
  // Calculate time ranges for display only
  const startTimeDisplay = new Date(Date.now() + 30 * 60 * 1000).toLocaleString(); 
  const endTimeDisplay = new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleString();
  
  const [vehicleId, setVehicleId] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch user vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const response = await api.get('/vehicles');
        if (response.data && Array.isArray(response.data)) {
          setVehicles(response.data);
        } else if (response.data && response.data.vehicles && Array.isArray(response.data.vehicles)) {
          setVehicles(response.data.vehicles);
        } else {
          setVehicles([]);
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load your vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleVehicleChange = (e: SelectChangeEvent) => {
    setVehicleId(e.target.value);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleId) {
      setError('Please select a vehicle');
      return;
    }

    setLoading(true);
    try {
      // Only send the vehicleId and notes - backend will handle time calculation
      const response = await api.post('/bookings/request', { vehicleId, notes });
      setSuccessMessage(response.data.message || 'Your parking request has been submitted successfully!');
      setSuccess(true);
      setBookingDetails(response.data.booking);
      
      // Reset form state
      setVehicleId('');
      setNotes('');
    } catch (err: any) {
      console.error('Error submitting parking request:', err);
      setError(err.response?.data?.message || 'Failed to submit parking request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <LocalParking color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4" component="h1">Request Parking</Typography>
      </Box>
      
      {bookingDetails ? (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Parking Request Submitted!
          </Typography>
          
          <Box sx={{ mt: 2, mb: 3 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Your parking request has been submitted and is awaiting admin approval.
            </Alert>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Vehicle</Typography>
                <Typography variant="body1" fontWeight="500">{bookingDetails.vehicleDetails}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Requested Start Time</Typography>
                <Typography variant="body1" fontWeight="500">
                  {new Date(bookingDetails.requestedStartTime).toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Requested End Time</Typography>
                <Typography variant="body1" fontWeight="500">
                  {new Date(bookingDetails.requestedEndTime).toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Typography variant="body1" fontWeight="500">
                  {bookingDetails.status === 'pending_approval' ? 'Pending Approval' : bookingDetails.status}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  You will be notified when your parking request is approved. You can view the status of your request in the "My Bookings" section.
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth
            onClick={() => setBookingDetails(null)}
          >
            Request Another Parking Slot
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Request Parking Slot
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Fill out the form below to request a parking slot. Your request will be reviewed by an administrator.
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="vehicle-select-label">Select Vehicle</InputLabel>
                  <Select
                    labelId="vehicle-select-label"
                    id="vehicle-select"
                    value={vehicleId}
                    label="Select Vehicle"
                    onChange={handleVehicleChange}
                    disabled={loading || vehicles.length === 0}
                  >
                    {vehicles.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.licensePlate} - {vehicle.make} {vehicle.model} ({vehicle.color})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  disabled
                  label="Start Time (Auto-calculated)"
                  value={startTimeDisplay}
                  helperText="30 minutes from now"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  disabled
                  label="End Time (Auto-calculated)"
                  value={endTimeDisplay}
                  helperText="3 hours from now"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Additional Notes"
                  multiline
                  rows={2}
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Any special requirements?"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormHelperText>
                  By submitting this request, a slot will be automatically reserved for you starting 30 minutes from now for a duration of 2.5 hours.
                </FormHelperText>
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Parking Request'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message={successMessage}
      />
    </Box>
  );
};

export default RequestParkingPage; 