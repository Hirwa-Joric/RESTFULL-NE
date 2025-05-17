const express = require('express');
const {
  createVehicle,
  getUserVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicle.controller');
const { isAuthenticated, isUser } = require('../middlewares/auth');
const { validateRequest, schemas } = require('../middlewares/validation');

const router = express.Router();

// Apply authentication and user role check to all routes in this router
router.use(isAuthenticated, isUser);

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Create a new vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - licensePlate
 *             properties:
 *               licensePlate:
 *                 type: string
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               color:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [car, motorcycle, van, electric_car]
 *                 default: car
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *       400:
 *         description: Validation error or license plate already exists
 */
router.post('/', validateRequest(schemas.createVehicle), createVehicle);

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles for the current user
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vehicles
 */
router.get('/', getUserVehicles);

/**
 * @swagger
 * /api/vehicles/{vehicleId}:
 *   get:
 *     summary: Get a specific vehicle by ID
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vehicle details
 *       404:
 *         description: Vehicle not found or does not belong to user
 */
router.get('/:vehicleId', getVehicleById);

/**
 * @swagger
 * /api/vehicles/{vehicleId}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
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
 *               licensePlate:
 *                 type: string
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               color:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [car, motorcycle, van, electric_car]
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *       404:
 *         description: Vehicle not found or does not belong to user
 */
router.put('/:vehicleId', validateRequest(schemas.updateVehicle), updateVehicle);

/**
 * @swagger
 * /api/vehicles/{vehicleId}:
 *   delete:
 *     summary: Delete a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *       404:
 *         description: Vehicle not found or does not belong to user
 */
router.delete('/:vehicleId', deleteVehicle);

module.exports = router; 