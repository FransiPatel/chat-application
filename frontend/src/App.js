import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ChatBox from "./components/Chat/ChatBox";
import HomePage from "./pages/HomePage";
import socket from "./socket"; // Import socket from socket.js

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<ChatBox socket={socket} />} /> 
        <Route path="/chat/:receiver_id" element={<ChatBox />} />
      </Routes>
    </Router>
  );
}

export default App;
