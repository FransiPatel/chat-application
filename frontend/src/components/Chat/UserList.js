import React from "react";
import { useNavigate } from "react-router-dom";

const UserList = ({ users, currentUser, selectedUser, handleUserSelect, loading }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="user-list">
      {currentUser && (
        <div className="current-user">
          <h3>Welcome, {currentUser.name}</h3>
        </div>
      )}
      <h4>Users</h4>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div>
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className={`user-item ${selectedUser?.id === user.id ? "selected" : ""}`}
            >
              <span className="user-name">{user.name}</span>
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