import React from 'react';
import "./Chat.css";

const Message = ({ message, currentUser }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return '✓✓';
      case 'sent':
        return '✓';
      default:
        return '✓';
    }
  };

  const isOwnMessage = message.sender_id === currentUser?.id;

  return (
    <div className={`message ${isOwnMessage ? "sent" : "received"}`}>
      <div className="message-content">
        <span className="message-text">{message.message}</span>
        {isOwnMessage && (
          <span className="message-status" title={message.status}>
            {getStatusIcon(message.status)}
          </span>
        )}
      </div>
      <div className="message-time">
        {formatTime(message.createdAt)}
      </div>
    </div>
  );
};

export default Message; 