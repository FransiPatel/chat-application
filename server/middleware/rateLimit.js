// server/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

// Create a rate limit for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: "Too many login attempts from this IP, please try again later."
});

// Create a rate limit for message sending
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 messages per windowMs
  message: "Too many messages sent from this IP, please try again later."
});

// Create a rate limit for user fetching
const userLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 user fetch requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

module.exports = { loginLimiter, messageLimiter, userLimiter };