module.exports = {
    DB_CONFIG: {
      NAME: process.env.DB_NAME,
      USER: process.env.DB_USER,
      PASSWORD: process.env.DB_PASS,
      HOST: process.env.DB_HOST,
      DIALECT: process.env.DB_DIALECT,
    },
  
    MESSAGE_STATUS: {
      PENDING: "pending",
      DELIVERED: "delivered",
    },
  
    USER_STATUS: {
      ONLINE: "online",
      OFFLINE: "offline",
    },
  
    TABLE_NAMES: {
      USER: "users",
      MESSAGE: "messages",
    },
    MESSAGE_STATUS: {
        PENDING: "pending",
        DELIVERED: "delivered",
        SEEN: "seen",
      },
      USER_STATUS: {
        ONLINE: "online",
        OFFLINE: "offline",
      },
  };
  