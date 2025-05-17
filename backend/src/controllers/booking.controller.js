const { Booking, Vehicle, ParkingSlot, User } = require('../models');
const { ApiError } = require('../middlewares/error');
const { Op } = require('sequelize');

/**
 * Create a new booking request (requires admin approval)
 * @route POST /api/bookings/request
 */
const createBookingRequest = async (req, res, next) => {
  try {
    const { vehicleId, requestedStartTime, requestedEndTime, notes } = req.body;
    const userId = req.user.userId;

    // Verify the vehicle belongs to the user
    const vehicle = await Vehicle.findOne({
      where: { id: vehicleId, userId },
      include: [{ model: User, as: 'owner' }]
    });

    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found or does not belong to you');
    }

    // Always use the current time + offset approach for automatic time calculation
    // Start time: 30 minutes from now
    // End time: 3 hours from now
    const startTime = new Date(Date.now() + 30 * 60 * 1000);
    const endTime = new Date(Date.now() + 3 * 60 * 60 * 1000);

    // Create booking with pending approval status (NOT assigned a slot yet)
    const booking = await Booking.create({
      userId,
      vehicleId,
      // No slotId assignment here - admin will assign it on approval
      requestedStartTime: startTime,
      requestedEndTime: endTime,
      notes,
      status: 'pending_approval' // Set status as pending approval
    });

    res.status(201).json({
      message: 'Booking request submitted successfully! Awaiting admin approval.',
      booking: {
        id: booking.id,
        requestedStartTime: booking.requestedStartTime,
        requestedEndTime: booking.requestedEndTime,
        status: booking.status,
        vehicleDetails: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings for the current user
 * @route GET /api/bookings/my-bookings
 */
const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'licensePlate', 'make', 'model', 'type'],
        },
        {
          model: ParkingSlot,
          as: 'parkingSlot',
          attributes: ['id', 'slotNumber', 'locationDescription', 'type'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a booking by user
 * @route PUT /api/bookings/:bookingId/cancel-by-user
 */
const cancelBookingByUser = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findOne({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new ApiError(404, 'Booking not found or does not belong to you');
    }

    if (!['pending_approval', 'confirmed'].includes(booking.status)) {
      throw new ApiError(400, 'Booking cannot be cancelled in its current state');
    }

    // If confirmed and has slotId, update slot status back to available
    if (booking.status === 'confirmed' && booking.slotId) {
      await ParkingSlot.update(
        { status: 'available' },
        { where: { id: booking.slotId } }
      );
    }

    // Update booking status
    await booking.update({ status: 'cancelled_by_user' });

    res.status(200).json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings (admin)
 * @route GET /api/bookings/admin/all
 */
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'licensePlate', 'make', 'model', 'type']
        },
        {
          model: ParkingSlot,
          as: 'parkingSlot',
          attributes: ['id', 'slotNumber', 'locationDescription', 'type']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending approval bookings (admin)
 * @route GET /api/bookings/admin/pending-approval
 */
const getPendingApprovalBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { status: 'pending_approval' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'licensePlate', 'make', 'model', 'type']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a booking (admin)
 * @route PUT /api/bookings/admin/:bookingId/approve
 */
const approveBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { slotId, adminRemarks } = req.body;

    if (!slotId) {
      throw new ApiError(400, 'A parking slot must be assigned');
    }

    // Check if booking exists
    const booking = await Booking.findOne({
      where: { id: bookingId, status: 'pending_approval' },
      include: [
        {
          model: Vehicle,
          as: 'vehicle'
        }
      ]
    });

    if (!booking) {
      throw new ApiError(404, 'Pending booking request not found');
    }

    // Check if slot exists and is available
    const slot = await ParkingSlot.findOne({
      where: { id: slotId, status: 'available' }
    });

    if (!slot) {
      throw new ApiError(404, 'Parking slot not found or not available');
    }

    // Update booking status
    await booking.update({
      status: 'confirmed',
      slotId,
      adminRemarks: adminRemarks || 'Approved by admin'
    });

    // Mark slot as reserved
    await slot.update({ status: 'reserved' });

    res.status(200).json({
      message: 'Booking approved successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a booking (admin)
 * @route PUT /api/bookings/admin/:bookingId/reject
 */
const rejectBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { adminRemarks } = req.body;

    if (!adminRemarks) {
      throw new ApiError(400, 'Admin remarks are required when rejecting a booking');
    }

    const booking = await Booking.findOne({
      where: { id: bookingId, status: 'pending_approval' }
    });

    if (!booking) {
      throw new ApiError(404, 'Pending booking request not found');
    }

    await booking.update({
      status: 'rejected',
      adminRemarks
    });

    res.status(200).json({
      message: 'Booking rejected successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check-in a booking (admin)
 * @route POST /api/bookings/admin/:bookingId/check-in
 */
const checkInBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      where: { id: bookingId, status: 'confirmed' },
      include: [{ model: ParkingSlot, as: 'parkingSlot' }]
    });

    if (!booking) {
      throw new ApiError(404, 'Confirmed booking not found');
    }

    if (!booking.parkingSlot) {
      throw new ApiError(400, 'This booking has no parking slot assigned');
    }

    // Update booking status
    await booking.update({
      status: 'active_parking',
      actualCheckInTime: new Date()
    });

    // Update slot status to occupied
    await booking.parkingSlot.update({ status: 'occupied' });

    res.status(200).json({
      message: 'Check-in successful',
      booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check-out a booking (admin)
 * @route POST /api/bookings/admin/:bookingId/check-out
 */
const checkOutBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      where: { id: bookingId, status: 'active_parking' },
      include: [{ model: ParkingSlot, as: 'parkingSlot' }]
    });

    if (!booking) {
      throw new ApiError(404, 'Active parking not found');
    }

    if (!booking.parkingSlot) {
      throw new ApiError(400, 'This booking has no parking slot assigned');
    }

    // Update booking status
    await booking.update({
      status: 'completed',
      actualCheckOutTime: new Date()
    });

    // Update slot status to available
    await booking.parkingSlot.update({ status: 'available' });

    res.status(200).json({
      message: 'Check-out successful',
      booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process payment for a booking
 * @route POST /api/bookings/:bookingId/pay
 */
const processPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { paymentMethod } = req.body;
    const userId = req.user.userId;

    // Find the booking
    const booking = await Booking.findOne({
      where: { 
        id: bookingId,
        userId,
        status: 'active_parking' 
      },
      include: [
        {
          model: ParkingSlot,
          as: 'parkingSlot',
        }
      ]
    });

    if (!booking) {
      throw new ApiError(404, 'Active parking session not found');
    }

    // Set the check-out time to now
    const checkOutTime = new Date();
    
    // Calculate the duration in hours
    const checkInTime = booking.actualCheckInTime;
    const durationMs = checkOutTime.getTime() - checkInTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Calculate amount (base rate of $2 per hour, minimum 1 hour)
    const hourlyRate = 2.00; // $2 per hour
    const roundedHours = Math.max(1, Math.ceil(durationHours)); // Minimum 1 hour, rounded up
    const amount = roundedHours * hourlyRate;
    
    // Update the booking
    await booking.update({
      actualCheckOutTime: checkOutTime,
      status: 'paid',
      amount,
      paymentStatus: 'paid',
      paymentDate: new Date(),
      paymentMethod: paymentMethod || 'cash'
    });
    
    // Update the parking slot status to available
    if (booking.parkingSlot) {
      await booking.parkingSlot.update({ status: 'available' });
    }
    
    // Return the payment details
    res.status(200).json({
      message: 'Payment processed successfully',
      payment: {
        bookingId: booking.id,
        amount,
        currency: 'USD',
        duration: {
          hours: roundedHours,
          exactHours: durationHours.toFixed(2)
        },
        paymentMethod: booking.paymentMethod,
        paymentDate: booking.paymentDate,
        receipt: `RCPT-${booking.id.substring(0, 8).toUpperCase()}`
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate payment for a booking (for preview before payment)
 * @route GET /api/bookings/:bookingId/calculate
 */
const calculatePayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    // Find the booking
    const booking = await Booking.findOne({
      where: { 
        id: bookingId,
        userId,
        status: 'active_parking' 
      }
    });

    if (!booking) {
      throw new ApiError(404, 'Active parking session not found');
    }

    // Set a temporary check-out time to now for calculation
    const tempCheckOutTime = new Date();
    
    // Calculate the duration in hours
    const checkInTime = booking.actualCheckInTime;
    const durationMs = tempCheckOutTime.getTime() - checkInTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Calculate amount (base rate of $2 per hour, minimum 1 hour)
    const hourlyRate = 2.00; // $2 per hour
    const roundedHours = Math.max(1, Math.ceil(durationHours)); // Minimum 1 hour, rounded up
    const amount = roundedHours * hourlyRate;
    
    // Return the payment calculation
    res.status(200).json({
      bookingId: booking.id,
      checkInTime,
      currentTime: tempCheckOutTime,
      duration: {
        hours: roundedHours,
        exactHours: durationHours.toFixed(2),
        minutes: Math.floor(durationMs / (1000 * 60))
      },
      hourlyRate,
      amount,
      currency: 'USD'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBookingRequest,
  getUserBookings,
  cancelBookingByUser,
  getAllBookings,
  getPendingApprovalBookings,
  approveBooking,
  rejectBooking,
  checkInBooking,
  checkOutBooking,
  processPayment,
  calculatePayment
}; 