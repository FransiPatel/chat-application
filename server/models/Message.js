const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const { MESSAGE_STATUS, TABLE_NAMES } = require("../config/constants");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: TABLE_NAMES.USER,  // Use the constant here
        key: "id",
      },
      onDelete: "CASCADE",
    },
    receiver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: TABLE_NAMES.USER,  // Use the constant here
        key: "id",
      },
      onDelete: "CASCADE",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MESSAGE_STATUS)),
      defaultValue: MESSAGE_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
    tableName: TABLE_NAMES.MESSAGE  // Use the constant here
  }
);

// Define Associations
User.hasMany(Message, { foreignKey: "sender_id", as: "sentMessages" });
User.hasMany(Message, { foreignKey: "receiver_id", as: "receivedMessages" });

Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
Message.belongsTo(User, { foreignKey: "receiver_id", as: "receiver" });

module.exports = Message;