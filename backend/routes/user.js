const express = require('express');
const { getUsers, getCurrentUser } = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

// New route to fetch users
router.get('/users', auth, getUsers); // This will fetch all users
router.get('/me', auth, getCurrentUser);

module.exports = router;
