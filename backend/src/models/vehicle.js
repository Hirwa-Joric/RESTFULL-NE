const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {
    static associate(models) {
      // define association here
      Vehicle.belongsTo(models.User, { foreignKey: 'userId', as: 'owner' });
      Vehicle.hasMany(models.Booking, { foreignKey: 'vehicleId', as: 'bookings' });
    }
  }
  Vehicle.init(
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
        onDelete: 'CASCADE',
      },
      licensePlate: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      make: {
        type: DataTypes.STRING,
      },
      model: {
        type: DataTypes.STRING,
      },
      color: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.ENUM('car', 'motorcycle', 'van', 'electric_car', 'disabled'),
        defaultValue: 'car',
      },
    },
    {
      sequelize,
      modelName: 'Vehicle',
      tableName: 'vehicles',
    }
  );
  return Vehicle;
}; 