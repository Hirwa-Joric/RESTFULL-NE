const express = require('express');
const {
  getPendingApprovals,
  approveUser,
  rejectUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const { validateRequest, schemas } = require('../middlewares/validation');

const router = express.Router();

// Apply authentication and admin role check to all routes in this router
router.use(isAuthenticated, isAdmin);

/**
 * @swagger
 * /api/users/pending-approvals:
 *   get:
 *     summary: Get all users with pending approval status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users with pending approval
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get('/pending-approvals', getPendingApprovals);

/**
 * @swagger
 * /api/users/{userId}/approve:
 *   put:
 *     summary: Approve a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User approved successfully
 *       404:
 *         description: User not found
 */
router.put('/:userId/approve', approveUser);

/**
 * @swagger
 * /api/users/{userId}/reject:
 *   put:
 *     summary: Reject a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User rejected successfully
 *       404:
 *         description: User not found
 */
router.put('/:userId/reject', rejectUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get a specific user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/:userId', getUserById);

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               status:
 *                 type: string
 *                 enum: [pending_approval, active, suspended]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:userId', validateRequest(schemas.updateUser), updateUser);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Delete or suspend a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted/suspended successfully
 *       404:
 *         description: User not found
 */
router.delete('/:userId', deleteUser);

module.exports = router; 