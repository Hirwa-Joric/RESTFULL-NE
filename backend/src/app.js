const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const parkingSlotRoutes = require('./routes/parkingSlot.routes');
const bookingRoutes = require('./routes/booking.routes');

// Import error handling middleware
const { errorHandler, notFound } = require('./middlewares/error');

// Initialize app
const app = express();

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure helmet with less restrictive settings for development
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vehicle Parking Management API',
      version: '1.0.0',
      description: 'API for managing vehicle parking slots',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API routes files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/slots', parkingSlotRoutes);
app.use('/api/bookings', bookingRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Vehicle Parking Management API',
    documentation: '/api-docs',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app; 