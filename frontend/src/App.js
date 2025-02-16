import { useEffect } from "react";
import socket from "./socket";

function App() {
  useEffect(() => {
    const userId = localStorage.getItem("userId"); // Get userId from local storage

    if (userId) {
      socket.emit("user_online", userId);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  return <h1>Chat App</h1>;
}

export default App;
