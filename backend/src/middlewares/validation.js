const Joi = require('joi');

// Helper function to validate request body against schema
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (!error) {
      return next();
    }
    
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    
    return res.status(400).json({
      message: 'Validation error',
      errors,
    });
  };
};

// Validation schemas for different API endpoints
const schemas = {
  // Auth schemas
  register: Joi.object({
    firstName: Joi.string().required().trim().messages({
      'string.empty': 'First name is required',
      'any.required': 'First name is required',
    }),
    lastName: Joi.string().required().trim().messages({
      'string.empty': 'Last name is required',
      'any.required': 'Last name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),

  // Vehicle schemas
  createVehicle: Joi.object({
    licensePlate: Joi.string().required().trim().messages({
      'string.empty': 'License plate is required',
      'any.required': 'License plate is required',
    }),
    make: Joi.string().allow('').optional(),
    model: Joi.string().allow('').optional(),
    color: Joi.string().allow('').optional(),
    type: Joi.string().valid('car', 'motorcycle', 'van', 'electric_car', 'disabled').default('car'),
  }),

  updateVehicle: Joi.object({
    licensePlate: Joi.string().trim().optional(),
    make: Joi.string().allow('').optional(),
    model: Joi.string().allow('').optional(),
    color: Joi.string().allow('').optional(),
    type: Joi.string().valid('car', 'motorcycle', 'van', 'electric_car', 'disabled').optional(),
  }),

  // Parking slot schemas
  createParkingSlot: Joi.object({
    slotNumber: Joi.string().required().trim().messages({
      'string.empty': 'Slot number is required',
      'any.required': 'Slot number is required',
    }),
    locationDescription: Joi.string().allow('').optional(),
    type: Joi.string()
      .valid('car', 'motorcycle', 'van', 'electric_car', 'disabled')
      .default('car'),
    isEVChargingAvailable: Joi.boolean().default(false),
  }),

  updateParkingSlot: Joi.object({
    slotNumber: Joi.string().trim().optional(),
    locationDescription: Joi.string().allow('').optional(),
    type: Joi.string()
      .valid('car', 'motorcycle', 'van', 'electric_car', 'disabled')
      .optional(),
    status: Joi.string()
      .valid('available', 'occupied', 'reserved', 'maintenance')
      .optional(),
    isEVChargingAvailable: Joi.boolean().optional(),
  }),

  // Booking schemas
  createBooking: Joi.object({
    vehicleId: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid vehicle ID format',
      'any.required': 'Vehicle ID is required',
    }),
    slotId: Joi.string().uuid().optional(),
    requestedStartTime: Joi.date().iso().greater('now').required().messages({
      'date.greater': 'Start time must be in the future',
      'any.required': 'Start time is required',
    }),
    requestedEndTime: Joi.date().iso().greater(Joi.ref('requestedStartTime')).required().messages({
      'date.greater': 'End time must be after start time',
      'any.required': 'End time is required',
    }),
    notes: Joi.string().allow('').optional(),
  }),

  approveBooking: Joi.object({
    slotId: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid slot ID format',
      'any.required': 'Slot ID is required',
    }),
    adminRemarks: Joi.string().allow('').optional(),
  }),

  rejectCancelBooking: Joi.object({
    adminRemarks: Joi.string().required().messages({
      'string.empty': 'Admin remarks are required for rejection/cancellation',
      'any.required': 'Admin remarks are required for rejection/cancellation',
    }),
  }),

  // User update schema
  updateUser: Joi.object({
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    role: Joi.string().valid('user', 'admin').optional(),
    status: Joi.string().valid('pending_approval', 'active', 'suspended').optional(),
  }),

  // Simplified parking request schema (no end time)
  simpleParkingRequest: Joi.object({
    vehicleId: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid vehicle ID format',
      'any.required': 'Vehicle ID is required',
    }),
    notes: Joi.string().allow('').optional(),
  }),

  // Payment schemas
  processPayment: Joi.object({
    paymentMethod: Joi.string()
      .valid('cash', 'credit_card', 'debit_card', 'mobile_payment')
      .default('cash')
      .optional(),
  }),
};

module.exports = {
  validateRequest,
  schemas,
}; 