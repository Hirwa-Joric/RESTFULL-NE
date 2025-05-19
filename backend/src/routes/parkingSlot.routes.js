const express = require('express');
const {
  createParkingSlot,
  getParkingSlots,
  getParkingSlotById,
  updateParkingSlot,
  deleteParkingSlot,
} = require('../controllers/parkingSlot.controller');
const { isAuthenticated, isAdmin, isAnyRole } = require('../middlewares/auth');
const { validateRequest, schemas } = require('../middlewares/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(isAuthenticated);

/**
 * @swagger
 * /api/slots:
 *   post:
 *     summary: Create a new parking slot (admin only)
 *     tags: [Parking Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slotNumber
 *             properties:
 *               slotNumber:
 *                 type: string
 *               locationDescription:
 *                 type: stringokay i like the project right now but the design i do't like it that much so i made some dash board design that i wanted and found some and i ound a desin that i liked i want youto apply that desing for my project systematicaly undrestadn how the design is made and make my project like that desin the whole of it reflect that desin i am not saying u should replicate it use the same icons and what so ever and the same links i am just telling you to appropriate the desin logic use there how things were set up and do the same for my project 

i have provided the image that i see if a good one so so ahead and be responsible and take charge 

you are in charge responsible for eveyr thing  don't ask me for comfirmation to make cange u make them 
 *               type:
 *                 type: string
 *                 enum: [car, motorcycle, van, electric_car, disabled]
 *                 default: car
 *               isEVChargingAvailable:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Parking slot created successfully
 *       400:
 *         description: Validation error or slot number already exists
 */
router.post('/', isAdmin, validateRequest(schemas.createParkingSlot), createParkingSlot);

/**
 * @swagger
 * /api/slots:
 *   get:
 *     summary: Get all parking slots with filters
 *     description: Admin can see all slots. Regular users can only see available slots.
 *     tags: [Parking Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, occupied, reserved, maintenance]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [car, motorcycle, van, electric_car, disabled]
 *     responses:
 *       200:
 *         description: List of parking slots
 */
router.get('/', isAnyRole, getParkingSlots);

/**
 * @swagger
 * /api/slots/{slotId}:
 *   get:
 *     summary: Get a specific parking slot by ID (admin only)
 *     tags: [Parking Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Parking slot details
 *       404:
 *         description: Parking slot not found
 */
router.get('/:slotId', isAdmin, getParkingSlotById);

/**
 * @swagger
 * /api/slots/{slotId}:
 *   put:
 *     summary: Update a parking slot (admin only)
 *     tags: [Parking Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
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
 *               slotNumber:
 *                 type: string
 *               locationDescription:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [car, motorcycle, van, electric_car, disabled]
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved, maintenance]
 *               isEVChargingAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Parking slot updated successfully
 *       404:
 *         description: Parking slot not found
 */
router.put('/:slotId', isAdmin, validateRequest(schemas.updateParkingSlot), updateParkingSlot);

/**
 * @swagger
 * /api/slots/{slotId}:
 *   delete:
 *     summary: Delete a parking slot (admin only)
 *     tags: [Parking Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Parking slot deleted successfully or marked as maintenance
 *       404:
 *         description: Parking slot not found
 */
router.delete('/:slotId', isAdmin, deleteParkingSlot);

module.exports = router; 