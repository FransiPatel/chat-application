const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Message } = require("../models");
const { MESSAGE_STATUS, USER_STATUS } = require("../config/constants");

const setupSocket = (server) => {  
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3001",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    connectedUsers.set(socket.userId, socket.id);

    socket.on('send_message', (messageData) => {
      const receiverSocketId = connectedUsers.get(messageData.receiver_id);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', messageData);
        socket.emit('message_delivered', messageData.id);
      }
    });

    socket.on('typing_status', (data) => {
      const receiverSocketId = connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing_status', {
          senderId: data.senderId,
          isTyping: data.isTyping
        });
      }
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.userId);
    });

    // When a message is received
    socket.on("message", async (data) => {
      try {
        socket.emit("message_delivered", data.messageId);

        if (data.recipientId) {
          const recipientSocket = findSocketByUserId(data.recipientId);
          if (recipientSocket) {
            recipientSocket.emit("new_message", data);
            socket.emit("message_delivered", data.messageId);
          }
        }
      } catch (error) {
        // Silent error handling
      }
    });

    // When a message is seen
    socket.on("message_seen", (data) => {
      try {
        if (data.senderId) {
          const senderSocket = findSocketByUserId(data.senderId);
          if (senderSocket) {
            senderSocket.emit("message_seen", data.messageId);
          }
        }
      } catch (error) {
        // Silent error handling
      }
    });

    // Handle message received confirmation
    socket.on('message_received', async ({ messageId, senderId, receiverId }) => {
      try {
        await Message.update(
          { status: 'delivered' },
          { where: { id: messageId } }
        );

        const senderSocketId = connectedUsers.get(senderId);
        
        if (senderSocketId) {
          io.to(senderSocketId).emit('message_received', { messageId });
        }
      } catch (error) {
        // Silent error handling
      }
    });
  });

  return io;
};

module.exports = setupSocket;