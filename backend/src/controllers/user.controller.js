const { User } = require('../models');
const { ApiError } = require('../middlewares/error');

/**
 * Get all pending approval users
 * @route GET /api/users/pending-approvals
 */
const getPendingApprovals = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: { status: 'pending_approval' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'status', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
    });
    
    res.status(200).json({
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a user
 * @route PUT /api/users/:userId/approve
 */
const approveUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    if (user.status === 'active') {
      throw new ApiError(400, 'User is already active');
    }
    
    // Update user status to active
    await user.update({ status: 'active' });
    
    res.status(200).json({
      message: 'User approved successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a user
 * @route PUT /api/users/:userId/reject
 */
const rejectUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    if (user.status === 'suspended') {
      throw new ApiError(400, 'User is already suspended');
    }
    
    // Update user status to suspended
    await user.update({ status: 'suspended' });
    
    res.status(200).json({
      message: 'User rejected successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with pagination
 * @route GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await User.findAndCountAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'status', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    
    res.status(200).json({
      users: rows,
      totalUsers: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific user by ID
 * @route GET /api/users/:userId
 */
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
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

/**
 * Update a user
 * @route PUT /api/users/:userId
 */
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, role, status } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Create updateData object only with fields that are provided
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    
    // Update user
    await user.update(updateData);
    
    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user (or soft delete by setting status to suspended)
 * @route DELETE /api/users/:userId
 */
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Soft delete - set status to suspended
    await user.update({ status: 'suspended' });
    
    res.status(200).json({
      message: 'User suspended successfully',
    });
    
    // Alternatively, for hard delete:
    // await user.destroy();
    // res.status(200).json({
    //   message: 'User deleted successfully',
    // });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingApprovals,
  approveUser,
  rejectUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
}; 