const express = require("express");
const { 
  sendMessage, 
  getChatHistory, 
  markMessageAsSeen 
} = require("../controllers");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/user/:receiver_id", auth, getChatHistory);
router.post("/user/:receiver_id", auth, sendMessage);
router.put("/seen/:messageId", auth, markMessageAsSeen);

module.exports = router;
