import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import api from "../services/api";
import ChatBox from "../components/Chat/ChatBox";
import UserList from "../components/UserList";

const ChatPage = () => {
  const socket = useSocket();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await api.get("/users");
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <UserList users={users} />
      <ChatBox socket={socket} />
    </div>
  );
};

export default ChatPage;
