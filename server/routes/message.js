const express = require("express");
const { 
  sendMessage, 
  getChatHistory, 
} = require("../controllers");
const auth = require("../middleware/auth");
const { messageLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.get("/user/:receiver_id", auth, getChatHistory);
router.post("/user/:receiver_id", auth, messageLimiter, sendMessage);

module.exports = router;
