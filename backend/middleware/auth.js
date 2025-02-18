const redisClient = require("../config/redis");
const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Decode the token to get the user id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token exists in Redis
    const storedToken = await redisClient.get(`user:${decoded.id}:token`);

    if (!storedToken || storedToken !== token) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = decoded; // Attach user data to the request object
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authenticateUser;
