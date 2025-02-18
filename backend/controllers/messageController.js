const { Message, User } = require("../models");
const { MESSAGE_STATUS } = require("../config/constants");
const { Op } = require('sequelize');
const redisClient = require("../config/redis");
const jwt = require("jsonwebtoken");

// Send Message API
const sendMessage = async (req, res) => {
  try {
    // Extract message from request body
    const { message } = req.body;
    console.log("Message received:", message);

    // Extract JWT token from headers
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Token received:", token);

    if (!token) return res.status(401).json({ error: "Authorization required" });

    // Verify JWT token and get user details
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const currentUser = await User.findByPk(decoded.id);
    console.log("Current user fetched:", currentUser);

    if (!currentUser) {
      return res.status(400).json({ error: "User not found" });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Extract receiverId from URL parameters and remove any 'user/' prefix if present
    const receiverId = req.params.receiver_id.replace('user/', '');
    console.log("Receiver ID:", receiverId);

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    // Verify receiver exists using UUID
    const receiver = await User.findOne({ where: { id: receiverId }});
    if (!receiver) {
      return res.status(400).json({ error: "Receiver not found" });
    }

    // Save message in the database
    const newMessage = await Message.create({
      sender_id: currentUser.id,
      receiver_id: receiverId,
      message: message.trim(),
      status: 'sent' // Initial status
    });

    console.log("Message saved to DB:", newMessage.toJSON());

    // Emit message to receiver
    const io = req.app.get("socketio");
    console.log("Emitting message to receiver...");
    io.to(receiverId).emit("receive_message", {
      ...newMessage.toJSON(),
      sender_name: currentUser.name, // Using direct name instead of Redis for now
    });
    console.log("Message emitted successfully");

    // Return success response
    res.status(201).json({ 
      message: "Message sent successfully", 
      data: {
        ...newMessage.toJSON(),
        sender_name: currentUser.name
      }
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
};


// Get chat history between two users
const getChatHistory = async (req, res) => {
  try {
    const { receiver_id } = req.params;
    const sender_id = req.user.id;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id, receiver_id },
          { sender_id: receiver_id, receiver_id: sender_id },
        ],
      },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'message', 'sender_id', 'receiver_id', 'status', 'createdAt']
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

// Add new function to update message status
const updateMessageStatus = async (messageId, status) => {
  try {
    await Message.update(
      { status },
      { where: { id: messageId } }
    );
    return true;
  } catch (error) {
    console.error("Error updating message status:", error);
    return false;
  }
};

module.exports = { sendMessage, getChatHistory, markMessageAsSeen, updateMessageStatus };
