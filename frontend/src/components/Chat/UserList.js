import React from "react";

const UserList = ({ users, currentUser, handleUserSelect, loading }) => {
  return (
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
        <button onClick={() => window.location.href = "/login"} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserList;