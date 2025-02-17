const { Message, User } = require("../models");
const { MESSAGE_STATUS } = require("../config/constants");
const { Op } = require('sequelize');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const sender_id = req.user.id; 
    const { receiver_id } = req.params;
    const { message } = req.body;

    if (!sender_id || !receiver_id || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newMessage = await Message.create({
      sender_id,
      receiver_id,
      message,
      status: MESSAGE_STATUS.PENDING,
    });

    // Emit message via Socket.io
    const io = req.app.get("socketio");
    io.to(receiver_id).emit("receive_message", newMessage);

    res.status(201).json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get chat history between two users
const getChatHistory = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id } = req.params;

    if (!sender_id || !receiver_id) {
      return res.status(400).json({ error: "Sender and Receiver IDs are required" });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id, receiver_id },
          { sender_id: receiver_id, receiver_id: sender_id },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Update message status to 'seen'
const markMessageAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find the message
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Update status to 'seen'
    await message.update({ status: MESSAGE_STATUS.SEEN });

    // Emit seen event
    const io = req.app.get("socketio");
    io.to(message.sender_id).emit("message_seen", { messageId });

    res.status(200).json({ message: "Message marked as seen" });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { sendMessage, getChatHistory, markMessageAsSeen };
