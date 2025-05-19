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
import type { SelectChangeEvent } from '@mui/material';
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
import { hasRole, getStoredUser } from '../../../utils/authWrapper';

// Type definitions
interface ParkingSlot {
  id: string;
  slotNumber: string;
  row?: string;
  position?: number;
  locationDescription: string;
  type: 'car' | 'motorcycle' | 'van' | 'electric_car' | 'disabled';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  isEVChargingAvailable: boolean;
  isSpecialSlot?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const initialSlotState: ParkingSlot = {
  id: '',
  slotNumber: '',
  locationDescription: '',
  type: 'car',
  status: 'available',
  isEVChargingAvailable: false,
  isSpecialSlot: false
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [bulkRowCount, setBulkRowCount] = useState(6);
  const [bulkSlotsPerRow, setBulkSlotsPerRow] = useState(10);
  const [bulkRowPrefix, setBulkRowPrefix] = useState('A');
  const [bulkSlotType, setBulkSlotType] = useState<'car' | 'motorcycle' | 'van' | 'electric_car' | 'disabled'>('car');
  const [bulkEvRow, setBulkEvRow] = useState(false);

  // Load slots on component mount
  useEffect(() => {
    // Check if user is admin
    const user = getStoredUser();
    if (!user || !hasRole('admin')) {
      setError('You do not have permission to manage slots. Please log in as an admin.');
      setSnackbarOpen(true);
      return;
    }
    
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      
      // Debug auth status
      const token = localStorage.getItem('token');
      const user = getStoredUser();
      console.log('Auth status:', { 
        hasToken: !!token, 
        hasUser: !!user, 
        userRole: user?.role,
        isAdmin: hasRole('admin')
      });
      
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
    } catch (err: any) {
      console.error('Error fetching slots:', err);
      
      // Add detailed error logging
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
        console.error('Error headers:', err.response.headers);
      }
      
      setError('Failed to load parking slots');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if a slot number already exists
  const slotExists = (slotNumber: string): boolean => {
    return slots.some(slot => slot.slotNumber === slotNumber);
  };

  // Helper function to validate slot number format
  const validateSlotNumber = (slotNumber: string): string | null => {
    if (!slotNumber) {
      return 'Slot number is required';
    }
    
    // Check that first character is a letter between A-F or V
    const row = slotNumber.charAt(0);
    if (!row.match(/^[A-FV]$/)) {
      return 'Slot number must start with a letter between A and F or V';
    }
    
    // Check that the rest is a number between 1-20
    const positionStr = slotNumber.substring(1);
    const position = parseInt(positionStr, 10);
    
    if (isNaN(position)) {
      return 'Position must be a number';
    }
    
    if (position < 1 || position > 20) {
      return 'Position number must be between 1 and 20';
    }
    
    // Only check for duplicates when creating, not when editing
    if (!isEditing && slotExists(slotNumber)) {
      return `Slot number ${slotNumber} already exists`;
    }
    
    return null; // No error
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | 
    SelectChangeEvent
  ) => {
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
    // Validate slotNumber format
    const validationResult = validateSlotNumber(currentSlot.slotNumber);
    if (validationResult) {
      setValidationError(validationResult);
      return;
    }
    
    // Reset validation error if we passed validation
    setValidationError(null);
    
    try {
      // Extract only fields that the backend validation expects
      const slotData = {
        slotNumber: currentSlot.slotNumber,
        locationDescription: currentSlot.locationDescription,
        type: currentSlot.type,
        isEVChargingAvailable: currentSlot.isEVChargingAvailable
      };
      
      console.log('Sending slot data to API:', slotData);
      console.log('Auth token:', localStorage.getItem('token'));
      
      if (isEditing) {
        try {
          const response = await api.put(`/slots/${currentSlot.id}`, slotData);
          console.log('API response:', response.data);
          setSuccessMsg('Parking slot updated successfully');
          fetchSlots();
          handleCloseDialog();
          setSnackbarOpen(true);
        } catch (updateErr: any) {
          console.error('PUT Error details:', {
            status: updateErr.response?.status,
            statusText: updateErr.response?.statusText,
            data: updateErr.response?.data
          });
          
          let errorMessage = 'Failed to update parking slot';
          if (updateErr.response?.data?.message) {
            errorMessage = updateErr.response.data.message;
          }
          
          setError(errorMessage);
          setSnackbarOpen(true);
        }
      } else {
        try {
          const response = await api.post('/slots', slotData);
          console.log('API response:', response.data);
          setSuccessMsg('New parking slot added successfully');
          fetchSlots();
          handleCloseDialog();
          setSnackbarOpen(true);
        } catch (postErr: any) {
          console.error('POST Error details:', {
            status: postErr.response?.status,
            statusText: postErr.response?.statusText,
            data: postErr.response?.data,
            headers: postErr.response?.headers
          });
          
          let errorMessage = 'Failed to create parking slot';
          
          // Handle specific error cases
          if (postErr.response?.data?.message?.includes('already exists')) {
            errorMessage = `Parking slot "${currentSlot.slotNumber}" already exists`;
          } else if (postErr.response?.data?.message) {
            errorMessage = postErr.response.data.message;
          }
          
          setError(errorMessage);
          setSnackbarOpen(true);
        }
      }
    } catch (err: any) {
      console.error('Error in slot operation:', err);
      
      // Extract more detailed error info if available
      let errorMessage = 'Failed to save parking slot';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      console.error('Full error response:', err.response?.data);
      
      // Log detailed validation errors if available
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        console.error('Validation errors:', err.response.data.errors);
        err.response.data.errors.forEach((error, index) => {
          console.error(`Error ${index + 1}:`, error);
        });
      }
      
      setError(errorMessage);
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
      // Validate row prefix
      if (!bulkRowPrefix.match(/^[A-FV]$/)) {
        setError('Row prefix must be a letter between A and F or V');
        setSnackbarOpen(true);
        return;
      }
      
      // Generate an array of slot objects based on the bulk settings
      const newSlots: Omit<ParkingSlot, 'id' | 'createdAt' | 'updatedAt'>[] = [];
      const existingSlotNumbers: string[] = [];
      
      for (let row = 0; row < bulkRowCount; row++) {
        // Convert row number to letter (A, B, C, etc.)
        let rowLetter = String.fromCharCode(bulkRowPrefix.charCodeAt(0) + row);
        
        // Special case for row V (which is outside the A-F sequence)
        if (bulkRowPrefix === 'V') {
          rowLetter = 'V';
          // Only create one row for V
          if (row > 0) break;
        } else {
          // Make sure we're not generating rows beyond F for regular sequence
          if (rowLetter.charCodeAt(0) > 'F'.charCodeAt(0)) {
            break;
          }
        }
        
        for (let slot = 1; slot <= bulkSlotsPerRow; slot++) {
          // Make sure slot number stays under 20
          if (slot > 20) {
            break;
          }
          
          const slotNumber = `${rowLetter}${slot.toString().padStart(2, '0')}`;
          
          // Validate slot number
          const validationResult = validateSlotNumber(slotNumber);
          if (validationResult) {
            // Special case for "already exists" - track these separately
            if (validationResult.includes('already exists')) {
              console.warn(`Skipping existing slot: ${slotNumber}`);
              existingSlotNumbers.push(slotNumber);
              continue;
            }
            
            console.warn(`Skipping invalid slot number: ${slotNumber} - ${validationResult}`);
            continue;
          }
          
          newSlots.push({
            slotNumber,
            locationDescription: `Row ${rowLetter}`,
            type: bulkSlotType,
            status: 'available',
            isEVChargingAvailable: row === (bulkRowCount - 1) && bulkEvRow
          });
        }
      }
      
      // Warn if all slots already exist
      if (newSlots.length === 0) {
        if (existingSlotNumbers.length > 0) {
          setError(`All slots in this range already exist. (${existingSlotNumbers.length} existing slots detected)`);
        } else {
          setError('No valid slots to create. Please check your configuration.');
        }
        setSnackbarOpen(true);
        return;
      }
      
      // If some slots already exist, ask for confirmation
      if (existingSlotNumbers.length > 0) {
        const confirmMessage = `${existingSlotNumbers.length} slots already exist and will be skipped. Continue with creating the remaining ${newSlots.length} slots?`;
        
        if (!window.confirm(confirmMessage)) {
          return; // User cancelled
        }
      }
      
      // Create all slots in sequence, but don't stop if one fails
      let createdCount = 0;
      let otherErrorsCount = 0;
      const results = [];
      
      for (const slot of newSlots) {
        console.log('Creating slot:', slot);
        try {
          // Extract only the fields that the backend validation expects
          const slotData = {
            slotNumber: slot.slotNumber,
            locationDescription: slot.locationDescription,
            type: slot.type,
            isEVChargingAvailable: slot.isEVChargingAvailable
          };
          
          await api.post('/slots', slotData);
          createdCount++;
          results.push({ slotNumber: slot.slotNumber, status: 'success' });
        } catch (slotErr: any) {
          console.error(`Error creating slot ${slot.slotNumber}:`, slotErr);
          console.error('Error response:', slotErr.response?.data);
          
          // Check if this is a "slot already exists" error
          if (slotErr.response?.data?.message?.includes('already exists')) {
            otherErrorsCount++;
            results.push({ 
              slotNumber: slot.slotNumber, 
              status: 'error',
              message: slotErr.response?.data?.message || 'Unknown error'
            });
          } else {
            otherErrorsCount++;
            results.push({ 
              slotNumber: slot.slotNumber, 
              status: 'error',
              message: slotErr.response?.data?.message || 'Unknown error'
            });
          }
          // Continue with the next slot instead of throwing
        }
      }
      
      fetchSlots();
      setOpenBulkDialog(false);
      
      // Create a detailed message about the results
      let resultMessage = '';
      if (createdCount > 0) {
        resultMessage += `${createdCount} slots created successfully. `;
      }
      if (otherErrorsCount > 0) {
        resultMessage += `${otherErrorsCount} slots failed to create due to errors.`;
      }
      
      setSuccessMsg(resultMessage);
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Error in bulk slot creation:', err);
      
      // Extract more detailed error info if available
      let errorMessage = 'Failed to create bulk parking slots';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      console.error('Full error response:', err.response?.data);
      
      // Log detailed validation errors if available
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        console.error('Validation errors:', err.response.data.errors);
        err.response.data.errors.forEach((error, index) => {
          console.error(`Error ${index + 1}:`, error);
        });
      }
      
      setError(errorMessage);
      setSnackbarOpen(true);
    }
  };

  // Test direct API call without axios
  const testDirectApiCall = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Format test data - only include fields that the backend validation expects
      const testSlot = {
        slotNumber: 'A01',
        locationDescription: 'Test slot',
        type: 'car',
        isEVChargingAvailable: false
      };
      
      console.log('Making direct fetch call with data:', testSlot);
      
      const response = await fetch('http://localhost:5000/api/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testSlot)
      });
      
      const data = await response.json();
      
      console.log('Direct fetch response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      if (!response.ok) {
        console.error('Direct fetch error:', data);
        if (data.errors && Array.isArray(data.errors)) {
          console.error('Validation errors:', data.errors);
          data.errors.forEach((error, index) => {
            console.error(`Error ${index + 1}:`, error);
          });
        }
      }
    } catch (err) {
      console.error('Direct fetch error:', err);
    }
  };
  
  // Call the test function once on mount
  useEffect(() => {
    testDirectApiCall();
  }, []);

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
          {validationError && (
            <Alert severity="error" sx={{ mt: 2 }}>{validationError}</Alert>
          )}
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
                  placeholder="A01"
                  helperText="Format: Letter (A-F or V) followed by number (1-20)"
                  error={!!validationError && validationError.includes('Slot number')}
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
                  helperText="Starting letter for row names (A-F or V)"
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