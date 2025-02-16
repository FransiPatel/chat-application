import { useEffect, useState } from "react";
import socket from "./socket";

const Chat = ({ userId, receiverId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [deliveredMessageIds, setDeliveredMessageIds] = useState([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    // Listen for message delivery status
    socket.on("message_delivered", ({ messageId }) => {
      setDeliveredMessageIds((prev) => [...prev, messageId]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_delivered");
    };
  }, []);

  // Handle sending message
  const sendMessage = () => {
    if (!message) return;

    socket.emit("send_message", {
      senderId: userId,
      receiverId,
      message,
    });

    setMessage("");
  };

  return (
    <div>
      <h2>Chat</h2>
      <div>
        {messages.map((msg) => (
          <p key={msg.id}>
            {msg.message}{" "}
            {deliveredMessageIds.includes(msg.id) && "✔✔"} {/* Double tick on delivery */}
          </p>
        ))}
      </div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
