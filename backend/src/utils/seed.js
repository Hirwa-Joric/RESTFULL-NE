const { sequelize, User, ParkingSlot, Vehicle, Booking } = require('../models');
const { hashPassword } = require('./auth');
const { v4: uuidv4 } = require('uuid');

/**
 * Seed the database with initial data
 */
const seedDatabase = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database (destructive in this case)
    await sequelize.sync({ force: true });
    console.log('Database synced successfully.');

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const admin = await User.create({
      id: uuidv4(),
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@parkingsystem.com',
      password: adminPassword,
      role: 'admin',
      status: 'active',
    });
    console.log('Admin user created:', admin.email);

    // Create multiple regular users
    const users = await Promise.all([
      User.create({
        id: uuidv4(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: await hashPassword('user123'),
        role: 'user',
        status: 'active',
      }),
      User.create({
        id: uuidv4(),
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: await hashPassword('user123'),
        role: 'user',
        status: 'active',
      }),
      User.create({
        id: uuidv4(),
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'robert@example.com',
        password: await hashPassword('user123'),
        role: 'user',
        status: 'active',
      }),
      User.create({
        id: uuidv4(),
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah@example.com',
        password: await hashPassword('user123'),
        role: 'user',
        status: 'active',
      })
    ]);
    
    console.log(`${users.length} regular users created`);

    // Create test users with pending approval
    const pendingUsers = await Promise.all([
      User.create({
        id: uuidv4(),
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: await hashPassword('test123'),
        role: 'user',
        status: 'pending_approval',
      }),
      User.create({
        id: uuidv4(),
        firstName: 'Pending',
        lastName: 'Approval',
        email: 'pending@example.com',
        password: await hashPassword('test123'),
        role: 'user',
        status: 'pending_approval',
      }),
      User.create({
        id: uuidv4(),
        firstName: 'New',
        lastName: 'Registration',
        email: 'new@example.com',
        password: await hashPassword('test123'),
        role: 'user',
        status: 'pending_approval',
      })
    ]);
    
    console.log(`${pendingUsers.length} pending users created`);

    // Create parking slots based on the exact layout in the UI
    const parkingSlots = [];
    
    // Row A - Car slots - ensure all are properly created
    const rowA = 'A';
    for (let position = 1; position <= 10; position++) {
      const slotNumber = `${rowA}${position.toString().padStart(2, '0')}`;
      
      // Create appropriate slot type based on position
      const slotType = position <= 7 ? 'car' : 'electric_car';
      const hasEVCharging = position >= 8;
      
      parkingSlots.push(
        await ParkingSlot.create({
          id: uuidv4(),
          slotNumber,
          row: rowA,
          position,
          locationDescription: `Row ${rowA} - ${slotType.replace('_', ' ')}`,
          type: slotType,
          status: 'available', // Set all to available initially
          isEVChargingAvailable: hasEVCharging,
          isSpecialSlot: false,
        })
      );
      
      console.log(`Created slot ${slotNumber} with status: available`);
    }
    
    // Row B - Motorcycle slots
    const rowB = 'B';
    for (let position = 1; position <= 10; position++) {
      const slotNumber = `${rowB}${position.toString().padStart(2, '0')}`;
      parkingSlots.push(
        await ParkingSlot.create({
          id: uuidv4(),
          slotNumber,
          row: rowB,
          position,
          locationDescription: `Row ${rowB} - Motorcycle`,
          type: 'motorcycle',
          status: 'available',
          isEVChargingAvailable: false,
          isSpecialSlot: false,
        })
      );
    }
    
    // Row C - Van slots
    const rowC = 'C';
    for (let position = 1; position <= 10; position++) {
      const slotNumber = `${rowC}${position.toString().padStart(2, '0')}`;
      parkingSlots.push(
        await ParkingSlot.create({
          id: uuidv4(),
          slotNumber,
          row: rowC,
          position,
          locationDescription: `Row ${rowC} - Van`,
          type: 'van',
          status: 'available',
          isEVChargingAvailable: false,
          isSpecialSlot: false,
        })
      );
    }
    
    // Row D - Disabled accessible slots
    const rowD = 'D';
    for (let position = 1; position <= 10; position++) {
      const slotNumber = `${rowD}${position.toString().padStart(2, '0')}`;
      parkingSlots.push(
        await ParkingSlot.create({
          id: uuidv4(),
          slotNumber,
          row: rowD,
          position,
          locationDescription: `Row ${rowD} - Accessible`,
          type: 'disabled',
          status: 'available',
          isEVChargingAvailable: false,
          isSpecialSlot: false,
        })
      );
    }
    
    // Row E - Mix of regular cars and electric cars
    const rowE = 'E';
    for (let position = 1; position <= 10; position++) {
      const slotNumber = `${rowE}${position.toString().padStart(2, '0')}`;
      // E01-E05 are car slots, E06-E10 are for electric cars with EV charging
      const slotType = position <= 5 ? 'car' : 'electric_car';
      const hasEVCharging = position > 5;
      
      parkingSlots.push(
        await ParkingSlot.create({
          id: uuidv4(),
          slotNumber,
          row: rowE,
          position,
          locationDescription: `Row ${rowE} - ${slotType.replace('_', ' ')}`,
          type: slotType,
          status: 'available',
          isEVChargingAvailable: hasEVCharging,
          isSpecialSlot: false,
        })
      );
    }
    
    // Row F - Mix of all types 
    const rowF = 'F';
    for (let position = 1; position <= 10; position++) {
      const slotNumber = `${rowF}${position.toString().padStart(2, '0')}`;
      
      // Set different types based on position
      let slotType, hasEVCharging, description;
      if (position <= 2) {
        slotType = 'car';
        hasEVCharging = false;
        description = 'Car';
      } else if (position <= 4) {
        slotType = 'motorcycle';
        hasEVCharging = false;
        description = 'Motorcycle';
      } else if (position <= 6) {
        slotType = 'van';
        hasEVCharging = false;
        description = 'Van';
      } else if (position <= 8) {
        slotType = 'electric_car';
        hasEVCharging = true;
        description = 'Electric Car';
      } else {
        slotType = 'disabled';
        hasEVCharging = position === 10; // F10 has EV charging for disabled
        description = 'Accessible';
      }
      
      parkingSlots.push(
        await ParkingSlot.create({
          id: uuidv4(),
          slotNumber,
          row: rowF,
          position,
          locationDescription: `Row ${rowF} - ${description}`,
          type: slotType,
          status: 'available',
          isEVChargingAvailable: hasEVCharging,
          isSpecialSlot: false,
        })
      );
    }
    
    // Add a few special slots
    parkingSlots.push(
      await ParkingSlot.create({
        id: uuidv4(),
        slotNumber: 'B201',
        row: 'B',
        position: 11,
        locationDescription: 'Row B Special - Motorcycle Premium',
        type: 'motorcycle',
        status: 'available',
        isEVChargingAvailable: false,
        isSpecialSlot: true,
      })
    );
    
    parkingSlots.push(
      await ParkingSlot.create({
        id: uuidv4(),
        slotNumber: 'D101',
        row: 'D',
        position: 11,
        locationDescription: 'Row D Special - Accessible Premium',
        type: 'disabled',
        status: 'available',
        isEVChargingAvailable: true,
        isSpecialSlot: true,
      })
    );
    
    parkingSlots.push(
      await ParkingSlot.create({
        id: uuidv4(),
        slotNumber: 'VIP01',
        row: 'V',
        position: 1,
        locationDescription: 'VIP Area - Electric Car Premium',
        type: 'electric_car',
        status: 'available',
        isEVChargingAvailable: true,
        isSpecialSlot: true,
      })
    );
    
    parkingSlots.push(
      await ParkingSlot.create({
        id: uuidv4(),
        slotNumber: 'VIP02',
        row: 'V',
        position: 2,
        locationDescription: 'VIP Area - Van Premium',
        type: 'van',
        status: 'available',
        isEVChargingAvailable: false,
        isSpecialSlot: true,
      })
    );

    // Only set a few slots to different statuses for demo purposes - REDUCE THE NUMBER
    const slotsToUpdate = [
      { slotNumber: 'A05', status: 'occupied' },    // Just one in row A
      { slotNumber: 'B04', status: 'occupied' },
      { slotNumber: 'C02', status: 'maintenance' },
      { slotNumber: 'E08', status: 'reserved' },
      { slotNumber: 'F07', status: 'occupied' },
    ];
    
    for (const slotUpdate of slotsToUpdate) {
      await ParkingSlot.update(
        { status: slotUpdate.status },
        { where: { slotNumber: slotUpdate.slotNumber } }
      );
      console.log(`Updated slot ${slotUpdate.slotNumber} to status: ${slotUpdate.status}`);
    }
    
    console.log(`${parkingSlots.length} parking slots created.`);

    // Create vehicles for users
    const vehicles = [];
    
    // John's vehicles
    vehicles.push(
      await Vehicle.create({
        id: uuidv4(),
        userId: users[0].id,
        licensePlate: 'ABC123',
        make: 'Toyota',
        model: 'Corolla',
        color: 'Blue',
        type: 'car',
      })
    );
    
    vehicles.push(
      await Vehicle.create({
        id: uuidv4(),
        userId: users[0].id,
        licensePlate: 'XYZ789',
        make: 'Honda',
        model: 'Civic',
        color: 'Red',
        type: 'car',
      })
    );
    
    // Jane's vehicles
    vehicles.push(
      await Vehicle.create({
        id: uuidv4(),
        userId: users[1].id,
        licensePlate: 'DEF456',
        make: 'Kawasaki',
        model: 'Ninja',
        color: 'Green',
        type: 'motorcycle',
      })
    );
    
    // Robert's vehicles
    vehicles.push(
      await Vehicle.create({
        id: uuidv4(),
        userId: users[2].id,
        licensePlate: 'ELT200',
        make: 'Tesla',
        model: 'Model 3',
        color: 'White',
        type: 'electric_car',
      })
    );
    
    // Sarah's vehicles
    vehicles.push(
      await Vehicle.create({
        id: uuidv4(),
        userId: users[3].id,
        licensePlate: 'VAN100',
        make: 'Ford',
        model: 'Transit',
        color: 'Silver',
        type: 'van',
      })
    );
    
    // Add a disabled vehicle for a user
    vehicles.push(
      await Vehicle.create({
        id: uuidv4(),
        userId: users[3].id,
        licensePlate: 'DIS100',
        make: 'Toyota',
        model: 'Sienna',
        color: 'Black',
        type: 'disabled',
      })
    );
    
    console.log(`${vehicles.length} vehicles created.`);

    // Create bookings - REDUCE THE NUMBER OF BOOKINGS FOR CLARITY
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const bookings = [];
    
    // Find slots by number for accurate bookings
    const findSlotByNumber = (slotNumber) => {
      return parkingSlots.find(slot => slot.slotNumber === slotNumber);
    };
    
    // Active booking for car in A05
    bookings.push(
      await Booking.create({
        id: uuidv4(),
        userId: users[0].id,
        vehicleId: vehicles[0].id, // Toyota Corolla (car)
        slotId: findSlotByNumber('A05').id, // Car slot (occupied)
        requestedStartTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
        requestedEndTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),    // 2 hours from now
        actualCheckInTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),  // Yesterday
        actualCheckOutTime: null,
        status: 'active_parking',
        notes: 'Regular parking',
        adminRemarks: 'Approved by admin',
      })
    );
    
    // Active booking for a motorcycle in B04
    bookings.push(
      await Booking.create({
        id: uuidv4(),
        userId: users[1].id,
        vehicleId: vehicles[2].id, // Kawasaki Ninja (motorcycle)
        slotId: findSlotByNumber('B04').id, // Motorcycle slot (occupied)
        requestedStartTime: now,
        requestedEndTime: new Date(now.getTime() + 3 * 60 * 60 * 1000), // 3 hours from now
        actualCheckInTime: now,
        actualCheckOutTime: null,
        status: 'active_parking',
        notes: 'Short-term parking',
        adminRemarks: 'Approved by admin',
      })
    );
    
    // Reserved booking for an electric car
    bookings.push(
      await Booking.create({
        id: uuidv4(),
        userId: users[2].id,
        vehicleId: vehicles[3].id, // Tesla Model 3 (electric_car)
        slotId: findSlotByNumber('E08').id, // Electric car slot (reserved)
        requestedStartTime: tomorrow,
        requestedEndTime: new Date(tomorrow.getTime() + 5 * 60 * 60 * 1000), // 5 hours from tomorrow
        actualCheckInTime: null,
        actualCheckOutTime: null,
        status: 'confirmed',
        notes: 'Need EV charging',
        adminRemarks: 'Approved. EV slot assigned.',
      })
    );
    
    // Pending approval bookings
    bookings.push(
      await Booking.create({
        id: uuidv4(),
        userId: users[3].id,
        vehicleId: vehicles[4].id, // Ford Transit (van)
        slotId: null,
        requestedStartTime: nextWeek,
        requestedEndTime: new Date(nextWeek.getTime() + 8 * 60 * 60 * 1000), // 8 hours from next week
        actualCheckInTime: null,
        actualCheckOutTime: null,
        status: 'pending_approval',
        notes: 'Weekly visit - need van parking',
        adminRemarks: null,
      })
    );
    
    console.log(`${bookings.length} bookings created.`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase; 