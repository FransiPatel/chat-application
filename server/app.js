require("dotenv").config();
const express = require("express");
const http = require("http");
const { initDB } = require("./models");
const routes = require('./routes');
const setupSocket = require("./socket/socket");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
// Routes
app.use('/api', routes);

// Initialize Database
initDB();

// Setup WebSocket connection
const io = setupSocket(server);
app.set("socketio", io); // Attach io instance to the app

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
