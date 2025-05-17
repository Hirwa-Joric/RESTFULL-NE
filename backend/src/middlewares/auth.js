const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to verify JWT token
const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access denied. Invalid token format.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found or deleted.' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: 'Account not active. Please wait for admin approval or contact support.' 
      });
    }

    // Set user info on request object
    req.user = {
      userId: user.id,
      role: user.role,
      email: user.email
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Middleware to check if user is a regular user
const isUser = (req, res, next) => {
  if (!req.user || req.user.role !== 'user') {
    return res.status(403).json({ message: 'Access denied. User role required.' });
  }
  next();
};

// Middleware to check if user is either admin or regular user
const isAnyRole = (req, res, next) => {
  if (!req.user || !['admin', 'user'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Valid role required.' });
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isUser,
  isAnyRole
}; 