const sequelize = require("../config/db");
const User = require("./User");
const Message = require("./Message");

const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");
    await sequelize.sync({ alter: true });
    console.log("All models synchronized.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

module.exports = { User, Message, initDB };
