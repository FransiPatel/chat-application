import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import socket from "../../services/socket";

const UserList = ({ users, currentUser, selectedUser, handleUserSelect, loading }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState(new Set());

  // Add socket event listener for new messages
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNewMessage = (message) => {
      if (
        message.sender_id !== currentUser.id && 
        (!selectedUser || message.sender_id !== selectedUser.id)
      ) {
        setNotifications(prev => new Set([...prev, message.sender_id]));
      }
    };

    socket.on("receive_message", handleNewMessage);

    return () => {
      socket.off("receive_message", handleNewMessage);
    };
  }, [currentUser, selectedUser]);

  // Clear notification when selecting a user
  const handleUserClick = (user) => {
    setNotifications(prev => {
      const newNotifications = new Set(prev);
      newNotifications.delete(user.id);
      return newNotifications;
    });
    handleUserSelect(user);
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(true);

    try {
      if (query.trim()) {
        const { data } = await api.get(`/api/users/users?search=${query}`);
        setSearchResults(data);
      } else {
        setSearchResults([]); // Clear results if search is empty
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Use search results if there's a query, otherwise use all users
  const displayUsers = searchQuery ? searchResults : users;

  return (
    <div className="user-list">
      {currentUser && (
        <div className="current-user">
          <h3>Welcome, {currentUser.name}</h3>
        </div>
      )}
      
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <h4>Users</h4>
      {loading || isSearching ? (
        <p>Loading users...</p>
      ) : displayUsers.length === 0 ? (
        <p className="no-results">No users found</p>
      ) : (
        <div className="users-container">
          {displayUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className={`user-item ${selectedUser?.id === user.id ? "selected" : ""}`}
            >
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
              {notifications.has(user.id) && <span className="notification-dot" />}
            </div>
          ))}
        </div>
      )}
      
      <div className="logout-button-container">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserList;