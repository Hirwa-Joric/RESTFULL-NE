import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  DirectionsCar,
  LocalTaxi,
  TwoWheeler,
  AirportShuttle,
  ElectricCar 
} from '@mui/icons-material';
import api from '../../services/api';
import { getStoredUser } from '../../utils/authWrapper';

// Type definitions
interface Vehicle {
  id?: string;
  userId?: string;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  type: 'car' | 'motorcycle' | 'van' | 'electric_car';
  createdAt?: string;
  updatedAt?: string;
}

const initialVehicleState: Vehicle = {
  licensePlate: '',
  make: '',
  model: '',
  color: '',
  type: 'car'
};

const vehicleColors = [
  'Black', 'White', 'Silver', 'Gray', 'Blue', 'Red', 
  'Green', 'Yellow', 'Brown', 'Orange', 'Purple', 'Gold'
];

const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle>(initialVehicleState);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const user = getStoredUser();

  // Load vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles');
      
      // Log the response structure to debug
      console.log('Vehicles API response:', response.data);
      
      // Check if response.data is an object with a vehicles property
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
      
      // Ensure we're working with an array even if API returns unexpected format
      setVehicles(Array.isArray(vehiclesArray) ? vehiclesArray : []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setCurrentVehicle(initialVehicleState);
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setCurrentVehicle(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      
      // Validate license plate format (can be customized based on requirements)
      if (!currentVehicle.licensePlate || currentVehicle.licensePlate.trim() === '') {
        setError('License plate is required');
        setSnackbarOpen(true);
        return;
      }
      
      if (isEditing) {
        await api.put(`/vehicles/${currentVehicle.id}`, currentVehicle);
        setSuccessMsg('Vehicle updated successfully');
      } else {
        await api.post('/vehicles', currentVehicle);
        setSuccessMsg('New vehicle added successfully');
      }
      
      fetchVehicles();
      handleCloseDialog();
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Error saving vehicle:', err);
      setError(err.response?.data?.message || 'Failed to save vehicle');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await api.delete(`/vehicles/${id}`);
        fetchVehicles();
        setSuccessMsg('Vehicle deleted successfully');
        setSnackbarOpen(true);
      } catch (err: any) {
        console.error('Error deleting vehicle:', err);
        setError(err.response?.data?.message || 'Failed to delete vehicle');
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

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
      default:
        return <LocalTaxi />;
    }
  };

  const getVehicleColorStyle = (color: string) => {
    // Map color names to CSS color values
    const colorMap: {[key: string]: string} = {
      'Black': '#000000',
      'White': '#FFFFFF',
      'Silver': '#C0C0C0',
      'Gray': '#808080',
      'Blue': '#0000FF',
      'Red': '#FF0000',
      'Green': '#008000',
      'Yellow': '#FFFF00',
      'Brown': '#A52A2A',
      'Orange': '#FFA500',
      'Purple': '#800080',
      'Gold': '#FFD700'
    };
    
    return {
      backgroundColor: colorMap[color] || color,
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      border: '1px solid #ddd',
      display: 'inline-block',
      marginRight: '8px'
    };
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">My Vehicles</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add New Vehicle
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {vehicles.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">
                You don't have any vehicles registered. Click "Add New Vehicle" to add one.
              </Alert>
            </Grid>
          ) : (
            vehicles.map((vehicle) => (
              <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                <Card variant="outlined" sx={{ 
                  transition: 'transform 0.2s, box-shadow 0.2s', 
                  '&:hover': { 
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)' 
                  }
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center">
                        {getVehicleTypeIcon(vehicle.type)}
                        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                          {vehicle.make} {vehicle.model}
                        </Typography>
                      </Box>
                      <Chip 
                        label={vehicle.type.replace('_', ' ')} 
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <span style={getVehicleColorStyle(vehicle.color)}></span>
                      <Typography variant="body2">
                        {vehicle.color}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {vehicle.licensePlate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Added: {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenEditDialog(vehicle)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteVehicle(vehicle.id!)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Add/Edit Vehicle Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="licensePlate"
                  label="License Plate"
                  value={currentVehicle.licensePlate}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  margin="normal"
                  placeholder="ABC123"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="vehicle-type-label">Type</InputLabel>
                  <Select
                    labelId="vehicle-type-label"
                    id="vehicle-type"
                    name="type"
                    value={currentVehicle.type}
                    onChange={handleInputChange}
                    label="Type"
                  >
                    <MenuItem value="car">Car</MenuItem>
                    <MenuItem value="motorcycle">Motorcycle</MenuItem>
                    <MenuItem value="van">Van</MenuItem>
                    <MenuItem value="electric_car">Electric Car</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="make"
                  label="Make"
                  value={currentVehicle.make}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  placeholder="Toyota"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="model"
                  label="Model"
                  value={currentVehicle.model}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  placeholder="Corolla"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="vehicle-color-label">Color</InputLabel>
                  <Select
                    labelId="vehicle-color-label"
                    id="vehicle-color"
                    name="color"
                    value={currentVehicle.color}
                    onChange={handleInputChange}
                    label="Color"
                  >
                    {vehicleColors.map(color => (
                      <MenuItem key={color} value={color}>
                        <Box display="flex" alignItems="center">
                          <span style={getVehicleColorStyle(color)}></span>
                          <span style={{ marginLeft: '8px' }}>{color}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VehicleManagement; 