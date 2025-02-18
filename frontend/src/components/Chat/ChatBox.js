import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";
import "./ChatBox.css";

const ChatBox = () => {
  const navigate = useNavigate();
  const senderId = localStorage.getItem("user_id");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
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
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
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
      if (currentUser && newMessage.receiver_id !== currentUser.id) return;
      setMessages((prev) => [...prev, { 
          ...newMessage, 
          sender_name: newMessage.sender_name || "Unknown" 
      }]); // Ensure sender_name is included
  };
  

    const handleTypingStatus = (status) => {
      setTyping(status.isTyping);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing_status", handleTypingStatus);

    fetchUsers();

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing_status", handleTypingStatus);
    };
  }, [fetchUsers, currentUser]);

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
          senderName: localStorage.getItem("username"),
        });
        setMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle typing status broadcast
  const handleTypingChange = () => {
    socket.emit("typing", { senderId, receiverId: currentUser.id, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emit("typing", { senderId, receiverId: currentUser.id, isTyping: false }), 1000);
  };

  return (
    <div className="chat-container">
      <UserList users={users} currentUser={currentUser} handleUserSelect={handleUserSelect} loading={loading} />
      <div className="chat-room">
        {currentUser && (
          <>  
            <h3>Chatting with {currentUser.name}</h3>
            <ChatWindow messages={messages} senderId={senderId} typing={typing} />
            <MessageInput message={message} setMessage={setMessage} sendMessage={sendMessage} handleTypingChange={handleTypingChange} />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
