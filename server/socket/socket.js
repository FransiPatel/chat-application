const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { Message } = require("../models");
const { MESSAGE_STATUS, SOCKET_EVENTS, CORS_CONFIG } = require("../config/constants");
const connectedUsers = new Map();
const { setIoInstance } = require('../controllers/messageController'); 


const setupSocket = (server) => {  
  const io = socketIo(server, {
    cors: CORS_CONFIG
  });
  setIoInstance(io);

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



  io.on(SOCKET_EVENTS.CONNECTION, async (socket) => {
    connectedUsers.set(socket.userId, socket.id);

    // Update message status for newly connected user
    try {
      await Message.update(
        { status: MESSAGE_STATUS.DELIVERED },
        {
          where: {
            receiver_id: socket.userId,
            status: MESSAGE_STATUS.SENT
          }
        }
      );

      // Notify senders that their messages have been delivered
      const deliveredMessages = await Message.findAll({
        where: {
          receiver_id: socket.userId,
          status: MESSAGE_STATUS.DELIVERED
        },
        attributes: ["id", "sender_id"]
      });

      deliveredMessages.forEach(({ id, sender_id }) => {
        const senderSocketId = connectedUsers.get(sender_id);
        if (senderSocketId) {
          io.to(senderSocketId).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, { messageId: id });
        }
      });
    } catch (error) {
      console.error("Error updating message status on user connection:", error);
    }

    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (messageData) => {
      const receiverSocketId = connectedUsers.get(messageData.receiver_id);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, messageData);

        // Update message status to DELIVERED immediately
        await Message.update(
          { status: MESSAGE_STATUS.DELIVERED },
          { where: { id: messageData.id } }
        );

        // Notify sender that the message was delivered
        socket.emit(SOCKET_EVENTS.MESSAGE_DELIVERED, messageData.id);
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

    // Handle user logout (to properly remove from connected users)
    socket.on(SOCKET_EVENTS.LOGOUT, () => {
      connectedUsers.delete(socket.userId);
      socket.disconnect();
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.userId);
    });

    // Handle message received confirmation
    socket.on("message_received", async ({ messageId, senderId, receiverId }) => {
      try {
        // Update message status to 'delivered'
        await Message.update(
          { status: MESSAGE_STATUS.DELIVERED },
          { where: { id: messageId } }
        );
    
        // Notify sender that the message was delivered
        const senderSocketId = connectedUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, { messageId });
        }
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    });
    
  });

  return io;
};

module.exports = setupSocket;
