import { useState, useEffect } from "react";

const ChatBox = ({ socket }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("message_delivered", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: "✔✔" } : msg))
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_delivered");
    };
  }, [socket]);

  const sendMessage = () => {
    socket.emit("send_message", { senderId: 1, receiverId: 2, message });
    setMessage("");
  };

  return (
    <div>
      <div>
        {messages.map((msg) => (
          <p key={msg.id}>
            {msg.message} {msg.status}
          </p>
        ))}
      </div>
      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;
