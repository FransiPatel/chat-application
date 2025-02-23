const express = require('express');
const { getUsers, getCurrentUser } = require('../controllers');
const auth = require('../middleware/auth');
const { userLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/users', auth, userLimiter, getUsers);
router.get('/me', auth, getCurrentUser);

module.exports = router;
