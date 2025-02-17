const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id); // Attach user to request

    if (!req.user) {
      return res.status(401).json({ error: "Invalid token." });
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Invalid token." });
  }
};

module.exports = authenticateUser;
