require("dotenv").config();
const express = require("express");
const http = require("http");
const { initDB } = require("./models");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");
const setupSocket = require("./socket/socket");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Initialize Database
initDB();

// Setup WebSocket connection
const io = setupSocket(server);
app.set("socketio", io); // Attach io instance to the app

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
