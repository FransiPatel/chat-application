const { Sequelize } = require("sequelize");
const { DB_CONFIG } = require("./constants");

const sequelize = new Sequelize(DB_CONFIG.NAME, DB_CONFIG.USER, DB_CONFIG.PASSWORD, {
  host: DB_CONFIG.HOST,
  dialect: DB_CONFIG.DIALECT,
  logging: false,
});

module.exports = sequelize;
