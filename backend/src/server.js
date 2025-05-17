const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Function to sync models with database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync database
    // In development, you can use { force: true } to drop and recreate tables
    // In production, use { alter: true } to make non-destructive changes
    // Or just sync() to do nothing if tables exist
    const syncOption = process.env.NODE_ENV === 'development' ? { alter: true } : {};
    await sequelize.sync(syncOption);
    console.log('Database synchronized successfully.');
    
    // Create a default admin user if none exists
    await createDefaultAdmin();
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Function to create a default admin user
const createDefaultAdmin = async () => {
  try {
    const { User } = require('./models');
    const { hashPassword } = require('./utils/auth');
    
    // Check if any admin user exists
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      // Create a default admin
      const hashedPassword = await hashPassword('admin123');
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@parkingsystem.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active', // Admin is active by default
      });
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Start server
const startServer = async () => {
  await syncDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
  });
};

startServer(); 