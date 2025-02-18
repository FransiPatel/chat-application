import React, { useEffect, useRef } from "react";
import Message from "./Message";

const ChatWindow = ({ messages, currentUser, typing, selectedUser }) => {
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-window" ref={chatWindowRef}>
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          currentUser={currentUser}
        />
      ))}
      {typing && selectedUser && (
        <div className="typing-indicator">
          {selectedUser.name} is typing...
        </div>
      )}
    </div>
  );
};

export default ChatWindow;