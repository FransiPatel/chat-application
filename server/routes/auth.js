const express = require("express");
const { register, login, logout } = require("../controllers");
const auth = require("../middleware/auth");
const { loginLimiter } = require("../middleware/rateLimit");

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", loginLimiter, login);

// POST /api/auth/logout
router.post("/logout", auth, logout);

module.exports = router;
