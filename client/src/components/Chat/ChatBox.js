// client/src/components/Chat/ChatBox.js
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import socket from "../../services/socket";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";
import "./Chat.css";
import "./Message.css";

const ChatBox = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Fetch current user data
  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const { data } = await api.get("/api/users/me");
      setCurrentUser(data);
      return data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/api/users/users");
      setUsers(data.filter(user => user.id !== currentUser?.id));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  // Fetch chat history
  const fetchChatHistory = useCallback(async (receiverId) => {
    try {
      const { data } = await api.get(`/api/messages/user/${receiverId}`);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  }, []);

  // Initialize data and socket connection
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const userData = await fetchCurrentUser();
        if (!userData) return;

        // Connect socket with authentication
        socket.auth = { 
          token: localStorage.getItem("token"),
          userId: userData.id,
          userName: userData.name
        };
        socket.connect();

        // Fetch users after successful authentication
        fetchUsers();
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initializeChat();

    return () => {
      socket.disconnect();
    };
  }, [fetchCurrentUser, fetchUsers]);

  // Socket connection and event handling
  useEffect(() => {
    if (!currentUser) return;

    // Handle incoming messages
    const handleReceiveMessage = (newMessage) => {
      console.log("New message received:", newMessage);
      
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === newMessage.id);
        if (messageExists) return prev;
    
        return [...prev, newMessage];
      });
    
      // Emit message_received event to update status in the database
      socket.emit("message_received", { 
        messageId: newMessage.id, 
        senderId: newMessage.sender_id, 
        receiverId: currentUser.id 
      });
    };

    // Handle typing status
    const handleTypingStatus = ({ senderId, isTyping }) => {
      if (selectedUser?.id === senderId) {
        setTyping(isTyping);
      }
    };

    // Handle message delivery status
    const handleMessageDelivered = ({ messageId }) => {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, status: "delivered" } : msg
        )
      );
    };


    // Socket event listeners
    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing_status", handleTypingStatus);
    socket.on("message_delivered", handleMessageDelivered);

    // Cleanup
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing_status", handleTypingStatus);
      socket.off("message_delivered", handleMessageDelivered);
    };
  }, [currentUser, selectedUser]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchChatHistory(user.id);
    navigate(`/chat/${user.id}`);
    
    // Mark messages as read when selecting the user
    socket.emit("mark_messages_read", {
      senderId: user.id,
      receiverId: currentUser?.id
    });
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedUser || !currentUser) return;

    try {
      const messageData = {
        message: message.trim(),
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        sender_name: currentUser.name,
        status: 'sent',
        createdAt: new Date().toISOString()
      };

      // Send to backend
      const { data } = await api.post(`/api/messages/user/${selectedUser.id}`, messageData);

      // Update local messages immediately
      const newMessage = {
        ...messageData,
        id: data.data.id,
        status: 'sent'
      };

      setMessages(prev => [...prev, newMessage]);

      // Emit through socket
      socket.emit("send_message", newMessage);

      // Clear input
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTypingChange = (e) => {
    setMessage(e.target.value);
    
    if (!selectedUser || !currentUser) return;

    socket.emit("typing_status", {
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      isTyping: true
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_status", {
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        isTyping: false
      });
    }, 1000);
  };

  return (
    <div className="chat-container">
      <UserList 
        users={users}
        currentUser={currentUser}
        selectedUser={selectedUser}
        handleUserSelect={handleUserSelect}
        loading={loading}
      />
      <div className="chat-room">
        {selectedUser ? (
          <>  
            <h3>Chatting with {selectedUser.name}</h3>
            <ChatWindow 
              messages={messages}
              currentUser={currentUser}
              selectedUser={selectedUser}
              typing={typing}
            />
            <MessageInput 
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
              handleTypingChange={handleTypingChange}
            />
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>Select a user to start chatting</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;