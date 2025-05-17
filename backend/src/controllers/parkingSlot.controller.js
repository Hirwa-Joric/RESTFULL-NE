const { ParkingSlot, Booking } = require('../models');
const { ApiError } = require('../middlewares/error');
const { Op } = require('sequelize');

/**
 * Create a new parking slot
 * @route POST /api/slots
 */
const createParkingSlot = async (req, res, next) => {
  try {
    const { 
      slotNumber, 
      row, 
      position, 
      locationDescription, 
      type, 
      isEVChargingAvailable,
      isSpecialSlot
    } = req.body;
    
    // Check if slot with this number already exists
    const existingSlot = await ParkingSlot.findOne({ where: { slotNumber } });
    if (existingSlot) {
      throw new ApiError(400, 'A parking slot with this number already exists');
    }
    
    // Extract row and position from slotNumber if not provided
    const derivedRow = row || slotNumber.charAt(0);
    const derivedPosition = position || parseInt(slotNumber.substring(1), 10);
    
    // Check if derived values are valid
    if (!derivedRow.match(/^[A-F]$/)) {
      throw new ApiError(400, 'Row must be a letter between A and F');
    }
    
    if (isNaN(derivedPosition) || derivedPosition < 1 || derivedPosition > 20) {
      throw new ApiError(400, 'Position must be a number between 1 and 20');
    }
    
    // Create parking slot
    const parkingSlot = await ParkingSlot.create({
      slotNumber,
      row: derivedRow,
      position: derivedPosition,
      locationDescription: locationDescription || `Row ${derivedRow}`,
      type,
      isEVChargingAvailable: isEVChargingAvailable || false,
      isSpecialSlot: isSpecialSlot || slotNumber.length > 3,
      // Default status is 'available'
    });
    
    res.status(201).json({
      message: 'Parking slot created successfully',
      parkingSlot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all parking slots with filters
 * @route GET /api/slots
 */
const getParkingSlots = async (req, res, next) => {
  try {
    const { status, type, row } = req.query;
    const userRole = req.user.role;
    
    // Build filter conditions
    const whereConditions = {};
    
    // For all users, we should always show all slots for better usability
    // Instead of filtering out non-available slots, we'll show them with their status
    // This way users can see both available and reserved/occupied slots
    
    // Only filter by status if explicitly requested in the query
    if (status) {
      whereConditions.status = status;
    }
    
    // Add type filter if provided
    if (type) {
      whereConditions.type = type;
    }
    
    // Add row filter if provided
    if (row) {
      whereConditions.row = row;
    }
    
    const parkingSlots = await ParkingSlot.findAll({
      where: whereConditions,
      order: [['row', 'ASC'], ['position', 'ASC']],
    });
    
    // For debugging: log the slot statuses distribution
    const statusCounts = parkingSlots.reduce((acc, slot) => {
      acc[slot.status] = (acc[slot.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`User ${req.user.id} (${userRole}) - Returning ${parkingSlots.length} slots with statuses:`, statusCounts);
    
    res.status(200).json({
      slots: parkingSlots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific parking slot by ID
 * @route GET /api/slots/:slotId
 */
const getParkingSlotById = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    
    const parkingSlot = await ParkingSlot.findByPk(slotId);
    if (!parkingSlot) {
      throw new ApiError(404, 'Parking slot not found');
    }
    
    res.status(200).json({
      parkingSlot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a parking slot
 * @route PUT /api/slots/:slotId
 */
const updateParkingSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const { 
      slotNumber, 
      row, 
      position, 
      locationDescription, 
      type, 
      status, 
      isEVChargingAvailable,
      isSpecialSlot
    } = req.body;
    
    // Check if slot exists
    const parkingSlot = await ParkingSlot.findByPk(slotId);
    if (!parkingSlot) {
      throw new ApiError(404, 'Parking slot not found');
    }
    
    // If slot number is being changed, check if it's already in use
    if (slotNumber && slotNumber !== parkingSlot.slotNumber) {
      const existingSlot = await ParkingSlot.findOne({ where: { slotNumber } });
      if (existingSlot) {
        throw new ApiError(400, 'A parking slot with this number already exists');
      }
    }
    
    // Create updateData object only with fields that are provided
    const updateData = {};
    if (slotNumber !== undefined) updateData.slotNumber = slotNumber;
    if (row !== undefined) updateData.row = row;
    if (position !== undefined) updateData.position = position;
    if (locationDescription !== undefined) updateData.locationDescription = locationDescription;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (isEVChargingAvailable !== undefined) updateData.isEVChargingAvailable = isEVChargingAvailable;
    if (isSpecialSlot !== undefined) updateData.isSpecialSlot = isSpecialSlot;
    
    // Update parking slot
    await parkingSlot.update(updateData);
    
    res.status(200).json({
      message: 'Parking slot updated successfully',
      parkingSlot,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a parking slot
 * @route DELETE /api/slots/:slotId
 */
const deleteParkingSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    
    // Check if slot exists
    const parkingSlot = await ParkingSlot.findByPk(slotId);
    if (!parkingSlot) {
      throw new ApiError(404, 'Parking slot not found');
    }
    
    // Check if slot has any active bookings
    const activeBookings = await Booking.findOne({
      where: {
        slotId,
        status: {
          [Op.in]: ['confirmed', 'active_parking'],
        },
      },
    });
    
    if (activeBookings) {
      // Instead of deleting, mark as 'maintenance'
      await parkingSlot.update({ status: 'maintenance' });
      
      return res.status(200).json({
        message: 'Parking slot has active bookings and cannot be deleted. It has been marked as under maintenance.',
        parkingSlot,
      });
    }
    
    // Delete parking slot
    await parkingSlot.destroy();
    
    res.status(200).json({
      message: 'Parking slot deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all parking slots
 * @route GET /api/slots
 */
const getAllSlots = async (req, res, next) => {
  try {
    // Get query parameters
    const { status, type } = req.query;

    // Build query conditions based on provided params
    const whereConditions = {};
    if (status) {
      whereConditions.status = status;
    }
    if (type) {
      whereConditions.type = type;
    }

    // Fetch all slots or filtered by conditions
    const parkingSlots = await ParkingSlot.findAll({
      where: whereConditions,
      order: [
        ['row', 'ASC'], 
        ['position', 'ASC']
      ]
    });

    // For debugging: log the slot statuses distribution
    const statusCounts = parkingSlots.reduce((acc, slot) => {
      acc[slot.status] = (acc[slot.status] || 0) + 1;
      return acc;
    }, {});
    console.log(`Returning ${parkingSlots.length} slots with statuses:`, statusCounts);

    res.status(200).json({
      slots: parkingSlots
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createParkingSlot,
  getParkingSlots,
  getParkingSlotById,
  updateParkingSlot,
  deleteParkingSlot,
  getAllSlots,
}; 