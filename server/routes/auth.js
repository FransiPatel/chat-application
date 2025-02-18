const express = require("express");
const { register, login, logout } = require("../controllers");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/logout
router.post("/logout", auth, logout);

module.exports = router;
