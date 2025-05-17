import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Tooltip,
  IconButton,
  Zoom,
  Badge
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import AccessibleIcon from '@mui/icons-material/Accessible';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import NorthIcon from '@mui/icons-material/North';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import api from '../../services/api';
import { getStoredUser } from '../../utils/authWrapper';

// Type definitions
interface ParkingSlot {
  id: string;
  slotNumber: string;
  row: string;
  position: number;
  locationDescription: string;
  type: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  isEVChargingAvailable: boolean;
  isSpecialSlot: boolean;
}

interface Vehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  type: string;
}

interface ParkingRow {
  rowLetter: string;
  slots: Array<SlotData>;
}

interface SlotData {
    id: string;
    slotNumber: string;
  position: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    type: string;
    isEVChargingAvailable: boolean;
  isSpecialSlot: boolean;
  licensePlate?: string;
}

interface BookingRequestData {
  vehicleId: string;
  slotId: string;
  requestedStartTime: Date | null;
  requestedEndTime: Date | null;
  notes: string;
}

interface ParkingOccupancyVisualProps {
  onSlotSelect?: (slotId: string) => void;
  selectedSlotId?: string;
  readOnly?: boolean;
}

const ParkingOccupancyVisual: React.FC<ParkingOccupancyVisualProps> = ({ 
  onSlotSelect,
  selectedSlotId,
  readOnly = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [parkingRows, setParkingRows] = useState<ParkingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingRequest, setBookingRequest] = useState<BookingRequestData>({
    vehicleId: '',
    slotId: '',
    requestedStartTime: null,
    requestedEndTime: null,
    notes: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [zoomedView, setZoomedView] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  
  const user = getStoredUser();
  const isAdmin = user?.role === 'admin';

  // Fetch parking data from the API
  const fetchParkingData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch slots data
      console.log('Fetching parking slots data...');
      const response = await api.get('/slots');
      
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      // Process the slots into our rows data structure
      let slots: ParkingSlot[] = [];
      
      // For debug purposes - log the response shape
      console.log('Slots API response:', response.data);
      
      if (Array.isArray(response.data)) {
        slots = response.data;
      } else if (response.data.slots && Array.isArray(response.data.slots)) {
        slots = response.data.slots;
      } else if (response.data.parkingSlots && Array.isArray(response.data.parkingSlots)) {
        slots = response.data.parkingSlots;
      } else {
        // Try to find any array property in the response
        const potentialArrayProps = Object.keys(response.data || {})
          .filter(key => Array.isArray(response.data[key]));
        
        if (potentialArrayProps.length > 0) {
          slots = response.data[potentialArrayProps[0]];
        } else {
          throw new Error('Unexpected API response format');
        }
      }
      
      // If we don't have any slots, log warning and return early
      if (!slots || slots.length === 0) {
        console.warn('No slots found in API response');
        setLoading(false);
        return;
      }
      
      // Log the slots we got
      console.log(`Retrieved ${slots.length} parking slots with statuses:`, 
        slots.reduce((acc, slot) => {
          acc[slot.status] = (acc[slot.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
      
      // Group slots by row
      const rowMap = new Map<string, SlotData[]>();
      
      slots.forEach(slot => {
        const row = slot.row || slot.slotNumber.charAt(0);
        
        if (!rowMap.has(row)) {
          rowMap.set(row, []);
        }
        
        rowMap.get(row)?.push({
            id: slot.id,
            slotNumber: slot.slotNumber,
          position: slot.position || parseInt(slot.slotNumber.substring(1), 10),
          status: slot.status,
            type: slot.type,
            isEVChargingAvailable: slot.isEVChargingAvailable,
          isSpecialSlot: slot.isSpecialSlot || slot.slotNumber.length > 3
        });
      });
      
      // Convert map to array of rows and sort
      const rows: ParkingRow[] = Array.from(rowMap.entries())
        .map(([rowLetter, slots]) => ({
          rowLetter,
          slots: slots.sort((a, b) => a.position - b.position)
        }))
        .sort((a, b) => a.rowLetter.localeCompare(b.rowLetter));
      
      setParkingRows(rows);
      setError(null);
    } catch (err) {
      console.error('Error fetching parking data:', err);
      setError('Failed to load parking data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user vehicles
  const fetchUserVehicles = useCallback(async () => {
    if (isAdmin) return; // Admin doesn't need to fetch vehicles
    
    try {
      setVehiclesLoading(true);
      const response = await api.get('/vehicles');
      
      // Extract vehicles from response
      let vehiclesArray: Vehicle[] = [];
      
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
            vehiclesArray = response.data[potentialArrayProps[0]];
          }
        }
      }
      
      setVehicles(vehiclesArray);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setVehiclesLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchParkingData();
    fetchUserVehicles();
    
    // Set up polling to refresh the parking data every 15 seconds
    const intervalId = setInterval(() => {
      fetchParkingData();
    }, 15000);
    
    // Listen for manual refresh events
    const handleForceRefresh = () => {
      console.log('Forced refresh of parking data triggered');
      fetchParkingData();
    };
    
    // Listen for slot status changes
    const handleSlotStatusChange = (event: CustomEvent) => {
      console.log('Slot status change event received:', event.detail);
      if (event.detail && event.detail.slotId && event.detail.status) {
        // Immediately update local state without waiting for API
        setParkingRows(prevRows => {
          return prevRows.map(row => {
            const updatedSlots = row.slots.map(slot => {
              if (slot.id === event.detail.slotId) {
                return {...slot, status: event.detail.status};
              }
              return slot;
            });
            return {...row, slots: updatedSlots};
          });
        });
      }
    };
    
    window.addEventListener('force-refresh-parking-data', handleForceRefresh);
    window.addEventListener('booking-status-changed', handleSlotStatusChange as EventListener);
    
    // Clean up interval and event listeners on component unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('force-refresh-parking-data', handleForceRefresh);
      window.removeEventListener('booking-status-changed', handleSlotStatusChange as EventListener);
    };
  }, [fetchParkingData, fetchUserVehicles]);
  
  // Refresh data when selectedSlotId changes
  useEffect(() => {
    if (selectedSlotId) {
      fetchParkingData();
    }
  }, [selectedSlotId, fetchParkingData]);

  // Handle slot click
  const handleSlotClick = (slot: SlotData) => {
    if (readOnly) return;
    
    // Don't allow booking for any user if slot is not available
    if (slot.status !== 'available') {
      // For better UX, we could add a toast notification explaining why the slot can't be booked
      console.log(`Slot ${slot.slotNumber} can't be booked - status: ${slot.status}`);
      return;
    }
    
    // If admin, they shouldn't be able to book slots directly from this view
    if (isAdmin) return;
    
    setSelectedSlot(slot);
    setBookingRequest(prev => ({
      ...prev,
      slotId: slot.id
    }));
    setBookingDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setBookingDialogOpen(false);
    setBookingError(null);
    setBookingSuccess(false);
  };

  // Handle input change for booking form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setBookingRequest(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle date change
  const handleDateChange = (field: string, date: Date | null) => {
    setBookingRequest(prev => ({
      ...prev,
      [field]: date
    }));
  };

  // Get vehicle type icon
  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'car':
        return <TimeToLeaveIcon />;
      case 'motorcycle':
        return <TwoWheelerIcon />;
      case 'van':
        return <AirportShuttleIcon />;
      case 'electric_car':
        return <EvStationIcon />;
      case 'disabled':
        return <AccessibleIcon />;
      default:
        return <DriveEtaIcon />;
    }
  };

  // Submit booking request
  const handleSubmitBooking = async () => {
    if (!bookingRequest.vehicleId) {
      setBookingError('Please select a vehicle');
      return;
    }

    if (!bookingRequest.requestedStartTime || !bookingRequest.requestedEndTime) {
      setBookingError('Please select both start and end times');
      return;
    }

    if (bookingRequest.requestedStartTime >= bookingRequest.requestedEndTime) {
      setBookingError('End time must be after start time');
      return;
    }

    try {
      setSubmitting(true);
      setBookingError(null);
      
      // Submit the booking request to the API
      const response = await api.post('/bookings/request', {
        vehicleId: bookingRequest.vehicleId,
        slotId: bookingRequest.slotId,
        requestedStartTime: bookingRequest.requestedStartTime.toISOString(),
        requestedEndTime: bookingRequest.requestedEndTime.toISOString(),
        notes: bookingRequest.notes
      });
      
      console.log('Booking response:', response.data);
      setBookingSuccess(true);
      
      // Immediately mark the slot as reserved in the UI
      // (this will be visually updated before the backend response is processed)
      setParkingRows(prevRows => {
        return prevRows.map(row => {
          const updatedSlots = row.slots.map(slot => {
            if (slot.id === bookingRequest.slotId) {
              return {...slot, status: 'reserved'};
            }
            return slot;
          });
          return {...row, slots: updatedSlots};
        });
      });
      
      // Refresh all parking data from backend after short delay
      setTimeout(() => {
        fetchParkingData();
        handleDialogClose();
      }, 2000);
      
    } catch (err: any) {
      console.error('Error submitting booking request:', err);
      setBookingError(err.response?.data?.message || 'Failed to submit booking request');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle zoomed view
  const toggleZoom = () => {
    setZoomedView(!zoomedView);
  };

  // Add a helper function to check compatibility
  const isSlotCompatibleWithUserVehicles = (slot: SlotData, userVehicles: Vehicle[]) => {
    // If no vehicles, assume incompatible
    if (!userVehicles || userVehicles.length === 0) return false;
    
    // Check if any user vehicle is compatible with this slot
    return userVehicles.some(vehicle => {
      // Disabled slots are compatible with all vehicle types
      if (slot.type === 'disabled') return true;
      
      // Exact match is compatible
      if (slot.type === vehicle.type) return true;
      
      // Electric cars can park in regular car spots (though they may prefer EV spots)
      if (vehicle.type === 'electric_car' && slot.type === 'car') return true;
      
      // Disabled vehicles can park in any slot type
      if (vehicle.type === 'disabled') return true;
      
      // No other combinations are compatible
      return false;
    });
  };

  // Get color for slot based on status and compatibility
  const getSlotBackgroundColor = (slot: SlotData, userVehicles: Vehicle[]) => {
    // Log slot status for debugging
    console.log(`Slot ${slot.slotNumber} status: ${slot.status}`);
    
    // First check status - for all users, occupied/reserved/maintenance slots look the same
    switch (slot.status) {
      case 'occupied':
        return theme.palette.error.light;
      case 'reserved':
        return theme.palette.warning.light;
      case 'maintenance':
        return theme.palette.grey[400];
      case 'available':
        // Only for available slots, check compatibility for regular users
        if (!isAdmin) {
          const isCompatible = isSlotCompatibleWithUserVehicles(slot, userVehicles);
          return isCompatible ? theme.palette.success.light : theme.palette.action.disabledBackground;
        }
        return theme.palette.success.light;
      default:
        // If we encounter an unknown status, log it and default to a safe color
        console.warn(`Unknown slot status: ${slot.status} for slot ${slot.slotNumber}`);
        return theme.palette.background.paper;
    }
  };

  // Get hover text for slot
  const getSlotTooltipText = (slot: SlotData, userVehicles: Vehicle[]) => {
    const statusText = {
      'available': 'Available',
      'occupied': 'Occupied',
      'reserved': 'Reserved',
      'maintenance': 'Under Maintenance'
    }[slot.status];
    
    const typeText = {
      'car': 'Car Parking',
      'motorcycle': 'Motorcycle Parking',
      'van': 'Van/Truck Parking',
      'electric_car': 'Electric Vehicle Parking',
      'disabled': 'Accessible Parking'
    }[slot.type];
    
    let compatibilityText = '';
    if (slot.status === 'available' && !isAdmin) {
      const isCompatible = isSlotCompatibleWithUserVehicles(slot, userVehicles);
      compatibilityText = isCompatible 
        ? '\nCompatible with your vehicle(s)' 
        : '\nNot compatible with your vehicles';
    }
    
    const extraInfo = slot.isEVChargingAvailable ? '\nEV Charging Available' : '';
    
    return `${slot.slotNumber}\n${statusText}\n${typeText}${compatibilityText}${extraInfo}`;
  };

  // Additional rendering helpers for the realistic UI
  const getVehicleIcon = (type: string, status: string) => {
    // Show icons for both occupied and reserved slots
    if (status !== 'occupied' && status !== 'reserved') return null;
    
    // Different opacity for reserved vs occupied
    const iconColor = status === 'occupied' ? '#fff' : 'rgba(255, 255, 255, 0.7)';
    
    switch (type) {
      case 'car':
        return <DriveEtaIcon sx={{ fontSize: '1.2rem', color: iconColor }} />;
      case 'motorcycle':
        return <TwoWheelerIcon sx={{ fontSize: '1.2rem', color: iconColor }} />;
      case 'van':
        return <AirportShuttleIcon sx={{ fontSize: '1.2rem', color: iconColor }} />;
      case 'electric_car':
        return <EvStationIcon sx={{ fontSize: '1.2rem', color: iconColor }} />;
      case 'disabled':
        return <AccessibleIcon sx={{ fontSize: '1.2rem', color: iconColor }} />;
      default:
        return <DriveEtaIcon sx={{ fontSize: '1.2rem', color: iconColor }} />;
    }
  };
  
  // Get slot styling for 3D effect
  const getSlotStyling = (slot: SlotData, userVehicles: Vehicle[]) => {
    let baseColor = '';
    let slotOpacity = 1;
    let slotIcon = null;
    
    // Determine color based on status
    switch (slot.status) {
      case 'occupied':
        baseColor = theme.palette.error.main;
        slotIcon = getVehicleIcon(slot.type, slot.status);
        break;
      case 'reserved':
        baseColor = theme.palette.warning.main;
        slotIcon = getVehicleIcon(slot.type, slot.status); // Now showing icons for reserved slots too
        break;
      case 'maintenance':
        baseColor = theme.palette.grey[500];
        break;
      case 'available':
        if (!isAdmin) {
          const isCompatible = isSlotCompatibleWithUserVehicles(slot, userVehicles);
          baseColor = isCompatible ? theme.palette.success.main : theme.palette.grey[300];
          slotOpacity = isCompatible ? 1 : 0.7;
        } else {
          baseColor = theme.palette.success.main;
        }
        break;
      default:
        baseColor = theme.palette.grey[300];
    }
    
    return {
      baseColor,
      slotOpacity,
      slotIcon
    };
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="400px"
      >
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
    <Box sx={{ mb: 4, mt: 2 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 0, 
          overflow: 'hidden',
          borderRadius: 2,
          background: 'linear-gradient(to bottom, #f5f7fa, #e4e8f0)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          borderRadius: '8px 8px 0 0'
        }}>
          <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalParkingIcon sx={{ mr: 1 }} /> Parking Map
          </Typography>
          <Box>
            <Tooltip title="Toggle zoom">
              <IconButton onClick={toggleZoom} sx={{ color: 'white' }}>
                {zoomedView ? <ZoomOutMapIcon /> : <ZoomInMapIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        ) : (
          <Box sx={{ position: 'relative' }}>
            {/* Top control bar with legends */}
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255,255,255,0.7)',
              borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
              {/* Status Legend */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">Status:</Typography>
                {[
                  { color: theme.palette.success.main, label: "Available", key: "available" },
                  { color: theme.palette.error.main, label: "Occupied", key: "occupied" },
                  { color: theme.palette.warning.main, label: "Reserved", key: "reserved" },
                  { color: theme.palette.grey[500], label: "Maintenance", key: "maintenance" },
                  ...((!isAdmin) ? [{ color: theme.palette.grey[300], label: "Not Compatible", key: "not-compatible" }] : [])
                ].map(item => (
                  <Box key={item.key} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      bgcolor: item.color, 
                      mr: 0.5, 
                      borderRadius: 0.5,
                      border: '1px solid rgba(0,0,0,0.1)'
                    }} />
                    <Typography variant="caption" fontWeight="medium">{item.label}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Vehicle Types Legend */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mt: { xs: 1, md: 0 } }}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">Vehicle Types:</Typography>
                {[
                  { icon: <DirectionsCarIcon fontSize="small" sx={{ mr: 0.5 }} />, label: "Car", key: "car" },
                  { icon: <TwoWheelerIcon fontSize="small" sx={{ mr: 0.5 }} />, label: "Motorcycle", key: "motorcycle" },
                  { icon: <AirportShuttleIcon fontSize="small" sx={{ mr: 0.5 }} />, label: "Van", key: "van" },
                  { icon: <EvStationIcon fontSize="small" sx={{ mr: 0.5 }} />, label: "Electric Car", key: "electric_car" },
                  { icon: <AccessibleIcon fontSize="small" sx={{ mr: 0.5 }} />, label: "Accessible", key: "disabled" }
                ].map(item => (
                  <Box key={item.key} sx={{ display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                    <Typography variant="caption" fontWeight="medium">{item.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            
            {/* 3D Parking Visualization */}
            <Box sx={{ 
              p: { xs: 1, md: 3 }, 
              overflowX: 'auto',
              perspective: '1000px',
              minHeight: 500,
              position: 'relative'
            }}>
              {/* North indicator */}
              <Box sx={{ 
                position: 'absolute', 
                top: 10, 
                right: 10, 
                bgcolor: 'rgba(255,255,255,0.8)', 
                p: 0.5, 
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: 1,
                zIndex: 10
              }}>
                <NorthIcon color="primary" />
                <Typography variant="caption" fontWeight="bold">N</Typography>
              </Box>
              
              {/* Main entrance */}
              <Box sx={{ 
                mb: 3, 
                p: 1, 
                bgcolor: theme.palette.primary.dark, 
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 1,
                maxWidth: 200,
                mx: 'auto',
                boxShadow: 2,
                transform: 'perspective(500px) rotateX(5deg)'
              }}>
                <Typography variant="subtitle1" fontWeight="bold">MAIN ENTRANCE</Typography>
              </Box>
              
              {/* Main driving lane */}
              <Box sx={{ 
                height: '40px', 
                bgcolor: '#444',
                mb: 5,
                position: 'relative',
                borderRadius: 1,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '2px',
                  bgcolor: '#fff',
                  backgroundImage: 'linear-gradient(90deg, #fff 60%, transparent 40%)',
                  backgroundSize: '20px 2px',
                }
              }} />
              
              {/* Parking Rows - with 3D perspective effect */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 5,
                transform: zoomedView ? 'scale(1.2)' : 'none',
                transformOrigin: 'center top',
                transition: 'transform 0.3s ease',
                transformStyle: 'preserve-3d'
              }}>
                {parkingRows.map((row) => (
                  <Box key={row.rowLetter} sx={{ mb: 4, perspective: '800px' }}>
                    {/* Row header with realistic road */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      position: 'relative'
                    }}>
                      <Box sx={{ 
                        width: '60px', 
                        height: '60px', 
                        bgcolor: theme.palette.primary.main, 
                        display: 'flex', 
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '50%',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: 2,
                        mr: 2,
                        zIndex: 2
                      }}>
                        <Typography variant="h5" fontWeight="bold">
                          {row.rowLetter}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        flexGrow: 1, 
                        height: '30px', 
                        bgcolor: '#555',
                        borderRadius: 1,
                        position: 'relative',
                        boxShadow: 1,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: 0,
                          right: 0,
                          height: '2px',
                          bgcolor: '#fff',
                          backgroundImage: 'linear-gradient(90deg, #fff 60%, transparent 40%)',
                          backgroundSize: '20px 2px',
                        }
                      }} />
                    </Box>
                    
                    {/* Parking slots - with 3D effect */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1.5, 
                      pl: 8, // Offset to align with row marker
                      transform: 'perspective(1000px) rotateX(10deg)',
                      transformOrigin: 'top center',
                      transition: 'transform 0.3s ease'
                    }}>
                      {row.slots.map((slot) => {
                        const { baseColor, slotOpacity, slotIcon } = getSlotStyling(slot, vehicles);
                        const isCurrentlySelected = selectedSlotId === slot.id || 
                          (selectedSlot && selectedSlot.id === slot.id);
                        
                        return (
                          <Tooltip
                            key={slot.id}
                            title={getSlotTooltipText(slot, vehicles)}
                            arrow
                            TransitionComponent={Zoom}
                          >
                            <Box
                              onClick={() => handleSlotClick(slot)}
                              onMouseEnter={() => setHoveredSlot(slot.slotNumber)}
                              onMouseLeave={() => setHoveredSlot(null)}
                              sx={{
                                width: 80,
                                height: 120,
                                bgcolor: baseColor,
                                opacity: slotOpacity,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: slot.status === 'available' && !isAdmin && !readOnly ? 'pointer' : 'default',
                                position: 'relative',
                                transition: 'all 0.2s ease',
                                border: isCurrentlySelected ? `3px solid ${theme.palette.secondary.main}` : 'none',
                                boxShadow: isCurrentlySelected 
                                  ? '0 0 8px rgba(0,0,0,0.4)' 
                                  : '0 5px 15px rgba(0,0,0,0.1)',
                                overflow: 'hidden',
                                '&:hover': {
                                  transform: slot.status === 'available' && !isAdmin && !readOnly 
                                    ? 'translateY(-5px) scale(1.05)' 
                                    : hoveredSlot === slot.slotNumber ? 'translateY(-2px)' : 'none',
                                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                                  zIndex: 10
                                },
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  height: '25px',
                                  background: 'rgba(0,0,0,0.1)',
                                  borderRadius: '0 0 8px 8px'
                                },
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  bottom: -15,
                                  left: 10,
                                  right: 10,
                                  height: 15,
                                  backgroundColor: 'rgba(0,0,0,0.15)',
                                  transform: 'skewX(45deg)',
                                  transformOrigin: 'top',
                                  borderBottomLeftRadius: 8,
                                  borderBottomRightRadius: 8,
                                  zIndex: -1,
                                  opacity: 0.7
                                }
                              }}
                            >
                              {/* Slot Number */}
                              <Typography variant="body1" fontWeight="bold" sx={{ 
                                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                                mb: 1,
                                zIndex: 2
                              }}>
                                {slot.slotNumber}
                              </Typography>
                              
                              {/* Vehicle Type Icon */}
                              {slot.status === 'occupied' ? (
                                <Box sx={{ 
                                  height: 40, 
                                  width: 40, 
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: 'rgba(0,0,0,0.3)',
                                  borderRadius: '50%',
                                  mb: 1,
                                  zIndex: 2
                                }}>
                                  {slotIcon}
                                </Box>
                              ) : (
                                <Box sx={{ 
                                  height: 40, 
                                  width: 40, 
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mb: 1,
                                  zIndex: 2
                                }}>
                                  {slot.type === 'car' && <DirectionsCarIcon sx={{ color: 'white' }} />}
                                  {slot.type === 'motorcycle' && <TwoWheelerIcon sx={{ color: 'white' }} />}
                                  {slot.type === 'van' && <AirportShuttleIcon sx={{ color: 'white' }} />}
                                  {slot.type === 'electric_car' && <EvStationIcon sx={{ color: 'white' }} />}
                                  {slot.type === 'disabled' && <AccessibleIcon sx={{ color: 'white' }} />}
                                </Box>
                              )}
                              
                              {/* Status */}
                              <Chip 
                                label={slot.status.charAt(0).toUpperCase() + slot.status.slice(1)} 
                                size="small"
                                sx={{ 
                                  mb: 1,
                                  backgroundColor: 'rgba(255,255,255,0.3)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '0.7rem',
                                  zIndex: 2
                                }}
                              />
                              
                              {/* EV Charging indicator */}
                              {slot.isEVChargingAvailable && (
                                <Badge
                                  sx={{
                                    position: 'absolute',
                                    top: 5,
                                    right: 5,
                                  }}
                                  badgeContent={
                                    <EvStationIcon sx={{ fontSize: '1rem', color: 'white' }} />
                                  }
                                  color="primary"
                                />
                              )}
                              
                              {/* Compatibility badge for regular users */}
                              {!isAdmin && slot.status === 'available' && (
                                <Box sx={{ 
                                  position: 'absolute', 
                                  top: 5, 
                                  left: 5,
                                  zIndex: 2
                                }}>
                                  <Chip
                                    size="small"
                                    label={isSlotCompatibleWithUserVehicles(slot, vehicles) ? "Match" : "No Match"}
                                    color={isSlotCompatibleWithUserVehicles(slot, vehicles) ? "success" : "default"}
                                    sx={{ 
                                      height: 18,
                                      fontSize: '0.6rem',
                                      '& .MuiChip-label': { px: 0.5 }
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
              
              {/* Exit path */}
              <Box sx={{ 
                height: '40px', 
                bgcolor: '#444',
                mt: 3,
                position: 'relative',
                borderRadius: 1,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '2px',
                  bgcolor: '#fff',
                  backgroundImage: 'linear-gradient(90deg, #fff 60%, transparent 40%)',
                  backgroundSize: '20px 2px',
                }
              }} />
              
              {/* Exit */}
              <Box sx={{ 
                mt: 3, 
                p: 1, 
                bgcolor: theme.palette.error.main, 
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 1,
                maxWidth: 200,
                mx: 'auto',
                boxShadow: 2,
                transform: 'perspective(500px) rotateX(5deg)'
              }}>
                <Typography variant="subtitle1" fontWeight="bold">EXIT</Typography>
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Booking Dialog - keep existing dialog */}
        <Dialog open={bookingDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <LocalParkingIcon />
            Request Parking {selectedSlot && `for Slot ${selectedSlot.slotNumber}`}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {vehiclesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : vehicles.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                You need to register a vehicle first before making a booking.
              </Alert>
            ) : (
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="vehicle-select-label">Select Your Vehicle</InputLabel>
                  <Select
                    labelId="vehicle-select-label"
                    name="vehicleId"
                    value={bookingRequest.vehicleId}
                    onChange={handleInputChange}
                    label="Select Your Vehicle"
                    required
                  >
                    {vehicles.map(vehicle => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getVehicleTypeIcon(vehicle.type)}
                          <span>{vehicle.licensePlate} - {vehicle.make} {vehicle.model} ({vehicle.type.replace('_', ' ')})</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box sx={{ mt: 2 }}>
                  <DateTimePicker 
                    label="Requested Start Time"
                    value={bookingRequest.requestedStartTime}
                    onChange={(date) => handleDateChange('requestedStartTime', date)}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                  />
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <DateTimePicker 
                    label="Requested End Time"
                    value={bookingRequest.requestedEndTime}
                    onChange={(date) => handleDateChange('requestedEndTime', date)}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                    disablePast
                  />
                </Box>
                
                <TextField
                  label="Additional Notes"
                  name="notes"
                  value={bookingRequest.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  fullWidth
                  margin="normal"
                  placeholder="Any special requests or additional information"
                />
                
                {selectedSlot && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.09)'
                  }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Selected Slot: {selectedSlot.slotNumber}
                    </Typography>
                    <Typography variant="body2">
                      Type: {selectedSlot.type.replace('_', ' ')}
                      {selectedSlot.isEVChargingAvailable && ' (EV Charging Available)'}
                    </Typography>
                  </Box>
                )}
                
                {bookingError && <Alert severity="error" sx={{ mt: 2 }}>{bookingError}</Alert>}
                {bookingSuccess && (
                  <Alert severity="success" sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Typography variant="subtitle2" fontWeight="bold">Booking request submitted successfully!</Typography>
                      <Typography variant="body2">Your booking request has been saved and the slot is now marked as reserved. Status will update to "reserved" on the map.</Typography>
                    </div>
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
            <Button onClick={handleDialogClose} variant="outlined">Cancel</Button>
            <Button 
              onClick={handleSubmitBooking} 
              color="primary" 
              variant="contained"
              disabled={
                submitting || 
                !bookingRequest.vehicleId || 
                !bookingRequest.requestedStartTime || 
                !bookingRequest.requestedEndTime
              }
              sx={{ px: 3 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Submit Request'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ParkingOccupancyVisual; 