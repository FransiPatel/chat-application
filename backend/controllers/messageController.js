const { Message, User } = require("../models");
const { MESSAGE_STATUS } = require("../config/constants");
const { Op } = require('sequelize');
const redisClient = require("../config/redis");

// Send a message
const sendMessage = async (req, res) => {
  const { message } = req.body; // Extract message from request body
  const currentUser = req.user; // Assuming user is extracted from middleware

  if (!message || !message.trim() || !currentUser) {
    return res.status(400).json({ error: "Message and user are required" });
  }

  // Fetch sender details from Redis (if available)
  const senderName = await new Promise((resolve, reject) => {
    redisClient.get(`user:${currentUser.id}`, (err, data) => {
      if (err) reject(err);
      resolve(data ? JSON.parse(data).name : currentUser.name);
    });
  });

  try {
    const newMessage = await Message.create({
      sender_id: currentUser.id,
      receiver_id: req.params.receiver_id,
      message: message.trim(),
      status: MESSAGE_STATUS.PENDING,
    });

    const io = req.app.get("socketio");
    io.to(req.params.receiver_id).emit("receive_message", {
      ...newMessage.toJSON(),
      sender_name: senderName,
    }); // Emit message to receiver

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

    // Include sender and receiver names in the response
    const result = await Promise.all(messages.map(async (msg) => {
      const sender = await User.findByPk(msg.sender_id);
      const receiver = await User.findByPk(msg.receiver_id);
      return {
        ...msg.toJSON(),
        sender_name: sender.name,
        receiver_name: receiver.name
      };
    }));

    res.status(200).json({ messages: result });
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
