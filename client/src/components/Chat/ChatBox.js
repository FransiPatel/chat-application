import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import socket from "../../socket";
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
      
      // Process messages to set correct status
      const processedMessages = data.messages.map(message => {
        // If the message is from the current user
        if (message.sender_id === currentUser?.id) {
          // Check if the message has been delivered
          return {
            ...message,
            status: message.status || 'sent' // Default to 'sent' if status is not set
          };
        }
        // If we're receiving the message, mark it as delivered
        else {
          // Update message status to delivered in the backend
          socket.emit('message_received', {
            messageId: message.id,
            senderId: message.sender_id,
            receiverId: currentUser?.id
          });
          
          return {
            ...message,
            status: 'delivered'
          };
        }
      });

      setMessages(processedMessages || []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  }, [currentUser]);

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

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    // Handle incoming messages
    const handleReceiveMessage = (newMessage) => {
      console.log("New message received:", newMessage);
      setMessages(prev => {
        // Avoid duplicate messages
        const messageExists = prev.some(msg => msg.id === newMessage.id);
        if (messageExists) return prev;

        // Add message if it's relevant to current chat
        const isRelevantMessage = 
          selectedUser && 
          (newMessage.sender_id === selectedUser.id || 
           newMessage.receiver_id === selectedUser.id);

        if (isRelevantMessage) {
          return [...prev, newMessage];
        }
        return prev;
      });
    };

    // Handle typing status
    const handleTypingStatus = ({ senderId, isTyping }) => {
      if (selectedUser?.id === senderId) {
        setTyping(isTyping);
      }
    };

    // Handle message delivery status
    const handleMessageDelivered = (messageId) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'delivered' }
          : msg
      ));
    };

    // Add handler for message received confirmation
    const handleMessageReceived = ({ messageId }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'delivered' }
          : msg
      ));
    };

    // Socket event listeners
    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing_status", handleTypingStatus);
    socket.on("message_delivered", handleMessageDelivered);
    socket.on("message_received", handleMessageReceived);

    // Cleanup
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing_status", handleTypingStatus);
      socket.off("message_delivered", handleMessageDelivered);
      socket.off("message_received", handleMessageReceived);
    };
  }, [currentUser, selectedUser]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchChatHistory(user.id);
    navigate(`/chat/${user.id}`);
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