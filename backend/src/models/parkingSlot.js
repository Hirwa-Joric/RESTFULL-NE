const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class ParkingSlot extends Model {
    static associate(models) {
      // define association here
      ParkingSlot.hasMany(models.Booking, { foreignKey: 'slotId', as: 'bookings' });
    }
  }
  ParkingSlot.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      slotNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      row: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [['A', 'B', 'C', 'D', 'E', 'F', 'V']],
        },
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 201,
        },
      },
      isSpecialSlot: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      locationDescription: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.ENUM('car', 'motorcycle', 'van', 'electric_car', 'disabled'),
        defaultValue: 'car',
      },
      status: {
        type: DataTypes.ENUM('available', 'occupied', 'reserved', 'maintenance'),
        defaultValue: 'available',
      },
      isEVChargingAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'ParkingSlot',
      tableName: 'parking_slots',
    }
  );
  return ParkingSlot;
}; 