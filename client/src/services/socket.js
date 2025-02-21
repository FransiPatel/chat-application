import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000"; // Match with your backend port

console.log("Initializing socket with URL:", SOCKET_URL);

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  auth: {
    token: localStorage.getItem("token")
  }
});

// Debug listeners
socket.on("connect", () => {
  console.log("Socket connected");
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
  console.error("Error details:", {
    message: error.message,
    type: error.type,
    description: error.description
  });
  
  if (error.message === "Authentication error") {
    console.log("Authentication failed, clearing storage");
    localStorage.clear();
    window.location.href = "/login";
  }
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

// Add delivery status handler
socket.on("message_delivered", (messageId) => {
  console.log("Message delivered:", messageId);
  // Emit an event to update the UI
  const event = new CustomEvent("messageDelivered", { detail: messageId });
  window.dispatchEvent(event);
});

// Debug socket state
setInterval(() => {
  console.log("Socket state:", {
    connected: socket.connected,
    disconnected: socket.disconnected,
    id: socket.id
  });
}, 10000);

// Export for use in other components
export default socket;