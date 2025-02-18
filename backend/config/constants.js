module.exports = {
    DB_CONFIG: {
      NAME: process.env.DB_NAME,
      USER: process.env.DB_USER,
      PASSWORD: process.env.DB_PASSWORD,
      HOST: process.env.DB_HOST,
      DIALECT: process.env.DB_DIALECT,
    },
  
    MESSAGE_STATUS: {
      SENT: "sent",
      DELIVERED: "delivered",
    },
  
    TABLE_NAMES: {
      USER: "User",
      MESSAGE: "Message",
    },
  };
  