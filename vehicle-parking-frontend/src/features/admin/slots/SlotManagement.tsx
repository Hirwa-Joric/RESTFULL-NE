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
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  LocalParking,
  ElectricCar,
  TwoWheeler,
  AirportShuttle,
  AccessibleForward,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';
import api from '../../../services/api';

// Type definitions
interface ParkingSlot {
  id: string;
  slotNumber: string;
  locationDescription: string;
  type: 'car' | 'motorcycle' | 'van' | 'electric_car' | 'disabled';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  isEVChargingAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const initialSlotState: ParkingSlot = {
  id: '',
  slotNumber: '',
  locationDescription: '',
  type: 'car',
  status: 'available',
  isEVChargingAvailable: false
};

const SlotManagement: React.FC = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<ParkingSlot>(initialSlotState);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [bulkRowCount, setBulkRowCount] = useState(6);
  const [bulkSlotsPerRow, setBulkSlotsPerRow] = useState(10);
  const [bulkRowPrefix, setBulkRowPrefix] = useState('A');
  const [bulkSlotType, setBulkSlotType] = useState<'car' | 'motorcycle' | 'van' | 'electric_car' | 'disabled'>('car');
  const [bulkEvRow, setBulkEvRow] = useState(false);

  // Load slots on component mount
  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get('/slots');
      console.log('Slots API response:', response.data);
      
      // Handle different API response formats
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
          }
        }
      }
      
      // Always ensure we have an array, even if empty
      setSlots(Array.isArray(slotsArray) ? slotsArray : []);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load parking slots');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setCurrentSlot(initialSlotState);
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (slot: ParkingSlot) => {
    setCurrentSlot(slot);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenBulkDialog = () => {
    setOpenBulkDialog(true);
  };

  const handleCloseBulkDialog = () => {
    setOpenBulkDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setCurrentSlot(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCurrentSlot(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await api.put(`/slots/${currentSlot.id}`, currentSlot);
        setSuccessMsg('Parking slot updated successfully');
      } else {
        await api.post('/slots', currentSlot);
        setSuccessMsg('New parking slot added successfully');
      }
      
      fetchSlots();
      handleCloseDialog();
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Error saving slot:', err);
      setError(err.response?.data?.message || 'Failed to save parking slot');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this parking slot?')) {
      try {
        await api.delete(`/slots/${id}`);
        fetchSlots();
        setSuccessMsg('Parking slot deleted successfully');
        setSnackbarOpen(true);
      } catch (err: any) {
        console.error('Error deleting slot:', err);
        setError(err.response?.data?.message || 'Failed to delete parking slot');
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getSlotTypeIcon = (type: string) => {
    switch (type) {
      case 'car':
        return <LocalParking />;
      case 'electric_car':
        return <ElectricCar />;
      case 'motorcycle':
        return <TwoWheeler />;
      case 'van':
        return <AirportShuttle />;
      case 'disabled':
        return <AccessibleForward />;
      default:
        return <LocalParking />;
    }
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'error';
      case 'reserved':
        return 'warning';
      case 'maintenance':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleBulkCreate = async () => {
    try {
      // Generate an array of slot objects based on the bulk settings
      const newSlots: Omit<ParkingSlot, 'id' | 'createdAt' | 'updatedAt'>[] = [];
      
      for (let row = 0; row < bulkRowCount; row++) {
        // Convert row number to letter (A, B, C, etc.)
        const rowLetter = String.fromCharCode(bulkRowPrefix.charCodeAt(0) + row);
        
        for (let slot = 1; slot <= bulkSlotsPerRow; slot++) {
          const slotNumber = `${rowLetter}${slot.toString().padStart(2, '0')}`;
          
          newSlots.push({
            slotNumber,
            locationDescription: `Row ${rowLetter}`,
            type: bulkSlotType,
            status: 'available',
            isEVChargingAvailable: row === (bulkRowCount - 1) && bulkEvRow // Last row as EV if enabled
          });
        }
      }
      
      // Create all slots in sequence
      let createdCount = 0;
      for (const slot of newSlots) {
        await api.post('/slots', slot);
        createdCount++;
      }
      
      fetchSlots();
      setOpenBulkDialog(false);
      setSuccessMsg(`Successfully created ${createdCount} parking slots`);
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Error creating bulk slots:', err);
      setError(err.response?.data?.message || 'Failed to create bulk parking slots');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Manage Parking Slots</Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ViewModuleIcon />}
            onClick={handleOpenBulkDialog}
            sx={{ mr: 2 }}
          >
            Create Multiple Slots
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add New Slot
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Typography>Loading slots...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {slots.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">
                No parking slots have been added yet. Click "Add New Slot" to create one.
              </Alert>
            </Grid>
          ) : (
            slots.map((slot) => (
              <Grid item xs={12} sm={6} md={4} key={slot.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" component="div">
                        {slot.slotNumber}
                      </Typography>
                      <Chip 
                        label={slot.status} 
                        color={getStatusColor(slot.status)}
                        size="small"
                      />
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      {getSlotTypeIcon(slot.type)}
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {slot.type.replace('_', ' ')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {slot.locationDescription}
                    </Typography>
                    {slot.isEVChargingAvailable && (
                      <Chip 
                        icon={<ElectricCar fontSize="small" />}
                        label="EV Charging"
                        size="small"
                        color="info"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" onClick={() => handleOpenEditDialog(slot)}>
                      Edit
                    </Button>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteSlot(slot.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Add/Edit Slot Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Parking Slot' : 'Add New Parking Slot'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="slotNumber"
                  label="Slot Number"
                  value={currentSlot.slotNumber}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  margin="normal"
                  placeholder="A101"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="slot-type-label">Type</InputLabel>
                  <Select
                    labelId="slot-type-label"
                    id="slot-type"
                    name="type"
                    value={currentSlot.type}
                    onChange={handleInputChange}
                    label="Type"
                  >
                    <MenuItem value="car">Car</MenuItem>
                    <MenuItem value="motorcycle">Motorcycle</MenuItem>
                    <MenuItem value="van">Van</MenuItem>
                    <MenuItem value="electric_car">Electric Car</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="locationDescription"
                  label="Location Description"
                  value={currentSlot.locationDescription}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  placeholder="Level 1, Section A"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="slot-status-label">Status</InputLabel>
                  <Select
                    labelId="slot-status-label"
                    id="slot-status"
                    name="status"
                    value={currentSlot.status}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="occupied">Occupied</MenuItem>
                    <MenuItem value="reserved">Reserved</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentSlot.isEVChargingAvailable}
                      onChange={handleSwitchChange}
                      name="isEVChargingAvailable"
                    />
                  }
                  label="EV Charging Available"
                />
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

      {/* Bulk Create Slots Dialog */}
      <Dialog open={openBulkDialog} onClose={handleCloseBulkDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create Multiple Parking Slots</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Number of Rows"
                  type="number"
                  value={bulkRowCount}
                  onChange={(e) => setBulkRowCount(parseInt(e.target.value))}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ inputProps: { min: 1, max: 10 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Slots Per Row"
                  type="number"
                  value={bulkSlotsPerRow}
                  onChange={(e) => setBulkSlotsPerRow(parseInt(e.target.value))}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ inputProps: { min: 5, max: 20 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Row Prefix"
                  value={bulkRowPrefix}
                  onChange={(e) => setBulkRowPrefix(e.target.value.toUpperCase())}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  placeholder="A"
                  inputProps={{ maxLength: 1, style: { textTransform: 'uppercase' } }}
                  helperText="Starting letter for row names (A, B, C, etc.)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="bulk-slot-type-label">Slot Type</InputLabel>
                  <Select
                    labelId="bulk-slot-type-label"
                    id="bulk-slot-type"
                    value={bulkSlotType}
                    onChange={(e) => setBulkSlotType(e.target.value as any)}
                    label="Slot Type"
                  >
                    <MenuItem value="car">Car</MenuItem>
                    <MenuItem value="motorcycle">Motorcycle</MenuItem>
                    <MenuItem value="van">Van</MenuItem>
                    <MenuItem value="electric_car">Electric Car</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={bulkEvRow}
                      onChange={(e) => setBulkEvRow(e.target.checked)}
                    />
                  }
                  label="Make last row EV Charging"
                />
              </Grid>
            </Grid>
            
            <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="body2" gutterBottom>
                This will create {bulkRowCount} rows with {bulkSlotsPerRow} slots each,
                for a total of <strong>{bulkRowCount * bulkSlotsPerRow}</strong> new parking slots.
              </Typography>
              <Typography variant="body2">
                Slots will be numbered {bulkRowPrefix}01, {bulkRowPrefix}02, ...
                through to {String.fromCharCode(bulkRowPrefix.charCodeAt(0) + bulkRowCount - 1)}{bulkSlotsPerRow.toString().padStart(2, '0')}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkDialog} color="inherit">Cancel</Button>
          <Button 
            onClick={handleBulkCreate} 
            color="primary" 
            variant="contained"
            disabled={bulkRowCount <= 0 || bulkSlotsPerRow <= 0 || !bulkRowPrefix}
          >
            Create Slots
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

export default SlotManagement; 