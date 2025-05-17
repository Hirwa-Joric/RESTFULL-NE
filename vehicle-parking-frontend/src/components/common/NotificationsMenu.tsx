import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  TextField
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  DirectionsCar as CarIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as InfoIcon,
  LocalParking as ParkingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../../utils/authWrapper';
import api from '../../services/api';

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

interface Vehicle {
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

interface Notification {
  id: string;
  type: 'booking_request' | 'booking_approved' | 'booking_rejected' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: {
    bookingId?: string;
    status?: string;
    user?: User;
    vehicle?: Vehicle;
    requestedStartTime?: string;
    requestedEndTime?: string;
    slotId?: string;
    slotNumber?: string;
  };
}

const NotificationsMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<ParkingSlot[]>([]);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const user = getStoredUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Fetch notifications when component mounts
    fetchNotifications();
    
    // Polling for new notifications every 30 seconds
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // For the demo, we'll generate mock notifications.
      // In a real app, you would fetch from an API endpoint.
      
      if (isAdmin) {
        try {
          // Fetch pending bookings to show as notifications
          const response = await api.get('/bookings/admin/pending-approval');
          
          // Handle different API response formats
          let bookings = [];
          if (response.data) {
            if (Array.isArray(response.data)) {
              bookings = response.data;
            } else if (response.data.bookings && Array.isArray(response.data.bookings)) {
              bookings = response.data.bookings;
            } else {
              // Try to find any array property in the response
              const potentialArrayProps = Object.keys(response.data || {})
                .filter(key => Array.isArray(response.data[key]));
              
              if (potentialArrayProps.length > 0) {
                bookings = response.data[potentialArrayProps[0]];
              }
            }
          }
          
          if (Array.isArray(bookings)) {
            const newNotifications: Notification[] = bookings.map(booking => ({
              id: booking.id,
              type: 'booking_request',
              title: 'New Parking Request',
              message: `${booking.user?.firstName} ${booking.user?.lastName} requested parking for ${booking.vehicle?.licensePlate}`,
              timestamp: booking.createdAt || new Date().toISOString(),
              isRead: false,
              data: {
                bookingId: booking.id,
                user: booking.user,
                vehicle: booking.vehicle,
                requestedStartTime: booking.requestedStartTime,
                requestedEndTime: booking.requestedEndTime,
                status: booking.status
              }
            }));
            
            setNotifications(newNotifications);
          }
        } catch (error) {
          console.error('Error fetching pending bookings:', error);
          // Fallback to demo notifications
          const demoNotifications: Notification[] = [
            {
              id: '1',
              type: 'booking_request',
              title: 'New Parking Request',
              message: 'John Doe requested parking for AB123CD',
              timestamp: new Date().toISOString(),
              isRead: false,
              data: {
                bookingId: '1',
                status: 'pending_approval'
              }
            }
          ];
          setNotifications(demoNotifications);
        }
      } else {
        // For regular users, show their booking statuses
        try {
          const response = await api.get('/bookings/my-bookings');
          
          // Handle different API response formats
          let bookings = [];
          if (response.data) {
            if (Array.isArray(response.data)) {
              bookings = response.data;
            } else if (response.data.bookings && Array.isArray(response.data.bookings)) {
              bookings = response.data.bookings;
            } else {
              // Try to find any array property in the response
              const potentialArrayProps = Object.keys(response.data || {})
                .filter(key => Array.isArray(response.data[key]));
              
              if (potentialArrayProps.length > 0) {
                bookings = response.data[potentialArrayProps[0]];
              }
            }
          }
          
          if (Array.isArray(bookings)) {
            // Filter only recently updated bookings (simulating notifications)
            const recentBookings = bookings
              .filter(booking => 
                booking.status === 'confirmed' || 
                booking.status === 'rejected' ||
                booking.status === 'pending_approval'
              )
              .slice(0, 5); // Limit to 5 most recent
            
            const newNotifications: Notification[] = recentBookings.map(booking => {
              let type: 'booking_request' | 'booking_approved' | 'booking_rejected' | 'system';
              let title: string;
              let message: string;
              
              switch (booking.status) {
                case 'confirmed':
                  type = 'booking_approved';
                  title = 'Booking Approved';
                  message = `Your parking request for ${booking.vehicle?.licensePlate} has been approved${
                    booking.parkingSlot?.slotNumber 
                      ? ` - Slot ${booking.parkingSlot.slotNumber} (${booking.parkingSlot.locationDescription})`
                      : ''
                  }`;
                  break;
                case 'rejected':
                  type = 'booking_rejected';
                  title = 'Booking Rejected';
                  message = `Your parking request for ${booking.vehicle?.licensePlate} has been rejected`;
                  break;
                case 'pending_approval':
                default:
                  type = 'booking_request';
                  title = 'Booking Pending';
                  message = `Your parking request for ${booking.vehicle?.licensePlate} is awaiting approval`;
              }
              
              return {
                id: booking.id,
                type,
                title,
                message,
                timestamp: booking.updatedAt || new Date().toISOString(),
                isRead: false,
                data: {
                  bookingId: booking.id,
                  status: booking.status,
                  vehicle: booking.vehicle,
                  slotNumber: booking.parkingSlot?.slotNumber
                }
              };
            });
            
            setNotifications(newNotifications);
          }
        } catch (error) {
          console.error('Error fetching user bookings:', error);
          // Fallback to demo notifications
          const demoNotifications: Notification[] = [
            {
              id: '1',
              type: 'booking_approved',
              title: 'Booking Approved',
              message: 'Your parking request has been approved',
              timestamp: new Date().toISOString(),
              isRead: false,
              data: {
                bookingId: '1',
                status: 'confirmed',
                slotNumber: 'A12'
              }
            }
          ];
          setNotifications(demoNotifications);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);
    
    // Different actions based on notification type and user role
    if (isAdmin && notification.type === 'booking_request') {
      setSelectedNotification(notification);
      fetchAvailableSlots(notification);
    } else if (notification.type === 'booking_approved') {
      navigate('/my-bookings');
      handleClose();
    } else {
      // Default - just close the menu
      handleClose();
    }
  };

  const fetchAvailableSlots = async (notification: Notification) => {
    if (!notification.data?.vehicle?.type) {
      return;
    }
    
    try {
      const response = await api.get('/slots', {
        params: {
          status: 'available',
          type: notification.data.vehicle.type
        }
      });
      
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
            slotsArray = response.data[potentialArrayProps[0]];
          }
        }
      }
      
      setAvailableSlots(Array.isArray(slotsArray) ? slotsArray : []);
      setOpenApproveDialog(true);
    } catch (err) {
      console.error('Error fetching available slots:', err);
    }
  };

  const handleOpenRejectDialog = (notification: Notification) => {
    setSelectedNotification(notification);
    setAdminRemarks('');
    setOpenRejectDialog(true);
  };

  const handleApproveBooking = async () => {
    if (!selectedNotification || !selectedSlotId) {
      return;
    }

    try {
      const response = await api.put(`/bookings/admin/${selectedNotification.data?.bookingId}/approve`, {
        slotId: selectedSlotId,
        adminRemarks
      });
      
      console.log('Booking approval response:', response.data);
      
      // Force a slot status update right away - trigger event or dispatch action
      // that other components can listen to
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('booking-status-changed', { 
          detail: { slotId: selectedSlotId, status: 'reserved' } 
        }));
      }
      
      // Remove the notification from the list
      setNotifications(notifications.filter(n => n.id !== selectedNotification.id));
      setOpenApproveDialog(false);
      setSelectedNotification(null);
      setSelectedSlotId('');
      setAdminRemarks('');
      
      // Refresh notifications
      fetchNotifications();
      
      // Force extra data refresh
      setTimeout(() => {
        window.dispatchEvent(new Event('force-refresh-parking-data'));
      }, 500);
    } catch (err) {
      console.error('Error approving booking:', err);
    }
  };

  const handleRejectBooking = async () => {
    if (!selectedNotification) {
      return;
    }

    try {
      await api.put(`/bookings/admin/${selectedNotification.data?.bookingId}/reject`, {
        adminRemarks
      });
      
      // Remove the notification from the list
      setNotifications(notifications.filter(n => n.id !== selectedNotification.id));
      setOpenRejectDialog(false);
      setSelectedNotification(null);
      setAdminRemarks('');
      
      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      console.error('Error rejecting booking:', err);
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch (err) {
      return 'Invalid date';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_request':
        return <CarIcon />;
      case 'booking_approved':
        return <ApproveIcon color="success" />;
      case 'booking_rejected':
        return <RejectIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        aria-label={`show ${unreadCount} new notifications`}
        color="inherit"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {notifications.length > 0 && (
            <Button size="small" onClick={fetchNotifications}>
              Refresh
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notification.isRead ? 'grey.300' : 'primary.main' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <React.Fragment>
                        {notification.type === 'booking_approved' ? (
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                              {notification.message}
                            </Typography>
                            {notification.data?.slotNumber && (
                              <Box sx={{ 
                                mt: 1, 
                                p: 1, 
                                bgcolor: 'primary.light', 
                                color: 'primary.contrastText',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                <ParkingIcon sx={{ mr: 1, fontSize: '1rem' }} />
                                <Typography variant="caption" fontWeight="bold">
                                  Your assigned spot: {notification.data.slotNumber}
                                </Typography>
                              </Box>
                            )}
                            <Typography component="span" variant="caption" color="text.secondary">
                              {formatDateTime(notification.timestamp)}
                            </Typography>
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                              {notification.message}
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary">
                              {formatDateTime(notification.timestamp)}
                            </Typography>
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    }
                    onClick={() => handleNotificationClick(notification)}
                    sx={{ cursor: 'pointer' }}
                  />
                  
                  {isAdmin && notification.type === 'booking_request' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() => handleOpenRejectDialog(notification)}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
      
      {/* Approve Dialog */}
      <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Parking Request</DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedNotification.data?.user?.firstName} {selectedNotification.data?.user?.lastName} requested parking
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Vehicle: {selectedNotification.data?.vehicle?.licensePlate} ({selectedNotification.data?.vehicle?.make} {selectedNotification.data?.vehicle?.model})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From: {formatDateTime(selectedNotification.data?.requestedStartTime || '')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  To: {formatDateTime(selectedNotification.data?.requestedEndTime || '')}
                </Typography>
              </Box>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Assign Parking Slot</InputLabel>
                <Select
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                  label="Assign Parking Slot"
                >
                  {availableSlots.length === 0 ? (
                    <MenuItem disabled value="">
                      No available slots found
                    </MenuItem>
                  ) : (
                    availableSlots.map((slot) => (
                      <MenuItem key={slot.id} value={slot.id}>
                        Slot {slot.slotNumber} - {slot.locationDescription}
                        {slot.isEVChargingAvailable && ' (EV Charging)'}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              
              <TextField
                label="Admin Remarks (Optional)"
                multiline
                rows={3}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                fullWidth
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApproveDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleApproveBooking} 
            color="success" 
            variant="contained"
            disabled={!selectedSlotId}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Parking Request</DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Please provide a reason for rejection:
              </Typography>
              
              <TextField
                label="Admin Remarks"
                multiline
                rows={3}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleRejectBooking} 
            color="error" 
            variant="contained"
            disabled={!adminRemarks}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationsMenu; 