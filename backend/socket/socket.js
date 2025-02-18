const { Server } = require("socket.io");
const { User, Message } = require("../models");
const { MESSAGE_STATUS, USER_STATUS } = require("../config/constants");

const activeUsers = new Map();

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("user_online", async (userId) => {
      try {
        if (userId) {
          activeUsers.set(userId, socket.id);
          await User.update({ status: USER_STATUS.ONLINE }, { where: { id: userId } });
          io.emit("user_status", { userId, status: USER_STATUS.ONLINE });
          console.log(`User ${userId} is online`);
        }
      } catch (error) {
        console.error("Error while setting user status to online:", error);
      }
    });

    // Handle sending messages
    socket.on("send_message", async ({ senderId, receiverId, message, senderName }) => {
      try {
        if (!senderId || !receiverId || !message) return;

        // Store message in database
        const newMessage = await Message.create({
          sender_id: senderId,
          receiver_id: receiverId,
          message,
          sender_name: senderName,
          status: MESSAGE_STATUS.PENDING,
        });

        // Get receiver's socket ID
        const receiverSocketId = activeUsers.get(receiverId);
    
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", {
            ...newMessage.toJSON(),
            sender_name: senderName
          });

          // Update message status to 'delivered'
          await newMessage.update({ status: MESSAGE_STATUS.DELIVERED });

          // Notify sender about delivery status
          io.to(socket.id).emit("message_delivered", { messageId: newMessage.id });
        }
    
        console.log(`Message sent from ${senderId} to ${receiverId}`);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Handle message seen status
    socket.on("mark_as_seen", async ({ messageId, senderId }) => {
      try {
        const message = await Message.findByPk(messageId);
        if (message) {
          await message.update({ status: MESSAGE_STATUS.SEEN });

          // Notify sender that message is seen
          const senderSocketId = [...activeUsers.entries()].find(([_, id]) => id === senderId)?.[0];
          if (senderSocketId) {
            io.to(senderSocketId).emit("message_seen", { messageId });
          }

          console.log(`Message ${messageId} seen by recipient`);
        }
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        const userId = [...activeUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
        if (userId) {
          await User.update({ status: USER_STATUS.OFFLINE }, { where: { id: userId } });
          io.emit("user_status", { userId, status: USER_STATUS.OFFLINE });
          activeUsers.delete(socket.id);
          console.log(`User ${userId} disconnected`);
        }
      } catch (error) {
        console.error("Error while setting user status to offline:", error);
      }
    });
  });

  return io;
};

module.exports = setupSocket;
