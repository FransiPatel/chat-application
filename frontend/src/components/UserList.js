const UserList = ({ users }) => {
    return (
      <div>
        <h3>Users</h3>
        {users.map((user) => (
          <p key={user.id}>
            {user.name} {user.status === "online" ? "🟢" : "🔴"}
          </p>
        ))}
      </div>
    );
  };
  
  export default UserList;
  