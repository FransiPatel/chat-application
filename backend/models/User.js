const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { USER_STATUS, TABLE_NAMES } = require("../config/constants");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(USER_STATUS)),
      defaultValue: USER_STATUS.OFFLINE,
    },
  },
  {
    timestamps: true,
    tableName: TABLE_NAMES.USER,
  }
);

module.exports = User;
