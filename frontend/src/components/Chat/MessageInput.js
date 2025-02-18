import React from "react";

const MessageInput = ({ message, setMessage, sendMessage, handleTypingChange }) => {
  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTypingChange();
        }}
        placeholder="Type a message"
        className="chat-input"
      />
      <button onClick={sendMessage} className="send-button">
        Send
      </button>
    </div>
  );
};

export default MessageInput;
