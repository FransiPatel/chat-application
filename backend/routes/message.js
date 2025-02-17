const express = require("express");
const { sendMessage, getChatHistory, markMessageAsSeen } = require("../controllers/messageController");
const authenticateUser = require("../middleware/auth"); 

const router = express.Router();

router.get("/user/:receiver_id", authenticateUser, getChatHistory);
router.post("/user/:receiver_id", authenticateUser, sendMessage); 

// Mark a message as seen
router.put("/seen/:messageId", markMessageAsSeen);

module.exports = router;
