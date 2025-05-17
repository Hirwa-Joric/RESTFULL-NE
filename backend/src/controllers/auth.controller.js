const { User } = require('../models');
const { ApiError } = require('../middlewares/error');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ApiError(400, 'Email already in use');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      // Default role is 'user' and status is 'pending_approval'
    });
    
    // Don't send hashed password back
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
    
    res.status(201).json({
      message: 'Registration successful. Your account is pending approval by an administrator.',
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user
 * @route POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      throw new ApiError(403, 'Your account is not active. Please wait for admin approval or contact support.');
    }
    
    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      role: user.role,
    });
    
    // Send user data (without password) and token
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
    
    res.status(200).json({
      message: 'Login successful',
      user: userResponse,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * @route GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // Get user details from database (req.user.userId comes from auth middleware)
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'status', 'createdAt', 'updatedAt'],
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
}; 