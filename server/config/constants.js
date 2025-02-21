module.exports = {
  // Database Configuration Constants
  DB_CONFIG: {
    NAME: process.env.DB_NAME,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT,
    DIALECT: process.env.DB_DIALECT,
  },

  // Table Names
  TABLE_NAMES: {
    USER: "User",
    MESSAGE: "Message",
  },

  // Message Status Constants
  MESSAGE_STATUS: {
    PENDING: "pending",
    SENT: "sent",
    DELIVERED: "delivered",
    FAILED: "failed"
  },

  // User Status Constants
  USER_STATUS: {
    ONLINE: "online",
    OFFLINE: "offline",
    AWAY: "away",
    BUSY: "busy"
  },

  // Authentication Constants
  AUTH: {
    TOKEN_EXPIRY: "24h",
    SALT_ROUNDS: 10,
    TOKEN_TYPE: "Bearer"
  },

  // Socket Events
  SOCKET_EVENTS: {
    CONNECTION: "connection",
    DISCONNECT: "disconnect",
    SEND_MESSAGE: "send_message",
    RECEIVE_MESSAGE: "receive_message",
    MESSAGE_DELIVERED: "message_delivered",
    TYPING_STATUS: "typing_status",
    USER_ONLINE: "user_online",
    USER_OFFLINE: "user_offline"
  },

  // CORS Configuration
  CORS_CONFIG: {
    ORIGIN: process.env.CLIENT_URL || "http://localhost:3001",
    METHODS: ["GET", "POST", "PUT", "DELETE"],
    ALLOWED_HEADERS: ["Content-Type", "Authorization"],
    CREDENTIALS: true
  },

  // Redis Keys (if using Redis)
  REDIS_KEYS: {
    USER_TOKEN: "user:{userId}:token",
    USER_SOCKET: "user:{userId}:socket",
    ONLINE_USERS: "online:users"
  }
};
  