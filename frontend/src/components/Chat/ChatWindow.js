import React, { useEffect, useRef } from "react";

const ChatWindow = ({ messages, senderId, typing }) => {
  const chatWindowRef = useRef(null);

  // Scroll to the latest message
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-window" ref={chatWindowRef}>
      {messages.map((msg) => (
        <div key={msg.id} className={`message ${msg.sender_id === senderId ? "sent" : "received"}`}>
          <p>
            <strong>{msg.sender_id === senderId ? "Me" : msg.sender_name}:</strong> {msg.message}
          </p>
          <span className="status">
            {msg.status === "PENDING" ? "🔄" : msg.status === "DELIVERED" ? "✔✔" : null}
          </span>
        </div>
      ))}
      {typing && <p className="typing-indicator">Typing...</p>}
    </div>
  );
};

export default ChatWindow;
