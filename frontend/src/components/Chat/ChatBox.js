import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import "./ChatBox.css"; // Import the CSS file

const ChatBox = () => {
  const navigate = useNavigate();
  const senderId = localStorage.getItem("user_id");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false); // Track if the user is typing
  const chatWindowRef = useRef(null); // For scrolling to the bottom
  const typingTimeoutRef = useRef(null);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3000/api/users/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch chat history
  const fetchChatHistory = useCallback(async (receiverId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/messages/user/${receiverId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      // Check if the new message is for the current chat window
      if (currentUser && newMessage.sender_id !== currentUser.id) {
        // If it's for a different user, add to chat history or notify the user (optional)
        return;
      }
      const senderName = users.find(user => user.id === newMessage.sender_id)?.name || "Unknown";
      setMessages((prev) => [...prev, { ...newMessage, sender_name: senderName }]);
    };

    const handleMessageDelivered = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: "✔✔" } : msg))
      );
    };

    const handleMessageSeen = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: "✔✔✔" } : msg))
      );
    };

    const handleTyping = (isTyping) => {
      setTyping(isTyping);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_delivered", handleMessageDelivered);
    socket.on("message_seen", handleMessageSeen);
    socket.on("typing", handleTyping);

    fetchUsers();

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_delivered", handleMessageDelivered);
      socket.off("message_seen", handleMessageSeen);
      socket.off("typing", handleTyping);
    };
  }, [fetchUsers, currentUser, users]);

  const handleUserSelect = (user) => {
    setCurrentUser(user);
    fetchChatHistory(user.id);
    navigate(`/chat/${user.id}`);
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    try {
      const response = await fetch(`http://localhost:3000/api/messages/user/${currentUser.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, data.data]);
        socket.emit("send_message", {
          senderId,
          receiverId: currentUser.id,
          message: data.data.message,
        });
        setMessage(""); // Clear input field
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle typing status broadcast
  const handleTypingChange = () => {
    socket.emit("typing", true);

    // Debounce the typing event to avoid frequent emissions
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", false);
    }, 1000);
  };

  // Scroll to the latest message
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      {/* User List on the left side */}
      <div className="user-list">
        <h3>Users</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div>
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`user-item ${currentUser?.id === user.id ? "selected" : ""}`}
              >
                {user.name || "Unknown"}
              </div>
            ))}
          </div>
        )}
        <div className="logout-button-container">
          <button
            onClick={() => navigate("/login")}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Chat Room on the right side */}
      <div className="chat-room">
        {currentUser && (
          <div>
            <h3>Chatting with {currentUser.name}</h3>
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
            </div>
            {typing && <p className="typing-indicator">Typing...</p>}
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
        )}
      </div>
    </div>
  );
};

export default ChatBox;
