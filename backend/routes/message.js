const express = require("express");
const { sendMessage, getChatHistory, markMessageAsSeen } = require("../controllers/messageController");

const router = express.Router();

// Send a message
router.post("/send", sendMessage);

// Get chat history between two users
router.get("/history/:user1/:user2", getChatHistory);

// Mark a message as seen
router.put("/seen/:messageId", markMessageAsSeen);

module.exports = router;
