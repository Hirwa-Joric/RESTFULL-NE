const express = require('express');
const {
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
} = require('../controllers/booking.controller');
const { isAuthenticated, isAdmin, isUser } = require('../middlewares/auth');
const { validateRequest, schemas } = require('../middlewares/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(isAuthenticated);

// Root route - use getUserBookings controller function with fallback
router.get('/', async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(200).json([]);
    }
    
    // Try to get user bookings
    return await getUserBookings(req, res, next);
  } catch (error) {
    // Fallback to empty array if any error occurs
    console.error('Error in bookings root route:', error);
    return res.status(200).json([]);
  }
});

// User routes
/**
 * @swagger
 * /api/bookings/request:
 *   post:
 *     summary: Create a new parking request (immediate check-in)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *             properties:
 *               vehicleId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Parking check-in successful
 *       400:
 *         description: No available parking slots
 */
router.post('/request', isUser, validateRequest(schemas.simpleParkingRequest), createBookingRequest);

/**
 * @swagger
 * /api/bookings/{bookingId}/calculate:
 *   get:
 *     summary: Calculate payment amount for a parking session
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Payment calculation
 *       404:
 *         description: Active parking session not found
 */
router.get('/:bookingId/calculate', isUser, calculatePayment);

/**
 * @swagger
 * /api/bookings/{bookingId}/pay:
 *   post:
 *     summary: Process payment for a parking session
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
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
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, credit_card, debit_card, mobile_payment]
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       404:
 *         description: Active parking session not found
 */
router.post('/:bookingId/pay', isUser, processPayment);

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get all bookings for the current user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings
 */
router.get('/my-bookings', isUser, getUserBookings);

/**
 * @swagger
 * /api/bookings/{bookingId}/cancel-by-user:
 *   put:
 *     summary: Cancel a booking by the user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       404:
 *         description: Booking not found or does not belong to user
 */
router.put('/:bookingId/cancel-by-user', isUser, cancelBookingByUser);

// Admin routes
/**
 * @swagger
 * /api/bookings/admin/all:
 *   get:
 *     summary: Get all bookings with filters (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending_approval, confirmed, rejected, cancelled_by_user, cancelled_by_admin, active_parking, completed]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
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
 *         description: List of bookings
 */
router.get('/admin/all', isAdmin, getAllBookings);

/**
 * @swagger
 * /api/bookings/admin/pending-approval:
 *   get:
 *     summary: Get all pending approval bookings (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending bookings
 */
router.get('/admin/pending-approval', isAdmin, getPendingApprovalBookings);

/**
 * @swagger
 * /api/bookings/admin/{bookingId}/approve:
 *   put:
 *     summary: Approve a booking (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
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
 *             required:
 *               - slotId
 *             properties:
 *               slotId:
 *                 type: string
 *                 format: uuid
 *               adminRemarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking approved successfully
 *       400:
 *         description: Validation error, slot conflict, or incompatible types
 */
router.put('/admin/:bookingId/approve', isAdmin, validateRequest(schemas.approveBooking), approveBooking);

/**
 * @swagger
 * /api/bookings/admin/{bookingId}/reject:
 *   put:
 *     summary: Reject a booking (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
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
 *             required:
 *               - adminRemarks
 *             properties:
 *               adminRemarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 *       400:
 *         description: Admin remarks are required
 */
router.put('/admin/:bookingId/reject', isAdmin, validateRequest(schemas.rejectCancelBooking), rejectBooking);

/**
 * @swagger
 * /api/bookings/admin/{bookingId}/check-in:
 *   post:
 *     summary: Check-in a booking (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Booking checked in successfully
 *       400:
 *         description: Only confirmed bookings can be checked in
 */
router.post('/admin/:bookingId/check-in', isAdmin, checkInBooking);

/**
 * @swagger
 * /api/bookings/admin/{bookingId}/check-out:
 *   post:
 *     summary: Check-out a booking (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Booking checked out successfully
 *       400:
 *         description: Only active bookings can be checked out
 */
router.post('/admin/:bookingId/check-out', isAdmin, checkOutBooking);

module.exports = router; 