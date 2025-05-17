const { Vehicle } = require('../models');
const { ApiError } = require('../middlewares/error');

/**
 * Create a new vehicle
 * @route POST /api/vehicles
 */
const createVehicle = async (req, res, next) => {
  try {
    const { licensePlate, make, model, color, type } = req.body;
    const userId = req.user.userId;
    
    // Check if vehicle with this license plate already exists
    const existingVehicle = await Vehicle.findOne({ where: { licensePlate } });
    if (existingVehicle) {
      throw new ApiError(400, 'A vehicle with this license plate already exists');
    }
    
    // Create vehicle
    const vehicle = await Vehicle.create({
      userId,
      licensePlate,
      make,
      model,
      color,
      type,
    });
    
    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all vehicles for the current user
 * @route GET /api/vehicles
 */
const getUserVehicles = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const vehicles = await Vehicle.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    
    res.status(200).json({
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific vehicle by ID (ensure it belongs to the current user)
 * @route GET /api/vehicles/:vehicleId
 */
const getVehicleById = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.userId;
    
    const vehicle = await Vehicle.findOne({
      where: {
        id: vehicleId,
        userId,
      },
    });
    
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found or does not belong to you');
    }
    
    res.status(200).json({
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a vehicle (ensure it belongs to the current user)
 * @route PUT /api/vehicles/:vehicleId
 */
const updateVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.userId;
    const { licensePlate, make, model, color, type } = req.body;
    
    // Check if vehicle exists and belongs to the user
    const vehicle = await Vehicle.findOne({
      where: {
        id: vehicleId,
        userId,
      },
    });
    
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found or does not belong to you');
    }
    
    // If license plate is being changed, check if it's already in use
    if (licensePlate && licensePlate !== vehicle.licensePlate) {
      const existingVehicle = await Vehicle.findOne({ where: { licensePlate } });
      if (existingVehicle) {
        throw new ApiError(400, 'A vehicle with this license plate already exists');
      }
    }
    
    // Create updateData object only with fields that are provided
    const updateData = {};
    if (licensePlate !== undefined) updateData.licensePlate = licensePlate;
    if (make !== undefined) updateData.make = make;
    if (model !== undefined) updateData.model = model;
    if (color !== undefined) updateData.color = color;
    if (type !== undefined) updateData.type = type;
    
    // Update vehicle
    await vehicle.update(updateData);
    
    res.status(200).json({
      message: 'Vehicle updated successfully',
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a vehicle (ensure it belongs to the current user)
 * @route DELETE /api/vehicles/:vehicleId
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.userId;
    
    // Check if vehicle exists and belongs to the user
    const vehicle = await Vehicle.findOne({
      where: {
        id: vehicleId,
        userId,
      },
    });
    
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found or does not belong to you');
    }
    
    // Check if vehicle has any active bookings before deleting
    // This would be implemented here but requires checking the Booking model
    // which we'll skip for now
    
    // Delete vehicle
    await vehicle.destroy();
    
    res.status(200).json({
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVehicle,
  getUserVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
}; 