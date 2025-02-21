const { Message, User } = require("../models");
const { MESSAGE_STATUS } = require("../config/constants");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const Validator = require("validatorjs");

let io;

// Function to set the io instance
const setIoInstance = (socketIoInstance) => {
  io = socketIoInstance; 
};


// Message validation rules
const messageRules = {
  message: "required|string|min:1|max:1000",
};

// Send Message API with Proper Socket.io Integration**
const sendMessage = async (req, res) => {
  try {
    const validation = new Validator(req.body, messageRules);
    if (validation.fails()) {
      return res.status(400).json({ errors: validation.errors.all() });
    }

    const { message } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Authorization required" });

    // Decode JWT and get current user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) return res.status(400).json({ error: "User not found" });

    const receiverId = req.params.receiver_id.replace("user/", "");
    if (!receiverId) return res.status(400).json({ error: "Receiver ID is required" });

    const receiver = await User.findByPk(receiverId);
    if (!receiver) return res.status(400).json({ error: "Receiver not found" });

    // Save message in DB
    const newMessage = await Message.create({
      sender_id: currentUser.id,
      receiver_id: receiverId,
      message: message.trim(),
      status: MESSAGE_STATUS.SENT,
    });

    // Emit to receiver's socket
    io.to(receiverId).emit("receive_message", {
      id: newMessage.id,
      message: newMessage.message,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      sender_name: currentUser.name,
      status: newMessage.status,
      createdAt: newMessage.createdAt,
    });

    res.status(201).json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
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


module.exports = { sendMessage, getChatHistory, setIoInstance };
