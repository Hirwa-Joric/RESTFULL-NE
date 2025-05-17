const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      // define association here
      Booking.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Booking.belongsTo(models.Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
      Booking.belongsTo(models.ParkingSlot, { foreignKey: 'slotId', as: 'parkingSlot' });
    }
  }
  Booking.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      vehicleId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'vehicles',
          key: 'id',
        },
      },
      slotId: {
        type: DataTypes.UUID,
        allowNull: true, // Initially null until approved by admin
        references: {
          model: 'parking_slots',
          key: 'id',
        },
      },
      requestedStartTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      requestedEndTime: {
        type: DataTypes.DATE,
        allowNull: true, // Now optional since we'll calculate based on actual exit time
      },
      actualCheckInTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      actualCheckOutTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          'pending_approval',
          'confirmed',
          'rejected',
          'cancelled_by_user',
          'cancelled_by_admin',
          'active_parking',
          'completed',
          'payment_pending',
          'paid'
        ),
        defaultValue: 'pending_approval',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      adminRemarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // New payment fields
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      paymentStatus: {
        type: DataTypes.ENUM('unpaid', 'paid'),
        defaultValue: 'unpaid',
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: 'Booking',
      tableName: 'bookings',
    }
  );
  return Booking;
}; 