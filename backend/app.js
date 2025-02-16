require("dotenv").config();
const express = require("express");
const http = require("http");
const { initDB } = require("./src/models");
const userRoutes = require("./src/routes/userRoutes");
const messageRoutes = require("./src/routes/messageRoutes");
const setupSocket = require("./src/socket/socket");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Initialize Database
initDB();

// Setup WebSocket connection
const io = setupSocket(server);
app.set("socketio", io); // Attach io instance to the app

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
